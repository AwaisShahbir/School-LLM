import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Keyboard
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';

interface LoginScreenProps {
  onLoginSuccess: (mustChangePassword: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError(null);

    const cleanCnic = cnic.replace(/\D/g, '');
    if (cleanCnic.length !== 13) {
      setError('CNIC must be exactly 13 numeric digits without dashes.');
      return;
    }

    if (!password || password.trim().length === 0) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await teacherStore.login(cleanCnic, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess(Boolean(res.mustChangePassword));
      } else {
        setError(res.error || 'Authentication failed. Verify credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Login error occurred.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topGradient} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Branding */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons name="school" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Faculty Portal</Text>
            <Text style={styles.subtitle}>Sign in with your 13-digit National CNIC</Text>
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color="#F27D8D" style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>13-Digit National CNIC</Text>
              <View style={styles.inputWrapper}>
                <Feather name="credit-card" size={18} color="#7048E8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="3520112345671 (no dashes)"
                  placeholderTextColor={THEME.colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={13}
                  value={cnic}
                  onChangeText={setCnic}
                />
                {cnic.length > 0 && (
                  <TouchableOpacity onPress={() => setCnic('')} style={styles.clearBtn}>
                    <Feather name="x" size={16} color="#6B6880" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.hint}>
                Enter 13 numeric digits without dashes
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#7048E8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={THEME.colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#6B6880" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={styles.loginBtnText}>Sign In to Faculty App</Text>
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            First-time users will be prompted to set a permanent password.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
    padding: 22,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.pageBg,
    borderRadius: THEME.roundness.input,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  clearBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.colors.textMain,
    fontWeight: '600',
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
    marginTop: 20,
  },
});
