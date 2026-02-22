import { DeviceDefinition } from './types';

export const PROPERTY_DEFINITIONS: Record<string, DeviceDefinition> = {
  '0x7d': {
    name: 'Storage Battery',
    properties: {
      // 0x80: { name: 'operationStatus', unit: null, type: 'status' },
      0xe2: { name: 'remainingElectricity_Wh', unit: 'Wh', type: 'number' },
      0xe4: { name: 'remainingElectricity_Percent', unit: '%', type: 'number' },
      0xe5: { name: 'batteryStateOfHealth', unit: '%', type: 'number' },
      0xd3: {
        name: 'instantaneousChargingDischargingPower',
        unit: 'W',
        type: 'signed',
      },
      // 0xd0: { name: 'ratedElectricEnergy', unit: 'Wh', type: 'number' },
      // 0xd2: { name: 'ratedVoltage', unit: 'V', type: 'number' },
      // 0xe6: { name: 'batteryType', unit: null, type: 'code' },
      // 0xd6: { name: 'cumulativeDischargingEnergy', unit: 'Wh', type: 'number' },
      // 0xd8: { name: 'cumulativeChargingEnergy', unit: 'Wh', type: 'number' },
      // 0xda: { name: 'operationMode', unit: null, type: 'code' },
      // 0x88: { name: 'faultStatus', unit: null, type: 'status' },
      // 0x81: { name: 'installationLocation', unit: null, type: 'code' },
    },
  },
  '0x79': {
    name: 'Solar Power Generation',
    properties: {
      // 0x80: { name: 'operationStatus', unit: null, type: 'status' },
      0xe0: { name: 'instantaneousPowerGenerated', unit: 'W', type: 'number' },
      // 0xe1: { name: 'cumulativeEnergyGenerated', unit: 'kWh', type: 'number' },
      // 0xe3: { name: 'cumulativeEnergySold', unit: 'kWh', type: 'number' },
      // 0xe8: { name: 'ratedPowerOutput', unit: 'W', type: 'number' },
      // 0x88: { name: 'faultStatus', unit: null, type: 'status' },
      // 0x81: { name: 'installationLocation', unit: null, type: 'code' },
    },
  },
  '0xa5': {
    name: 'Low-voltage Smart Electric Energy Meter',
    properties: {
      // 0x80: { name: 'operationStatus', unit: null, type: 'status' },
      // 0x88: { name: 'faultStatus', unit: null, type: 'status' },
      // 0x81: { name: 'installationLocation', unit: null, type: 'code' },
    },
  },
};
