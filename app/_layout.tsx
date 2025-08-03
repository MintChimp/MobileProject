import { Tabs } from 'expo-router'

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="(tabs)/index" options={{ title: 'Home' }} />
      <Tabs.Screen name="(tabs)/notes" options={{ title: 'Notes' }} />
      <Tabs.Screen name="(tabs)/profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="(tabs)/signin.tsx" options={{ title: 'Sign In' }} />
      <Tabs.Screen name="(tabs)/signup.tsx" options={{ title: 'Sign Up' }} />
    </Tabs>
  );
}
