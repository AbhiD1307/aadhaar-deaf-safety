import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Alert as RNAlert, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { getSocket } from '../services/socket';
import { api } from '../services/api';

export interface AlertEvent {
  id: string;
  eventType: string;
  riskLevel: 'high' | 'medium' | 'low';
  location: string;
  summary: string;
  actions: string[];
  timestamp: string;
  dismissed: boolean;
}

interface AlertContextValue {
  alerts: AlertEvent[];
  activeEmergency: AlertEvent | null;
  isListening: boolean;
  dismissAlert: (id: string) => void;
  clearEmergency: () => void;
  simulateAlert: (type: string) => void;
  deviceStatus: 'all_clear' | 'warning' | 'danger';
}

const AlertContext = createContext<AlertContextValue>({} as AlertContextValue);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<AlertEvent | null>(null);
  const [isListening, setIsListening] = useState(true);
  const vibrationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerEmergencyHaptics = useCallback(() => {
    // SOS pattern: ...---... (short-short-short, long-long-long, short-short-short)
    const pattern = [0, 200, 100, 200, 100, 200, 300, 600, 300, 600, 300, 600, 300, 200, 100, 200, 100, 200];
    Vibration.vibrate(pattern, true);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {}
  }, []);

  const handleNewAlert = useCallback((alert: AlertEvent) => {
    setAlerts((prev) => {
      const exists = prev.find((a) => a.id === alert.id);
      if (exists) return prev;
      return [alert, ...prev];
    });

    if (alert.riskLevel === 'high' && !alert.dismissed) {
      setActiveEmergency(alert);
      triggerEmergencyHaptics();

      // Local notification
      Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ ${formatEventType(alert.eventType)}`,
          body: alert.summary,
          data: { alertId: alert.id },
        },
        trigger: null,
      }).catch(() => {});
    } else if (alert.riskLevel === 'medium') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }
  }, [triggerEmergencyHaptics]);

  useEffect(() => {
    // Load initial alerts
    api.getAlerts({ limit: 30 }).then(setAlerts).catch(() => {});

    // Setup WebSocket
    const socket = getSocket();

    socket.on('alert', handleNewAlert);
    socket.on('alerts_history', (history: AlertEvent[]) => setAlerts(history));
    socket.on('connect', () => setIsListening(true));
    socket.on('disconnect', () => setIsListening(false));
    socket.on('alert_dismissed', ({ alertId }: { alertId: string }) => {
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a)));
      setActiveEmergency((e) => (e?.id === alertId ? null : e));
    });

    return () => {
      socket.off('alert', handleNewAlert);
      socket.off('alerts_history');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('alert_dismissed');
      Vibration.cancel();
    };
  }, [handleNewAlert]);

  const dismissAlert = useCallback((id: string) => {
    api.dismissAlert(id).catch(() => {});
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
    if (activeEmergency?.id === id) {
      setActiveEmergency(null);
      Vibration.cancel();
    }
  }, [activeEmergency]);

  const clearEmergency = useCallback(() => {
    if (activeEmergency) dismissAlert(activeEmergency.id);
    Vibration.cancel();
    setActiveEmergency(null);
  }, [activeEmergency, dismissAlert]);

  const simulateAlert = useCallback(async (type: string) => {
    try {
      await api.simulateAlert(type, 'Living Room');
    } catch (err: any) {
      RNAlert.alert('Simulation failed', err.message);
    }
  }, []);

  const deviceStatus: 'all_clear' | 'warning' | 'danger' = activeEmergency
    ? activeEmergency.riskLevel === 'high' ? 'danger' : 'warning'
    : 'all_clear';

  return (
    <AlertContext.Provider value={{ alerts, activeEmergency, isListening, dismissAlert, clearEmergency, simulateAlert, deviceStatus }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  return useContext(AlertContext);
}

function formatEventType(type: string): string {
  const map: Record<string, string> = {
    fire_alarm: 'Fire Alarm',
    co_alarm: 'CO Gas Alert',
    glass_break: 'Glass Break',
    intruder: 'Intruder Alert',
    motion: 'Motion Detected',
    doorbell: 'Doorbell',
    baby_cry: 'Baby Crying',
  };
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
