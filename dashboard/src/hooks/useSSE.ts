import { useState, useEffect, useRef } from 'react';
import { SystemStatus } from '../types';

export function useSSE(url: string) {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Fetch initial data
    fetch(url.replace('/stream', ''))
      .then((res) => res.json())
      .then((initialData) => {
        setData(initialData);
        setError(null);
      })
      .catch((err) => {
        setError(`Error fetching initial status: ${err.message}`);
      });

    // Setup SSE connection
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE Connection opened');
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsedData: SystemStatus = JSON.parse(event.data);
        setData(parsedData);
        setError(null);
      } catch (err) {
        setError(`Error parsing SSE data: ${(err as Error).message}`);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setIsConnected(false);
      setError('Connection error');
    };

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [url]);

  return { data, error, isConnected };
}
