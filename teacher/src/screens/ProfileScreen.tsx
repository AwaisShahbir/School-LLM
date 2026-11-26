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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
          <Feather name="arrow-left" size={20} color="#1F1B2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Faculty Profile</Text>
          <Text style={styles.headerSub}>ID & Service Records</Text>
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditing(!editing)}
        >
          <Feather name="edit-2" size={12} color="#7048E8" style={{ marginRight: 4 }} />
          <Text style={styles.editBtnText}>{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {teacher?.full_name
                ? teacher.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')
                : 'FM'}
            </Text>
          </View>
          <Text style={styles.name}>{teacher?.full_name || 'Faculty Member'}</Text>
          <Text style={styles.subject}>{teacher?.subject || 'Teaching Faculty'}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>Active Staff Member</Text>
          </View>
        </View>

        {savedMsg && (
          <View style={styles.successBox}>
            <Feather name="check-circle" size={16} color="#2FA36B" style={{ marginRight: 6 }} />
            <Text style={styles.successText}>Profile updated successfully</Text>
          </View>
        )}

        {/* Credentials & System Fields */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Verified Identification</Text>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons name="card-account-details-outline" size={18} color="#7048E8" />
              <Text style={styles.key}>CNIC Login:</Text>
            </View>
            <Text style={styles.valMono}>{teacher?.cnic || 'Not recorded'}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="calendar" size={18} color="#7048E8" />
              <Text style={styles.key}>Joining Date:</Text>
            </View>
            <Text style={styles.val}>{teacher?.joining_date || 'Active'}</Text>
          </View>
        </View>

        {/* Editable Fields */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Contact & Qualifications</Text>

          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Feather name="phone" size={16} color="#7048E8" />
              <Text style={styles.inputLabel}>Mobile Contact</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor={THEME.colors.textMuted}
                value={phone}
                onChangeText={setPhone}
              />
            ) : (
              <Text style={styles.valText}>{teacher?.phone || 'Not recorded'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Feather name="award" size={16} color="#7048E8" />
              <Text style={styles.inputLabel}>Qualification</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                placeholder="Degrees / Certifications"
                placeholderTextColor={THEME.colors.textMuted}
                value={qual}
                onChangeText={setQual}
              />
            ) : (
              <Text style={styles.valText}>{teacher?.qualification || 'Not recorded'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Feather name="map-pin" size={16} color="#7048E8" />
              <Text style={styles.inputLabel}>Residential Address</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                placeholder="Enter residential address"
                placeholderTextColor={THEME.colors.textMuted}
                value={address}
                onChangeText={setAddress}
              />
            ) : (
              <Text style={styles.valText}>{teacher?.address || 'Not recorded'}</Text>
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
          <Feather name="log-out" size={18} color="#F27D8D" style={{ marginRight: 8 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 12,
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
    borderWidth: 1,
    borderColor: '#E9E6F2',
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
    fontSize: 13,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: THEME.roundness.pill,
    marginTop: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2FA36B',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2FA36B',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  key: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  val: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMain,
  },
  valMono: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMain,
    fontFamily: 'monospace',
  },
  valText: {
    fontSize: 13,
    color: THEME.colors.textMain,
    paddingVertical: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textMain,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: THEME.roundness.pill,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#F27D8D',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F27D8D',
  },
});
