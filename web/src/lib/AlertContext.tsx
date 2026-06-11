"use client";

import React, {
  createContext, useContext, useEffect, useState, useCallback, useRef,
} from "react";
import { io, Socket } from "socket.io-client";

export type RiskLevel = "high" | "medium" | "low";

export interface AlertEvent {
  id: string;
  eventType: string;
  riskLevel: RiskLevel;
  location: string;
  summary: string;
  actions: string[];
  timestamp: string;
  dismissed: boolean;
  logOnly?: boolean;
}

interface AlertContextValue {
  alerts: AlertEvent[];
  activeEmergency: AlertEvent | null;
  connected: boolean;
  clearEmergency: () => void;
  dismissAlert: (id: string) => void;
  simulateAlert: (type: string, location?: string) => Promise<void>;
}

const AlertContext = createContext<AlertContextValue>({} as AlertContextValue);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<AlertEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const handleNewAlert = useCallback((alert: AlertEvent) => {
    setAlerts((prev) => {
      if (prev.find((a) => a.id === alert.id)) return prev;
      return [alert, ...prev];
    });
    if (alert.riskLevel === "high" && !alert.dismissed) {
      setActiveEmergency(alert);
    }
  }, []);

  useEffect(() => {
    // Load history
    fetch(`${API}/api/alerts?limit=40`)
      .then((r) => r.json())
      .then(setAlerts)
      .catch(() => {});

    const socket = io(API, { transports: ["websocket"], reconnection: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("alert", handleNewAlert);
    socket.on("alerts_history", (h: AlertEvent[]) => setAlerts(h));
    socket.on("alert_dismissed", ({ alertId }: { alertId: string }) => {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)));
      setActiveEmergency((e) => (e?.id === alertId ? null : e));
    });

    return () => { socket.disconnect(); };
  }, [handleNewAlert]);

  const dismissAlert = useCallback((id: string) => {
    fetch(`${API}/api/alerts/${id}/dismiss`, { method: "POST" }).catch(() => {});
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
    setActiveEmergency((e) => (e?.id === id ? null : e));
  }, []);

  const clearEmergency = useCallback(() => {
    if (activeEmergency) dismissAlert(activeEmergency.id);
  }, [activeEmergency, dismissAlert]);

  const simulateAlert = useCallback(async (type: string, location = "Living Room") => {
    const res = await fetch(`${API}/api/alerts/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, location }),
    });
    if (!res.ok) throw new Error(await res.text());
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, activeEmergency, connected, clearEmergency, dismissAlert, simulateAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() { return useContext(AlertContext); }

export function formatEventType(type: string): string {
  const map: Record<string, string> = {
    fire_alarm: "Fire Alarm", co_alarm: "CO Gas Alert", glass_break: "Glass Break",
    intruder: "Intruder Alert", motion: "Motion Detected", doorbell: "Doorbell", baby_cry: "Baby Cry",
  };
  return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function riskColor(level: RiskLevel): string {
  return level === "high" ? "#ef4444" : level === "medium" ? "#f59e0b" : "#3b82f6";
}
