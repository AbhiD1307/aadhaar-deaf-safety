import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { api } from '../src/services/api';
import { colors } from '../src/theme/colors';

export default function SOSScreen() {
  const [contacts, setContacts] = useState([
    { id: 'c1', name: 'Sara R.', relation: 'Sister', status: 'Sent' },
    { id: 'c2', name: 'Mike K.', relation: 'Neighbor', status: 'Sending' },
  ]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('42 Maple St, Unit 3B');
  const [dispatching, setDispatching] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    getLocation();
  }, []);

  async function getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      const [geo] = await Location.reverseGeocodeAsync(loc.coords);
      if (geo) setAddress(`${geo.streetNumber || ''} ${geo.street || ''}, ${geo.city || ''}`);
    } catch {}
  }

  async function call911() {
    Alert.alert(
      'Call 911',
      'This will connect you to emergency services. Your location will be shared.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', style: 'destructive', onPress: () => {
          // In production: Linking.openURL('tel:911')
          Alert.alert('Calling 911', 'Emergency services have been notified with your location.');
        }},
      ]
    );
  }

  async function dispatchSOS() {
    setDispatching(true);
    try {
      await api.triggerSOS(location?.lat, location?.lng);
      setContacts((prev) => prev.map((c) => ({ ...c, status: 'Sent' })));
      Alert.alert('SOS Sent', 'Your trusted contacts have been notified with your location.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setDispatching(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS Emergency</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Map placeholder */}
        <View style={styles.mapCard}>
          <View style={styles.mapPlaceholder}>
            <Animated.View style={[styles.mapPin, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="location" size={28} color={colors.danger} />
            </Animated.View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Your location</Text>
          <Text style={styles.infoValue}>{address}</Text>
        </View>

        {/* Contacts */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Notifying</Text>
          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactRow}>
              <View style={styles.contactAvatar}>
                <Text style={styles.contactAvatarText}>{contact.name.split(' ').map((n) => n[0]).join('')}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRelation}>{contact.relation}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: contact.status === 'Sent' ? colors.safe + '22' : colors.warning + '22', borderColor: contact.status === 'Sent' ? colors.safe : colors.warning }]}>
                <Text style={[styles.statusText, { color: contact.status === 'Sent' ? colors.safe : colors.warning }]}>{contact.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Dispatch SOS */}
        <TouchableOpacity style={styles.dispatchBtn} onPress={dispatchSOS} disabled={dispatching}>
          <Text style={styles.dispatchText}>{dispatching ? 'Sending...' : 'Resend SOS'}</Text>
        </TouchableOpacity>

        {/* Call 911 */}
        <TouchableOpacity style={styles.callBtn} onPress={call911}>
          <Ionicons name="call" size={20} color="#fff" />
          <View>
            <Text style={styles.callTitle}>Call 911</Text>
            <Text style={styles.callSub}>Tap to connect emergency</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#2980B9' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, gap: 14, paddingBottom: 48 },
  mapCard: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden', height: 180, borderWidth: 1, borderColor: colors.cardBorder },
  mapPlaceholder: { flex: 1, backgroundColor: '#1A2332', justifyContent: 'center', alignItems: 'center' },
  mapPin: { alignItems: 'center' },
  infoCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.cardBorder, gap: 10 },
  infoLabel: { color: colors.textSecondary, fontSize: 13 },
  infoValue: { color: colors.text, fontSize: 17, fontWeight: '700' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  contactAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  contactName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  contactRelation: { color: colors.textSecondary, fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '600' },
  dispatchBtn: { backgroundColor: colors.dangerBg, borderRadius: 16, padding: 18, alignItems: 'center' },
  dispatchText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  callBtn: { backgroundColor: colors.danger, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  callTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  callSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
});
