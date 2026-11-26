import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';

interface LoginScreenProps {
  onLoginSuccess: (mustChangePassword: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [cnic, setCnic] = useState('3520112345671');
  const [password, setPassword] = useState('Teach#5671');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = teacherStore.login(cnic, password);
      if (res.success) {
        onLoginSuccess(Boolean(res.mustChangePassword));
      } else {
        setError(res.error || 'Authentication failed. Verify credentials.');
      }
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Decor */}
      <View style={styles.topGradient} />

      <View style={styles.content}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SCH</Text>
          </View>
          <Text style={styles.title}>Faculty Portal</Text>
          <Text style={styles.subtitle}>Sign in with your 13-digit National CNIC</Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>13-Digit National CNIC</Text>
            <TextInput
              style={styles.input}
              placeholder="3520112345671 (no dashes)"
              placeholderTextColor={THEME.colors.textMuted}
              keyboardType="number-pad"
              maxLength={13}
              value={cnic}
              onChangeText={setCnic}
            />
            <Text style={styles.hint}>
              Auth ID: {cnic ? `${cnic}@teachers.school.app` : 'your-cnic@teachers.school.app'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor={THEME.colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In to Faculty App</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          First-time users will be prompted to set a permanent password.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.pageBg,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: THEME.colors.lavender,
    opacity: 0.35,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.roundness.card,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  errorBox: {
    backgroundColor: '#FDE8EA',
    borderWidth: 1,
    borderColor: '#F27D8D',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: THEME.roundness.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: THEME.colors.textMain,
  },
  hint: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  loginBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 24,
  },
});
