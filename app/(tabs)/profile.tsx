import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../_lib/supabaseClient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        Alert.alert('Error', 'Unable to load user data. Please sign in again.');
        router.replace('/signin');
        return;
      }

      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Error', error.message);
    } else {
      router.replace('/signin');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Ionicons name="person-circle-outline" size={64} color="#0A001A" style={styles.icon} />
      <Text style={styles.title}>Your Profile</Text>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.label}>Full Name:</Text>
        <Text style={styles.value}>{fullName}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B2ABC5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0A001A',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A001A',
  },
  value: {
    fontSize: 18,
    color: '#333',
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 40,
    width: '60%',
  },
  logoutButton: {
    backgroundColor: '#CCCCCC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    alignSelf: 'center',
    borderColor: '#000',
    borderWidth: 1,
  },

  logoutText: {
    color: '#d00',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
