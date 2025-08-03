import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="signin" options={{ title: 'Sign In' }} />
      <Tabs.Screen name="signup" options={{ title: 'Sign Up' }} />
    </Tabs>
  );
}
