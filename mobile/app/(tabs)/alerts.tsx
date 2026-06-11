import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts, AlertEvent } from '../../src/context/AlertContext';
import { colors } from '../../src/theme/colors';

type Filter = 'All' | 'High' | 'Medium' | 'Low';

const EVENT_ICONS: Record<string, string> = {
  fire_alarm: 'flame',
  co_alarm: 'warning',
  glass_break: 'sad',
  intruder: 'alert-circle',
  motion: 'walk',
  doorbell: 'home',
  baby_cry: 'heart',
  smoke: 'cloud',
};

export default function AlertsScreen() {
  const { alerts, dismissAlert } = useAlerts();
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = alerts.filter((a) => {
    if (filter === 'All') return true;
    return a.riskLevel === filter.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alert history</Text>
        <Ionicons name="sync-circle" size={28} color={colors.primary} />
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {(['All', 'High', 'Medium', 'Low'] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <Text style={styles.empty}>No {filter.toLowerCase()} alerts</Text>
        )}
        {filtered.map((alert) => (
          <AlertRow key={alert.id} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function AlertRow({ alert, onDismiss }: { alert: AlertEvent; onDismiss: () => void }) {
  const dotColor = colors.riskColors[alert.riskLevel];
  const icon = EVENT_ICONS[alert.eventType] || 'notifications';

  return (
    <View style={[styles.row, alert.dismissed && styles.rowDimmed]}>
      <View style={[styles.iconCircle, { backgroundColor: dotColor + '22' }]}>
        <Ionicons name={icon as any} size={18} color={dotColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{formatEventType(alert.eventType)}</Text>
        <Text style={styles.rowSub}>{alert.location}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={styles.rowTime}>{formatDateTime(alert.timestamp)}</Text>
        {!alert.dismissed && (
          <TouchableOpacity onPress={onDismiss}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function formatEventType(type: string) {
  const map: Record<string, string> = {
    fire_alarm: 'Fire alarm', co_alarm: 'CO alarm', glass_break: 'Glass break',
    intruder: 'Intruder', motion: 'Motion detected', doorbell: 'Doorbell', baby_cry: 'Baby cry',
  };
  return map[type] || type.replace(/_/g, ' ');
}

function formatDateTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 12 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  list: { padding: 16, paddingTop: 4, gap: 10 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.cardBorder },
  rowDimmed: { opacity: 0.5 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  rowSub: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  rowTime: { color: colors.textMuted, fontSize: 12 },
  dismissText: { color: colors.primary, fontSize: 12, fontWeight: '500' },
});
