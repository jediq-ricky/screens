"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface SSEOptions {
  url: string;
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: (event: Event) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useSSE(options: SSEOptions) {
  const {
    url,
    onMessage,
    onError,
    onOpen,
    reconnect = true,
    reconnectInterval = 5000,
  } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnect = useRef(reconnect);

  useEffect(() => {
    shouldReconnect.current = reconnect;
  }, [reconnect]);

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = (event) => {
      setIsConnected(true);
      onOpen?.(event);

      // Clear any pending reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    eventSource.onmessage = (event) => {
      onMessage?.(event);
    };

    eventSource.onerror = (error) => {
      setIsConnected(false);
      onError?.(error);

      // Attempt to reconnect if enabled
      if (shouldReconnect.current && !reconnectTimeoutRef.current) {
        eventSource.close();
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, reconnectInterval);
      }
    };
  };

  const disconnect = () => {
    shouldReconnect.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
  };

  // Subscribe to specific event types
  const addEventListener = useCallback((eventType: string, listener: (event: MessageEvent) => void) => {
    const eventSource = eventSourceRef.current;
    if (eventSource) {
      eventSource.addEventListener(eventType, listener as EventListener);
    }
  }, []);

  // Remove event listener
  const removeEventListener = useCallback((eventType: string, listener: (event: MessageEvent) => void) => {
    const eventSource = eventSourceRef.current;
    if (eventSource) {
      eventSource.removeEventListener(eventType, listener as EventListener);
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [url]); // Reconnect if URL changes

  return {
    isConnected,
    disconnect,
    reconnect: connect,
    addEventListener,
    removeEventListener,
  };
}
