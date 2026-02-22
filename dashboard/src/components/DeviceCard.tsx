import { DeviceResult } from '../types';
import './DeviceCard.css';

interface DeviceCardProps {
  device: DeviceResult;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object' && value.type === 'Buffer') {
      return '[Buffer]';
    }
    return String(value);
  };

  if (Object.keys(device.properties).length === 0) return (<></>);

  return (
    <div className="device-card">
      <div className="device-header">
        <div>
          <div className="device-type">{device.deviceType}</div>
          <div className="device-info">
            Class: {device.deviceClass} | Address: {device.address}
          </div>
        </div>
        <div className="timestamp">
          {new Date(device.timestamp).toLocaleTimeString()}
        </div>
      </div>

      <div className="property-grid">
        {Object.entries(device.properties).map(([name, prop]) => (
          <div key={name} className="property">
            <div className="property-name">{name}</div>
            <div className="property-value">
              {formatValue(prop.value)}
              {prop.unit && <span className="property-unit">{prop.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {device.errors && device.errors.length > 0 && (
        <div className="error">
          <strong>Errors:</strong>
          <ul>
            {device.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
