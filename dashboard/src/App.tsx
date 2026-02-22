import { useSSE } from './hooks/useSSE';
import { DeviceCard } from './components/DeviceCard';
import { StatusBar } from './components/StatusBar';
import './App.css';

const API_URL = 'http://localhost:3000/echolite/status/stream';

function App() {
  const { data, error, isConnected } = useSSE(API_URL);

  return (
    <div className="app">
      <h1>🏠 Echolite Smart Home Monitor</h1>

      <StatusBar
        connected={data?.connected ?? false}
        lastUpdate={data?.timestamp ?? null}
        sseConnected={isConnected}
      />

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!data && !error && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Connecting to server...</p>
        </div>
      )}

      {data && data.devices.length === 0 && (
        <div className="no-devices">No devices found</div>
      )}

      {data && data.devices.map((device) => (
        <DeviceCard key={`${device.address}-${device.deviceClass}`} device={device} />
      ))}
    </div>
  );
}

export default App;
