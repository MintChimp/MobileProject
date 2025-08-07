import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerTintColor: '#fff',
      headerStyle: { backgroundColor: '#262135' },
      tabBarActiveTintColor: '#fff',
      tabBarInactiveTintColor: '#888',
      tabBarStyle: { backgroundColor: '#262135' },
      tabBarLabelStyle: { fontSize: 14 }}}>

      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => (
        <Ionicons name="home-outline" size={size} color={color} />
      ) }} />
      <Tabs.Screen name="notes" options={{ title: 'Notes', tabBarIcon: ({ color, size}) => (
        <Ionicons name="document-text-outline" size={size} color={color} />
      ) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => (
        <Ionicons name="person-outline" size={size} color={color} />
      ) }} />
      <Tabs.Screen name="signin" options={{ title: 'Sign in' }} />
      <Tabs.Screen name="signup" options={{ title: 'Sign Up' }} />
    </Tabs>
  );
}
