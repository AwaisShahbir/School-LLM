import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';

interface Props {
  onLogout: () => void;
  onBack: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ onLogout, onBack }) => {
  const [, setTick] = useState(0);

  const teacher = teacherStore.currentTeacher;
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(teacher?.phone || '');
  const [address, setAddress] = useState(teacher?.address || '');
  const [qual, setQual] = useState(teacher?.qualification || '');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const handleSaveProfile = () => {
    // Teacher limited column update via RPC
    teacherStore.updateOwnProfile({
      phone,
      address,
      qualification: qual
    });
    setEditing(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Faculty Profile</Text>
          <Text style={styles.headerSub}>ID & Service Records</Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditing(!editing)}
        >
          <Text style={styles.editBtnText}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {teacher?.full_name.split(' ').map(n => n[0]).slice(0, 2).join('') || 'FC'}
            </Text>
          </View>
          <Text style={styles.name}>{teacher?.full_name}</Text>
          <Text style={styles.subject}>{teacher?.subject || 'Faculty Specialist'}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>Active Staff Member</Text>
          </View>
        </View>

        {savedMsg && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ Profile updated via secure RPC function</Text>
          </View>
        )}

        {/* Credentials & Limited Fields */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Verified Identification</Text>

          <View style={styles.row}>
            <Text style={styles.key}>CNIC Login:</Text>
            <Text style={styles.valMono}>{teacher?.cnic || '3520112345671'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.key}>Synthetic Auth ID:</Text>
            <Text style={styles.val}>{teacher?.email}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.key}>Joining Date:</Text>
            <Text style={styles.val}>{teacher?.joining_date || '2023-01-15'}</Text>
          </View>

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.key}>Salary Disbursal:</Text>
            <Text style={[styles.val, { color: THEME.colors.paid }]}>Paid for Nov 2026</Text>
          </View>
        </View>

        {/* Editable Fields (RPC update_own_profile) */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Editable Contact Info</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Contact</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
              />
            ) : (
              <Text style={styles.val}>{teacher?.phone || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Qualification</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={qual}
                onChangeText={setQual}
              />
            ) : (
              <Text style={styles.val}>{teacher?.qualification || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Residential Address</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
              />
            ) : (
              <Text style={styles.val}>{teacher?.address || 'Not set'}</Text>
            )}
          </View>

          {editing && (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Save Profile Updates</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Sign Out from Device</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E6F2',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  headerSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  editBtn: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: THEME.roundness.pill,
  },
  editBtnText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  subject: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.roundness.pill,
    marginTop: 10,
  },
  statusPillText: {
    color: THEME.colors.paid,
    fontSize: 10,
    fontWeight: '800',
  },
  successBox: {
    backgroundColor: '#E6F4EA',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  successText: {
    color: THEME.colors.paid,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
  },
  key: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  val: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  valMono: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  input: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: THEME.colors.textMain,
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.pill,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  logoutBtn: {
    backgroundColor: '#FDE8EA',
    borderRadius: THEME.roundness.pill,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: THEME.colors.absent,
    fontSize: 13,
    fontWeight: '800',
  },
});
