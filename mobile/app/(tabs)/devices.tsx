import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';

interface Device {
  id: string;
  name: string;
  location: string;
  type: string;
  enabled: boolean;
  color: string;
}

const DEVICE_ICONS: Record<string, string> = {
  fire_alarm: 'flame',
  co_detector: 'warning',
  motion: 'walk',
  smart_bulb: 'bulb',
  doorbell: 'home',
  glass_break: 'sad',
};

export default function DevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      const data = await api.getDevices();
      setDevices(data);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDevice(device: Device) {
    const updated = { ...device, enabled: !device.enabled };
    setDevices((prev) => prev.map((d) => (d.id === device.id ? updated : d)));
    try {
      await api.updateDevice(device.id, { enabled: updated.enabled });
    } catch {
      // Revert on failure
      setDevices((prev) => prev.map((d) => (d.id === device.id ? device : d)));
    }
  }

  function addDevicePrompt() {
    Alert.prompt(
      'Add Device',
      'Enter device name:',
      async (name) => {
        if (!name) return;
        const device = await api.addDevice({ name, type: 'motion', location: 'Unknown' });
        setDevices((prev) => [...prev, device]);
      }
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Devices & sensors</Text>
        <Ionicons name="sync-circle" size={28} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {devices.map((device) => (
          <View key={device.id} style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: device.color + '33' }]}>
              <Ionicons
                name={(DEVICE_ICONS[device.type] || 'hardware-chip') as any}
                size={20}
                color={device.color}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceLocation}>{device.location}</Text>
            </View>
            <Switch
              value={device.enabled}
              onValueChange={() => toggleDevice(device)}
              trackColor={{ false: colors.toggleOff, true: colors.toggleOn }}
              thumbColor="#fff"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addBtn} onPress={addDevicePrompt}>
          <Ionicons name="add" size={20} color={colors.primary} />
          <Text style={styles.addText}>+ Add device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 12 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  list: { padding: 16, paddingTop: 4, gap: 10, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.cardBorder },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  deviceName: { color: colors.text, fontSize: 15, fontWeight: '600' },
  deviceLocation: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', borderRadius: 14, padding: 14, gap: 8, marginTop: 4 },
  addText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});
