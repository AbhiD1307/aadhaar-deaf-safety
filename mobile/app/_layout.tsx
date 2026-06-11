import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertProvider } from '../src/context/AlertContext';
import EmergencyOverlay from '../src/components/EmergencyOverlay';

export default function RootLayout() {
  return (
    <AlertProvider>
      <StatusBar style="light" backgroundColor="#0D0D0D" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0D0D0D' } }}>
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="onboarding/permissions" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sos" options={{ presentation: 'modal' }} />
      </Stack>
      <EmergencyOverlay />
    </AlertProvider>
  );
}
