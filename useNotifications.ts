import { useEffect, useState, useCallback, useRef } from 'react';

export interface NotificationPayload {
  notification_id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'document_status';
  created_on: string;
}

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (!userId || socketRef.current?.readyState === WebSocket.OPEN) return;

    // Use the dynamic port 8001 we configured
    // If you add Token-based auth, you can append ?token=${token}
    const wsUrl = `ws://localhost:8001/api/notifications/ws/${userId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data: NotificationPayload = JSON.parse(event.data);
        console.log('New Notification:', data);

        // Add new notification to the top of the list
        setNotifications((prev) => [data, ...prev]);

        // Optional: Trigger a browser toast/alert here
        // toast.success(data.message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected. Retrying in 3s...');
      setIsConnected(false);
      // Auto-reconnect logic
      setTimeout(connect, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      ws.close();
    };

    socketRef.current = ws;
  }, [userId]);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  return { notifications, isConnected };
};