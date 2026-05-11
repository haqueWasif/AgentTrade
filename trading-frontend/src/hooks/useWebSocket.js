import { useEffect, useRef } from 'react';

export default function useWebSocket(url, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = new WebSocket(url);
    socketRef.current.onmessage = event => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    return () => socketRef.current.close();
  }, [url, onMessage]);

  return socketRef.current;
}