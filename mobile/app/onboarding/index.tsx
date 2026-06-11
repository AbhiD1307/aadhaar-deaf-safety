import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={styles.logo}>aadhar</Text>
        <Text style={styles.tagline}>Making every emergency visible.</Text>
      </Animated.View>

      <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/onboarding/permissions')}>
          <Text style={styles.primaryBtnText}>Get started</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between', paddingVertical: 80, paddingHorizontal: 32 },
  logoWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 52, fontWeight: '800', color: colors.primary, letterSpacing: -2 },
  tagline: { color: colors.textSecondary, fontSize: 16, marginTop: 12, textAlign: 'center' },
  buttons: { gap: 16 },
  primaryBtn: { backgroundColor: colors.text, borderRadius: 14, padding: 18, alignItems: 'center' },
  primaryBtnText: { color: colors.bg, fontSize: 17, fontWeight: '800' },
  signInText: { color: colors.textSecondary, fontSize: 15, textAlign: 'center' },
});
