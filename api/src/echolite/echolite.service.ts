import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { promisify } from 'util';
import {
  DeviceResult,
  EOJ,
  PropertyDefinition,
  DiscoveryResponse,
  SystemStatus,
} from './types';
import { PROPERTY_DEFINITIONS } from './property-definitions';

const EchonetLite = require('node-echonet-lite');

@Injectable()
export class EcholiteService implements OnModuleInit {
  private readonly logger = new Logger(EcholiteService.name);
  private el: any;
  private initAsync: () => Promise<void>;
  private closeAsync: () => Promise<void>;
  private getPropertyValueAsync: (
    address: string,
    eoj: EOJ,
    epc: number,
  ) => Promise<any>;
  private connected = false;
  private deviceAddress: string | null = null;
  private deviceEOJs: EOJ[] = [];

  constructor() {
    this.el = new EchonetLite({ type: 'lan' });
    this.initAsync = promisify(this.el.init.bind(this.el));
    this.closeAsync = promisify(this.el.close.bind(this.el));
    this.getPropertyValueAsync = promisify(
      this.el.getPropertyValue.bind(this.el),
    );
  }

  async onModuleInit() {
    this.logger.log('Initializing Echolite service...');
    try {
      await this.initAsync();
      this.logger.log('Echolite initialized successfully');
      await this.discoverDevices();
    } catch (err) {
      this.logger.error('Failed to initialize Echolite', err);
    }
  }

  private async discoverDevices(): Promise<void> {
    this.logger.log('Starting device discovery...');
    try {
      const res = await this.startDiscoveryAsync();
      this.el.stopDiscovery();

      const device = res.device;
      this.deviceAddress = device.address;
      this.deviceEOJs = device.eoj;
      this.connected = true;

      this.logger.log(
        `Device discovered at ${this.deviceAddress} with ${this.deviceEOJs.length} EOJs`,
      );
    } catch (err) {
      this.logger.error('Failed to discover devices', err);
      this.connected = false;
    }
  }

  private startDiscoveryAsync(): Promise<DiscoveryResponse> {
    return new Promise((resolve, reject) => {
      this.el.startDiscovery((err: Error | null, res: DiscoveryResponse) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private parsePropertyValue(
    buffer: number[] | undefined,
    type: PropertyDefinition['type'],
  ): number | Buffer | null {
    if (!buffer) return null;

    const buf = Buffer.from(buffer);

    switch (type) {
      case 'number':
        if (buf.length === 1) return buf.readUInt8(0);
        if (buf.length === 2) return buf.readUInt16BE(0);
        if (buf.length === 4) return buf.readUInt32BE(0);
        return buf;
      case 'signed':
        if (buf.length === 2) return buf.readInt16BE(0);
        if (buf.length === 4) return buf.readInt32BE(0);
        return buf;
      case 'status':
      case 'code':
        return buf.readUInt8(0);
      default:
        return buf;
    }
  }

  private async getDevicePropertiesJSON(
    address: string,
    eoj: EOJ,
  ): Promise<DeviceResult> {
    const classCode = eoj[1];
    const classKey = `0x${classCode.toString(16)}`;

    const deviceDef = PROPERTY_DEFINITIONS[classKey];
    if (!deviceDef) {
      throw new Error(`Unknown device class: ${classKey}`);
    }

    const result: DeviceResult = {
      deviceType: deviceDef.name,
      deviceClass: classKey,
      address: address,
      timestamp: new Date().toISOString(),
      properties: {},
    };

    const propertyKeys = Object.keys(deviceDef.properties);
    const errors: string[] = [];

    // Fetch properties sequentially
    for (const epcStr of propertyKeys) {
      const epc = parseInt(epcStr);
      const propDef = deviceDef.properties[epc];

      if (!propDef) {
        continue;
      }

      try {
        const res: any = await this.getPropertyValueAsync(address, eoj, epc);

        const buffer = res.message?.prop?.[0]?.buffer;
        const value = this.parsePropertyValue(buffer, propDef.type);

        result.properties[propDef.name] = {
          value: value,
          unit: propDef.unit,
          code: `0x${epc.toString(16).toUpperCase()}`,
        };
      } catch (err) {
        errors.push(`${propDef.name}: ${(err as Error).message}`);
      }

      // Wait 50ms before sending next request
      await this.delay(50);
    }

    if (errors.length > 0) {
      result.errors = errors;
    }

    return result;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    if (!this.connected || !this.deviceAddress) {
      return {
        timestamp: new Date().toISOString(),
        devices: [],
        connected: false,
      };
    }

    const devices: DeviceResult[] = [];

    for (const eoj of this.deviceEOJs) {
      if (!eoj) continue;

      try {
        const deviceData = await this.getDevicePropertiesJSON(
          this.deviceAddress,
          eoj,
        );
        devices.push(deviceData);
      } catch (err) {
        this.logger.error('Error getting device properties', err);
      }
    }

    return {
      timestamp: new Date().toISOString(),
      devices,
      connected: true,
    };
  }

  isConnected(): boolean {
    return this.connected;
  }

  async onModuleDestroy() {
    this.logger.log('Shutting down Echolite service...');
    try {
      await this.closeAsync();
      this.logger.log('Echolite service closed');
    } catch (err) {
      this.logger.error('Error closing Echolite service', err);
    }
  }
}
