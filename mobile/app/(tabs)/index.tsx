import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAlerts } from '../../src/context/AlertContext';
import { colors } from '../../src/theme/colors';

const SENSOR_ICONS: Record<string, string> = {
  fire_alarm: 'flame',
  co_detector: 'warning',
  motion: 'walk',
  doorbell: 'home',
};

export default function HomeScreen() {
  const { alerts, deviceStatus, isListening, simulateAlert } = useAlerts();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    if (isListening) pulse.start();
    else pulse.stop();
    return () => pulse.stop();
  }, [isListening]);

  const todayAlerts = alerts.filter(
    (a) => new Date(a.timestamp).toDateString() === new Date().toDateString()
  );

  const sensors = [
    { label: 'Fire alarm', status: 'Normal', color: colors.safe, icon: 'flame' },
    { label: 'CO level', status: 'Normal', color: colors.safe, icon: 'warning' },
    { label: 'Motion', status: 'None', color: colors.textSecondary, icon: 'walk' },
    { label: 'Doorbell', status: 'Ready', color: colors.text, icon: 'home' },
  ];

  const statusColor = deviceStatus === 'danger' ? colors.danger
    : deviceStatus === 'warning' ? colors.warning : colors.safe;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>aadhar</Text>
          <View style={styles.headerRight}>
            <Animated.View style={[styles.listeningBadge, { transform: [{ scale: pulseAnim }] }]}>
              <View style={[styles.dot, { backgroundColor: isListening ? colors.safe : colors.textMuted }]} />
              <Text style={styles.listeningText}>{isListening ? 'Listening' : 'Offline'}</Text>
            </Animated.View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </View>
        </View>

        {/* Status Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Current status</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {deviceStatus === 'danger' ? 'Danger' : deviceStatus === 'warning' ? 'Warning' : 'All clear'}
            </Text>
            <View style={[styles.safeBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
              <Text style={[styles.safeBadgeText, { color: statusColor }]}>
                {deviceStatus === 'all_clear' ? 'Safe' : deviceStatus.charAt(0).toUpperCase() + deviceStatus.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Sensors Grid */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Sensors</Text>
          <View style={styles.sensorGrid}>
            {sensors.map((sensor) => (
              <View key={sensor.label} style={styles.sensorItem}>
                <Text style={styles.sensorLabel}>{sensor.label}</Text>
                <Text style={[styles.sensorStatus, { color: sensor.color }]}>{sensor.status}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>Recent alerts</Text>
              <Text style={styles.alertCount}>{todayAlerts.length} today</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {todayAlerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={styles.alertRow}>
              <View style={[styles.alertDot, { backgroundColor: colors.riskColors[alert.riskLevel] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{formatEventType(alert.eventType)}</Text>
                <Text style={styles.alertLocation}>{alert.location}</Text>
              </View>
              <Text style={styles.alertTime}>{formatTime(alert.timestamp)}</Text>
            </View>
          ))}
          {todayAlerts.length === 0 && (
            <Text style={styles.emptyText}>No alerts today</Text>
          )}
        </View>

        {/* Test Simulator (dev) */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Test alerts</Text>
          <View style={styles.simRow}>
            {(['fire_alarm', 'co_alarm', 'motion', 'doorbell'] as const).map((type) => (
              <TouchableOpacity key={type} style={styles.simBtn} onPress={() => simulateAlert(type)}>
                <Text style={styles.simBtnText}>{type.replace('_', '\n')}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatEventType(type: string) {
  const map: Record<string, string> = { fire_alarm: 'Fire alarm', co_alarm: 'CO alarm', motion: 'Motion detected', doorbell: 'Doorbell', glass_break: 'Glass break' };
  return map[type] || type.replace(/_/g, ' ');
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 8 },
  logo: { fontSize: 28, fontWeight: '700', color: colors.primary, letterSpacing: -1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  listeningBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  listeningText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.cardBorder },
  cardLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusText: { fontSize: 26, fontWeight: '700' },
  safeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  safeBadgeText: { fontSize: 13, fontWeight: '600' },
  sensorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sensorItem: { width: '47%', backgroundColor: colors.inputBg, borderRadius: 12, padding: 12 },
  sensorLabel: { color: colors.textSecondary, fontSize: 12 },
  sensorStatus: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  alertCount: { fontSize: 22, fontWeight: '700', color: colors.text },
  viewAll: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  alertDot: { width: 10, height: 10, borderRadius: 5 },
  alertTitle: { color: colors.text, fontSize: 14, fontWeight: '600' },
  alertLocation: { color: colors.textSecondary, fontSize: 12 },
  alertTime: { color: colors.textMuted, fontSize: 12 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  simRow: { flexDirection: 'row', gap: 8 },
  simBtn: { flex: 1, backgroundColor: colors.inputBg, borderRadius: 10, padding: 10, alignItems: 'center' },
  simBtnText: { color: colors.text, fontSize: 11, textAlign: 'center', fontWeight: '500' },
});
