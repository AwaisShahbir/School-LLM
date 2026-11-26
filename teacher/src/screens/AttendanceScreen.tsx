import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert
} from 'react-native';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';
import type { AttendanceStatus } from '../types/database';

interface Props {
  onBack: () => void;
}

export const AttendanceScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);

  const teacher = teacherStore.currentTeacher;
  const mySection = teacherStore.sections.find(s => s.class_teacher_id === teacher?.id) || teacherStore.sections[0];
  const [selectedSectionId, setSelectedSectionId] = useState<string>(mySection.id);
  const [date] = useState('2026-11-26');

  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const isMySection = teacherStore.isClassTeacher(selectedSectionId);
  const students = teacherStore.students.filter(s => s.section_id === selectedSectionId && s.status === 'active');

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      const existing = teacherStore.attendance.find(a => a.student_id === s.id && a.date === date);
      map[s.id] = existing?.status || 'present';
    });
    setStatusMap(map);
    setSavedFeedback(null);
  }, [selectedSectionId]);

  const handleToggle = (studentId: string) => {
    if (!isMySection) {
      Alert.alert("Read-Only Access", "Only the assigned Class Teacher can record daily attendance for this section.");
      return;
    }
    const order: AttendanceStatus[] = ['present', 'absent', 'late', 'leave'];
    const current = statusMap[studentId] || 'present';
    const nextIdx = (order.indexOf(current) + 1) % order.length;
    setStatusMap(prev => ({ ...prev, [studentId]: order[nextIdx] }));
    setSavedFeedback(null);
  };

  const handleMarkAllPresent = () => {
    if (!isMySection) return;
    const map: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      map[s.id] = 'present';
    });
    setStatusMap(map);
    setSavedFeedback(null);
  };

  const handleSave = () => {
    if (!isMySection) return;
    const records = Object.entries(statusMap).map(([student_id, status]) => ({
      student_id,
      status
    }));
    teacherStore.saveAttendance(date, records);
    const targetSec = teacherStore.sections.find(s => s.id === selectedSectionId);
    setSavedFeedback(`Attendance saved for Class ${targetSec?.grade}-${targetSec?.name}`);
  };

  // Live counts
  const presentCount = students.filter(s => (statusMap[s.id] || 'present') === 'present').length;
  const absentCount = students.filter(s => statusMap[s.id] === 'absent').length;
  const lateCount = students.filter(s => statusMap[s.id] === 'late').length;
  const leaveCount = students.filter(s => statusMap[s.id] === 'leave').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Daily Attendance</Text>
          <Text style={styles.headerSub}>26/11/2026 • Class Teacher Desk</Text>
        </View>
        {isMySection && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllPresent}>
            <Text style={styles.markAllText}>All Present</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Section Picker Pills */}
      <View style={styles.secRow}>
        {teacherStore.sections.slice(0, 6).map(sec => {
          const isSelected = selectedSectionId === sec.id;
          return (
            <TouchableOpacity
              key={sec.id}
              style={[styles.secPill, isSelected && styles.secPillActive]}
              onPress={() => setSelectedSectionId(sec.id)}
            >
              <Text style={[styles.secPillText, isSelected && styles.secPillTextActive]}>
                {sec.grade}-{sec.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sticky Live Counters */}
      <View style={styles.countersRow}>
        <View style={[styles.counterCard, { backgroundColor: '#EEE9FD' }]}>
          <Text style={[styles.counterNum, { color: THEME.colors.present }]}>{presentCount}</Text>
          <Text style={styles.counterLabel}>Present</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#FDE8EA' }]}>
          <Text style={[styles.counterNum, { color: THEME.colors.absent }]}>{absentCount}</Text>
          <Text style={styles.counterLabel}>Absent</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.counterNum, { color: '#D97706' }]}>{lateCount}</Text>
          <Text style={styles.counterLabel}>Late</Text>
        </View>
        <View style={[styles.counterCard, { backgroundColor: '#F1F5F9' }]}>
          <Text style={[styles.counterNum, { color: THEME.colors.leave }]}>{leaveCount}</Text>
          <Text style={styles.counterLabel}>Leave</Text>
        </View>
      </View>

      {/* Feedback Alert */}
      {savedFeedback && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>✓ {savedFeedback}</Text>
        </View>
      )}

      {!isMySection && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ℹ Read-Only: Only assigned class teacher can modify attendance records.
          </Text>
        </View>
      )}

      {/* Student Rows List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {students.map(stu => {
          const st = statusMap[stu.id] || 'present';
          let stColor = THEME.colors.present;
          if (st === 'absent') stColor = THEME.colors.absent;
          else if (st === 'late') stColor = THEME.colors.late;
          else if (st === 'leave') stColor = THEME.colors.leave;

          return (
            <TouchableOpacity
              key={stu.id}
              style={styles.studentCard}
              onPress={() => handleToggle(stu.id)}
              activeOpacity={0.7}
            >
              <View style={styles.studentLeft}>
                <View style={styles.rollBadge}>
                  <Text style={styles.rollText}>{stu.roll_no}</Text>
                </View>
                <View style={styles.nameBlock}>
                  <Text style={styles.studentName}>{stu.full_name}</Text>
                  <Text style={styles.fatherName}>{stu.father_name || 'Guardian'}</Text>
                </View>
              </View>

              {/* Status Toggle Button */}
              <View style={[styles.statusToggle, { backgroundColor: stColor }]}>
                <Text style={styles.statusToggleText}>{st.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sticky Bottom Save Bar */}
      {isMySection && (
        <View style={styles.saveBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Attendance Register</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
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
  markAllBtn: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.roundness.pill,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  secRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
  },
  secPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.roundness.pill,
    backgroundColor: THEME.colors.pageBg,
    marginRight: 6,
  },
  secPillActive: {
    backgroundColor: THEME.colors.primary,
  },
  secPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  secPillTextActive: {
    color: '#FFFFFF',
  },
  countersRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  counterCard: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  counterNum: {
    fontSize: 16,
    fontWeight: '900',
  },
  counterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  feedbackBox: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#2FA36B',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2FA36B',
    textAlign: 'center',
  },
  warningBox: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
  },
  warningText: {
    fontSize: 11,
    color: '#B45309',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  studentCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rollBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rollText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  nameBlock: {
    flex: 1,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  fatherName: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  statusToggle: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: THEME.roundness.pill,
    minWidth: 84,
    alignItems: 'center',
  },
  statusToggleText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  saveBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E9E6F2',
  },
  saveBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.pill,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
