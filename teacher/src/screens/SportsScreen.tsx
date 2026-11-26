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
    const mySec = teacherStore.sections.find(s => s.class_teacher_id === teacherStore.currentTeacher?.id) || teacherStore.sections[0];
    const stu = teacherStore.students.find(s => s.section_id === mySec.id && s.roll_no === Number(studentRoll));
    if (!stu) {
      Alert.alert("Not Found", `Student #${studentRoll} not in section.`);
      return;
    }

    teacherStore.registerSport(slot.id, stu.id, roleDetails || 'Squad player');
    setShowRegModal(false);
    setStudentRoll('');
    setRoleDetails('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Sports Registration</Text>
          <Text style={styles.headerSub}>Team Squads & Player Roster</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowRegModal(true)}>
          <Text style={styles.addBtnText}>+ Register</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Slot card */}
        <View style={styles.slotCard}>
          <Text style={styles.slotPre}>Cricket Tournament</Text>
          <Text style={styles.slotTitle}>{slot?.label || 'Junior Squad'}</Text>
          <Text style={styles.slotCap}>Capacity: {registrations.length} / {slot?.capacity || 22} Registered</Text>
        </View>

        <Text style={styles.secTitle}>Registered Students</Text>
        {registrations.map(r => {
          const stu = teacherStore.students.find(s => s.id === r.student_id);
          return (
            <View key={r.id} style={styles.regCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>R{stu?.roll_no}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.regName}>{stu?.full_name}</Text>
                <Text style={styles.regDetails}>{r.details || 'Squad member'}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {showRegModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Register Student for Sport</Text>
            <TextInput
              style={styles.mInput}
              keyboardType="number-pad"
              placeholder="Roll Number (Class 6-A)"
              value={studentRoll}
              onChangeText={setStudentRoll}
            />
            <TextInput
              style={styles.mInput}
              placeholder="Position (e.g. All-rounder, Bowler)"
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
  addBtn: {
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
    marginTop: 4,
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
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 14,
  },
  mInput: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textMain,
    marginBottom: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
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
    fontSize: 12,
    fontWeight: '800',
  },
});
