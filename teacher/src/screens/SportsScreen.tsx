import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';

interface Props {
  onBack: () => void;
}

export const SportsScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);

  const [studentRoll, setStudentRoll] = useState('');
  const [roleDetails, setRoleDetails] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const slot = teacherStore.gameSlots[0];
  const registrations = teacherStore.sportRegistrations;

  const handleRegister = () => {
    if (!studentRoll.trim()) {
      Alert.alert("Required", "Enter roll number.");
      return;
    }
    if (!slot) {
      Alert.alert("No Sports Slot", "No sports tournaments or slots have been configured by the administrator.");
      return;
    }
    const mySec = teacherStore.sections.find(s => s.class_teacher_id === teacherStore.currentTeacher?.id) || teacherStore.sections[0];
    const stu = mySec 
      ? teacherStore.students.find(s => s.section_id === mySec.id && s.roll_no === Number(studentRoll))
      : teacherStore.students.find(s => s.roll_no === Number(studentRoll));

    if (!stu) {
      Alert.alert("Not Found", `Student with Roll #${studentRoll} was not found in your section.`);
      return;
    }

    try {
      teacherStore.registerSport(slot.id, stu.id, roleDetails.trim() || 'Squad player');
      setShowRegModal(false);
      setStudentRoll('');
      setRoleDetails('');
    } catch (err: any) {
      Alert.alert("Notice", err.message || "Failed to register student.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#1F1B2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Sports Registration</Text>
          <Text style={styles.headerSub}>Team Squads & Player Roster</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowRegModal(true)}>
          <Feather name="user-plus" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Register</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Slot card */}
        <View style={styles.slotCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={styles.slotPre}>School Sports Department</Text>
              <Text style={styles.slotTitle}>{slot?.label || 'Athletics & Games'}</Text>
            </View>
            <MaterialCommunityIcons name="trophy-outline" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.slotCap}>
            Capacity: {registrations.length} / {slot?.capacity || 22} Registered
          </Text>
        </View>

        <Text style={styles.secTitle}>Registered Students</Text>
        {registrations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="whistle-outline" size={44} color="#C9B6FA" />
            <Text style={styles.emptyTitle}>No Players Registered</Text>
            <Text style={styles.emptySubtitle}>
              Select students from your section and enroll them into sports squads and team rosters.
            </Text>
          </View>
        ) : (
          registrations.map(r => {
            const stu = teacherStore.students.find(s => s.id === r.student_id);
            const sec = stu ? teacherStore.sections.find(s => s.id === stu.section_id) : null;
            return (
              <View key={r.id} style={styles.regCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>R{stu?.roll_no || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.regName}>{stu?.full_name || 'Enrolled Student'}</Text>
                  <Text style={styles.regDetails}>
                    Class {sec ? `${sec.grade}-${sec.name}` : ''} • {r.details || 'Squad member'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {showRegModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Register Student for Sport</Text>
              <TouchableOpacity onPress={() => setShowRegModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color="#1F1B2E" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.mInput}
              keyboardType="number-pad"
              placeholder="Enter Student Roll Number"
              placeholderTextColor={THEME.colors.textMuted}
              value={studentRoll}
              onChangeText={setStudentRoll}
            />
            <TextInput
              style={styles.mInput}
              placeholder="Position or Squad Role (e.g. Batsman, Runner)"
              placeholderTextColor={THEME.colors.textMuted}
              value={roleDetails}
              onChangeText={setRoleDetails}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRegModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
                <Text style={styles.submitText}>Save Registration</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.roundness.pill,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  slotCard: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  slotPre: {
    color: '#E6DCFE',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  slotTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  slotCap: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 8,
  },
  secTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 10,
  },
  regCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  regName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  regDetails: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  modalCloseBtn: {
    padding: 4,
  },
  mInput: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textMain,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: THEME.roundness.pill,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
