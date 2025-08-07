// app/verify.tsx
import { useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from './_lib/supabaseClient';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

export default function VerifyScreen() {
  const router = useRouter();
  const { access_token, type, email } = useGlobalSearchParams();

  useEffect(() => {
    if (typeof access_token !== 'string' || typeof email !== 'string' || type !== 'signup') return;

    const verifyEmail = async () => {
      const { error } = await supabase.auth.verifyOtp({
        type: 'signup',
        email,
        token: access_token,
      });

      if (error) {
        Alert.alert('Verification Failed', error.message);
        console.error('Verification error:', error.message);
      } else {
        console.log('✅ Email verified');
        router.replace('/(tabs)/notes');
      }
    };

    verifyEmail();
  }, [access_token, email]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text>Verifying your email...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
