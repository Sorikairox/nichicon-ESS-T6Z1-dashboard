import './StatusBar.css';

interface StatusBarProps {
  connected: boolean;
  lastUpdate: string | null;
  sseConnected: boolean;
}

export function StatusBar({ connected, lastUpdate, sseConnected }: StatusBarProps) {
  return (
    <div className="status-bar">
      <div>
        Connection:{' '}
        <span className={connected ? 'status connected' : 'status disconnected'}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
        {' | '}
        SSE:{' '}
        <span className={sseConnected ? 'status connected' : 'status disconnected'}>
          {sseConnected ? 'Active' : 'Inactive'}
        </span>
      </div>
      {lastUpdate && (
        <span className="timestamp">
          Last updated: {new Date(lastUpdate).toLocaleString()}
        </span>
      )}
    </div>
  );
}
