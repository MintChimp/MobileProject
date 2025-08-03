// app/verify.tsx
import { useEffect } from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from './_lib/supabaseClient';
import { useRouter, useGlobalSearchParams } from 'expo-router';

export default function VerifyScreen() {
  const router = useRouter();
  const { access_token, type } = useGlobalSearchParams();

  useEffect(() => {
    if (typeof access_token !== 'string') return;

    supabase.auth.setSession({
      access_token,
      refresh_token: '', // optional
    }).then(({ error }) => {
      if (!error) {
        router.replace('/(tabs)/notes');
      }
    });
  }, [access_token]);

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
