import { SystemStatus } from '../types';
import './FlowDiagram.css';

interface FlowDiagramProps {
  data: SystemStatus;
}

interface FlowData {
  solarGeneration: number;
  batteryPower: number;
  toGrid: number;
  homeConsumption: number;
}

function calculateFlows(data: SystemStatus): FlowData {
  const battery = data.devices.find(d => d.deviceClass === '0x7d');
  const solar = data.devices.find(d => d.deviceClass === '0x79');

  const solarGeneration = solar?.properties.instantaneousPowerGenerated?.value as number || 0;
  const batteryPower = battery?.properties.instantaneousChargingDischargingPower?.value as number || 0;

  // Negative batteryPower = discharging (battery powering house), Positive = charging
  // toGrid = solar - battery charging
  const toGrid = solarGeneration - (batteryPower < 0 ? Math.abs(batteryPower) : 0);

  // Home consumption = solar + battery discharge - battery charge - to grid
  const homeConsumption = solarGeneration + (batteryPower > 0 ? batteryPower : 0);

  return {
    solarGeneration,
    batteryPower,
    toGrid: Math.max(0, toGrid),
    homeConsumption
  };
}

function formatPower(watts: number): string {
  if (watts === 0) return '0W';
  const absWatts = Math.abs(watts);
  if (absWatts >= 1000) {
    return `${(watts / 1000).toFixed(2)}kW`;
  }
  return `${watts.toFixed(0)}W`;
}

export function FlowDiagram({ data }: FlowDiagramProps) {
  const flows = calculateFlows(data);
  const isCharging = flows.batteryPower > 0; // Negative = charging
  const isDischarging = flows.batteryPower < 0; // Positive = discharging

  console.log(isCharging, isDischarging)
  const isGenerating = flows.solarGeneration > 0;
  const isExporting = flows.toGrid > 0;

  return (
    <div className="flow-diagram">
      <h2>⚡ Energy Flow</h2>
      <div className="flow-container">
        {/* Solar Panel */}
        <div className="flow-node solar">
          <div className="icon">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="30" width="80" height="50" fill="#FDB813" stroke="#333" strokeWidth="2" rx="4"/>
              <line x1="20" y1="40" x2="80" y2="40" stroke="#333" strokeWidth="1"/>
              <line x1="20" y1="55" x2="80" y2="55" stroke="#333" strokeWidth="1"/>
              <line x1="20" y1="70" x2="80" y2="70" stroke="#333" strokeWidth="1"/>
              <line x1="35" y1="30" x2="35" y2="80" stroke="#333" strokeWidth="1"/>
              <line x1="50" y1="30" x2="50" y2="80" stroke="#333" strokeWidth="1"/>
              <line x1="65" y1="30" x2="65" y2="80" stroke="#333" strokeWidth="1"/>
              <circle cx="50" cy="15" r="8" fill="#FFD700"/>
              <line x1="50" y1="7" x2="50" y2="2" stroke="#FFD700" strokeWidth="2"/>
              <line x1="56" y1="9" x2="60" y2="5" stroke="#FFD700" strokeWidth="2"/>
              <line x1="58" y1="15" x2="63" y2="15" stroke="#FFD700" strokeWidth="2"/>
            </svg>
          </div>
          <div className="label">Solar</div>
          <div className="value">{formatPower(flows.solarGeneration)}</div>
        </div>

        {/* Flow from Solar to Home */}
        {isGenerating && (
          <div className="flow-line solar-to-home">
            <div className="flow-path">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                <line x1="0" y1="10" x2="100" y2="10" stroke="#4CAF50" strokeWidth="3"/>
              </svg>
              <div className="flow-animation"></div>
            </div>
          </div>
        )}

        {/* Home */}
        <div className="flow-node home">
          <div className="icon">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M 50 10 L 90 45 L 80 45 L 80 85 L 20 85 L 20 45 L 10 45 Z" fill="#2196F3" stroke="#333" strokeWidth="2"/>
              <rect x="40" y="55" width="20" height="30" fill="#FFD700" stroke="#333" strokeWidth="2"/>
              <rect x="30" y="50" width="15" height="15" fill="#87CEEB" stroke="#333" strokeWidth="1"/>
              <rect x="55" y="50" width="15" height="15" fill="#87CEEB" stroke="#333" strokeWidth="1"/>
            </svg>
          </div>
          <div className="label">Home</div>
          <div className="value">{formatPower(flows.homeConsumption)}</div>
        </div>

        {/* Flow from Home to Grid */}
        {isExporting && (
          <div className="flow-line home-to-grid">
            <div className="flow-path">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                <line x1="0" y1="10" x2="100" y2="10" stroke="#FF9800" strokeWidth="3"/>
              </svg>
              <div className="flow-animation"></div>
            </div>
            <div className="flow-label">{formatPower(flows.toGrid)}</div>
          </div>
        )}

        {/* Grid */}
        <div className="flow-node grid">
          <div className="icon">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="35" fill="#9C27B0" stroke="#333" strokeWidth="2"/>
              <path d="M 30 30 L 50 50 L 30 70" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 50 50 L 70 35" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round"/>
              <path d="M 50 50 L 70 65" stroke="#FFD700" strokeWidth="4" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="label">Grid</div>
          <div className={`value ${isExporting ? 'exporting' : ''}`}>
            {isExporting ? `↑ ${formatPower(flows.toGrid)}` : '—'}
          </div>
        </div>

        {/* Flow from Solar to Battery */}
        {isCharging && (
          <div className="flow-line solar-to-battery">
            <div className="flow-path vertical">
              <svg viewBox="0 0 20 100" preserveAspectRatio="none">
                <line x1="10" y1="0" x2="10" y2="100" stroke="#4CAF50" strokeWidth="3"/>
              </svg>
              <div className="flow-animation"></div>
            </div>
            <div className="flow-label">{formatPower(Math.abs(flows.batteryPower))}</div>
          </div>
        )}

        {/* Flow from Battery to Home */}
        {isDischarging && (
          <div className="flow-line battery-to-home">
            <div className="flow-path vertical">
              <svg viewBox="0 0 20 100" preserveAspectRatio="none">
                <line x1="10" y1="0" x2="10" y2="100" stroke="#FF5722" strokeWidth="3"/>
              </svg>
              <div className="flow-animation discharge"></div>
            </div>
            <div className="flow-label">{formatPower(Math.abs(flows.batteryPower))}</div>
          </div>
        )}

        {/* Battery */}
        <div className="flow-node battery">
          <div className="icon">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect x="15" y="35" width="70" height="45" fill="#4CAF50" stroke="#333" strokeWidth="2" rx="4"/>
              <rect x="85" y="47" width="8" height="21" fill="#333" rx="2"/>
              <rect x="25" y="45" width="50" height="25" fill="#8BC34A" rx="2"/>
              <text x="50" y="62" fontSize="16" fill="#fff" textAnchor="middle" fontWeight="bold">
                {data.devices.find(d => d.deviceClass === '0x7d')?.properties.remainingElectricity_Percent?.value || 0}%
              </text>
            </svg>
          </div>
          <div className="label">Battery</div>
          <div className={`value ${isCharging ? 'charging' : isDischarging ? 'discharging' : ''}`}>
            {isDischarging && `↓ ${formatPower(flows.batteryPower)}`}
            {isCharging && `↑ ${formatPower(Math.abs(flows.batteryPower))}`}
            {!isCharging && !isDischarging && 'Idle'}
          </div>
        </div>
      </div>
    </div>
  );
}
