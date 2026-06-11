import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAlerts } from '../context/AlertContext';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const EVENT_ICONS: Record<string, string> = {
  fire_alarm: 'flame',
  co_alarm: 'warning',
  glass_break: 'sad',
  intruder: 'alert-circle',
  motion: 'walk',
  doorbell: 'home',
};

export default function EmergencyOverlay() {
  const { activeEmergency, clearEmergency } = useAlerts();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (activeEmergency) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start();
    }
  }, [activeEmergency]);

  if (!activeEmergency) return null;

  const icon = EVENT_ICONS[activeEmergency.eventType] || 'alert-circle';
  const title = formatEventType(activeEmergency.eventType);

  return (
    <Modal transparent animationType="fade" visible={!!activeEmergency}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
          {/* Alert Icon */}
          <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle" size={36} color="#fff" />
            </View>
          </Animated.View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Detected · {activeEmergency.location}</Text>

          {/* Action steps */}
          <View style={styles.steps}>
            <Step color={colors.danger} text="Alarm sound detected" />
            <Step color={colors.blue} text="Room lights activated" />
            <Step color={colors.safe} text="Vibration sent" />
          </View>

          {/* SOS Button */}
          <TouchableOpacity
            style={styles.sosBtn}
            onPress={() => {
              router.push('/sos');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.sosBtnText}>Send SOS</Text>
          </TouchableOpacity>

          {/* Dismiss */}
          <TouchableOpacity style={styles.dismissBtn} onPress={clearEmergency}>
            <Text style={styles.dismissText}>False alarm — dismiss</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Step({ color, text }: { color: string; text: string }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepDot, { backgroundColor: color }]} />
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

function formatEventType(type: string) {
  const map: Record<string, string> = { fire_alarm: 'Fire Alarm', co_alarm: 'CO Gas Alert', glass_break: 'Glass Break', intruder: 'Intruder Alert', motion: 'Motion Detected', doorbell: 'Doorbell' };
  return map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#C0392B', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 48 },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 15, textAlign: 'center', marginBottom: 24, marginTop: 4 },
  steps: { gap: 10, marginBottom: 28 },
  step: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, gap: 12 },
  stepDot: { width: 10, height: 10, borderRadius: 5 },
  stepText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  sosBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 14 },
  sosBtnText: { color: '#C0392B', fontSize: 18, fontWeight: '800' },
  dismissBtn: { alignItems: 'center', paddingVertical: 8 },
  dismissText: { color: 'rgba(255,255,255,0.65)', fontSize: 14 },
});
