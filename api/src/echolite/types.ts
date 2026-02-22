export interface PropertyDefinition {
  name: string;
  unit: string | null;
  type: 'status' | 'number' | 'signed' | 'code';
}

export interface DeviceDefinition {
  name: string;
  properties: Record<number, PropertyDefinition>;
}

export interface PropertyValue {
  value: number | Buffer | null;
  unit: string | null;
  code: string;
}

export interface DeviceResult {
  deviceType: string;
  deviceClass: string;
  address: string;
  timestamp: string;
  properties: Record<string, PropertyValue>;
  errors?: string[];
}

export type EOJ = [number, number, number];

export interface EchonetDevice {
  address: string;
  eoj: EOJ[];
}

export interface DiscoveryResponse {
  device: EchonetDevice;
}

export interface SystemStatus {
  timestamp: string;
  devices: DeviceResult[];
  connected: boolean;
}
