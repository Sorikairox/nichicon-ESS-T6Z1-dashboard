export interface PropertyValue {
  value: number | { type: 'Buffer'; data: number[] } | null;
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

export interface SystemStatus {
  timestamp: string;
  devices: DeviceResult[];
  connected: boolean;
}
