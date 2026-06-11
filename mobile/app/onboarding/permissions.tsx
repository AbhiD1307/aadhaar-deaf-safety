import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';

const PERMISSIONS = [
  { key: 'microphone', label: 'Microphone', sublabel: 'Sound detection', required: true },
  { key: 'location', label: 'Location', sublabel: 'SOS dispatch', required: true },
  { key: 'notifications', label: 'Notifications', sublabel: 'Alert delivery', required: true },
  { key: 'contacts', label: 'Contacts', sublabel: 'Trusted people', required: false },
];

export default function PermissionsScreen() {
  const [granted, setGranted] = useState<Set<string>>(new Set());

  async function requestAll() {
    const newGranted = new Set<string>();

    try {
      const { status: notifStatus } = await Notifications.requestPermissionsAsync();
      if (notifStatus === 'granted') newGranted.add('notifications');
    } catch {}

    try {
      const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
      if (locStatus === 'granted') newGranted.add('location');
    } catch {}

    // Microphone & contacts: always grant in Expo Go (requires native module)
    newGranted.add('microphone');
    newGranted.add('contacts');

    setGranted(newGranted);
    setTimeout(() => router.replace('/(tabs)'), 500);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Allow access</Text>
        <Text style={styles.subtitle}>Aadhar needs these to detect and alert you of emergencies.</Text>

        <View style={styles.list}>
          {PERMISSIONS.map((perm) => (
            <View key={perm.key} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.permLabel}>{perm.label}</Text>
                <Text style={styles.permSublabel}>{perm.sublabel}</Text>
              </View>
              <View style={[styles.badge, perm.required ? styles.badgeRequired : styles.badgeOptional]}>
                <Text style={[styles.badgeText, perm.required ? styles.badgeTextRequired : styles.badgeTextOptional]}>
                  {perm.required ? 'Required' : 'Optional'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.btn} onPress={requestAll}>
        <Text style={styles.btnText}>Allow all & continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  content: { flex: 1 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', marginBottom: 8, marginTop: 20 },
  subtitle: { color: colors.textSecondary, fontSize: 15, marginBottom: 32, lineHeight: 22 },
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.cardBorder },
  permLabel: { color: colors.text, fontSize: 15, fontWeight: '600' },
  permSublabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeRequired: { backgroundColor: colors.warning + '22', borderColor: colors.warning },
  badgeOptional: { backgroundColor: colors.cardBorder, borderColor: colors.textMuted },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextRequired: { color: colors.warning },
  badgeTextOptional: { color: colors.textMuted },
  btn: { backgroundColor: colors.primary, borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
