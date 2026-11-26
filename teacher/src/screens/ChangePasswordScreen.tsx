import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';

interface Props {
  onComplete: () => void;
}

export const ChangePasswordScreen: React.FC<Props> = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    teacherStore.completePasswordChange(newPassword);
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>
          As a security measure, you must set a permanent password before accessing the application.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="At least 6 characters"
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>Set Password & Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.pageBg,
    justifyContent: 'center',
    padding: 24,
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#FDE8EA',
    borderWidth: 1,
    borderColor: '#F27D8D',
    borderRadius: 12,
    padding: 10,
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
    marginBottom: 6,
  },
  input: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: THEME.roundness.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: THEME.colors.textMain,
  },
  btn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
