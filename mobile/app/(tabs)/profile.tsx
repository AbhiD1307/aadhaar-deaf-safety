import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState({ flashLights: true, vibration: true, watchAlerts: true });

  useEffect(() => {
    api.getUser('user_demo').then((u) => {
      setUser(u);
      if (u?.settings) setSettings({ flashLights: u.settings.flashLights ?? true, vibration: u.settings.vibration ?? true, watchAlerts: u.settings.watchAlerts ?? true });
    }).catch(() => {});
  }, []);

  async function toggleSetting(key: keyof typeof settings) {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try { await api.updateSettings(updated); } catch {}
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile & settings</Text>
        <Ionicons name="sync-circle" size={28} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.avatar || 'AD'}</Text>
          </View>
          <View>
            <Text style={styles.profileName}>{user?.name || 'Abhishek Deshmukh'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'deshmukh.abhishek152@gmail.com'}</Text>
          </View>
        </View>

        {/* Alert Settings */}
        <Text style={styles.sectionLabel}>Alerts</Text>
        <View style={styles.card}>
          <SettingRow
            label="Flash lights"
            sublabel="On emergency"
            value={settings.flashLights}
            onToggle={() => toggleSetting('flashLights')}
          />
          <View style={styles.divider} />
          <SettingRow
            label="Vibration"
            sublabel="Phone & watch"
            value={settings.vibration}
            onToggle={() => toggleSetting('vibration')}
          />
        </View>

        {/* Emergency */}
        <Text style={styles.sectionLabel}>Emergency</Text>
        <View style={styles.card}>
          <NavRow
            label="Trusted contacts"
            sublabel={`${user?.trustedContacts?.length || 0} added`}
            onPress={() => Alert.alert('Trusted Contacts', user?.trustedContacts?.map((c: any) => `${c.name} (${c.relation})`).join('\n') || 'None')}
          />
          <View style={styles.divider} />
          <NavRow
            label="Medical info"
            sublabel="For SOS dispatch"
            onPress={() => Alert.alert('Medical Info', JSON.stringify(user?.settings?.medicalInfo || {}, null, 2))}
          />
        </View>

        {/* About */}
        <Text style={styles.sectionLabel}>App</Text>
        <View style={styles.card}>
          <NavRow label="About Aadhaar" sublabel="v1.0.0 · 🏆 UW Hackathon Winner" onPress={() => {}} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, sublabel, value, onToggle }: { label: string; sublabel: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.settingRow}>
      <View>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingSublabel}>{sublabel}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ false: colors.toggleOff, true: colors.toggleOn }} thumbColor="#fff" />
    </View>
  );
}

function NavRow({ label, sublabel, onPress }: { label: string; sublabel: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <View>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingSublabel}>{sublabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 12 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  scroll: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.cardBorder },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  profileName: { color: colors.text, fontSize: 18, fontWeight: '700' },
  profileEmail: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  sectionLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.cardBorder, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingLabel: { color: colors.text, fontSize: 15, fontWeight: '500' },
  settingSublabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginHorizontal: 16 },
});
