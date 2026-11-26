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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
  const [selectedSectionId, setSelectedSectionId] = useState<string>(mySection?.id || '');
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  useEffect(() => {
    if (!selectedSectionId && mySection) {
      setSelectedSectionId(mySection.id);
    }
  }, [mySection]);

  const activeSecId = selectedSectionId || mySection?.id || '';
  const isMySection = teacherStore.isClassTeacher(activeSecId);
  const students = teacherStore.students.filter(s => s.section_id === activeSecId && s.status === 'active');

  useEffect(() => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      const existing = teacherStore.attendance.find(a => a.student_id === s.id && a.date === todayStr);
      map[s.id] = existing?.status || 'present';
    });
    setStatusMap(map);
    setSavedFeedback(null);
  }, [activeSecId]);

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
    teacherStore.saveAttendance(todayStr, records);
    const targetSec = teacherStore.sections.find(s => s.id === activeSecId);
    setSavedFeedback(`Attendance saved for Class ${targetSec ? `${targetSec.grade}-${targetSec.name}` : ''}`);
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
          <Feather name="arrow-left" size={20} color="#1F1B2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Daily Attendance</Text>
          <Text style={styles.headerSub}>{formattedToday} • Class Teacher Desk</Text>
        </View>
        {isMySection && students.length > 0 ? (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllPresent}>
            <Feather name="check" size={14} color="#7048E8" style={{ marginRight: 4 }} />
            <Text style={styles.markAllText}>All Present</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Section Picker Pills */}
      {teacherStore.sections.length > 0 && (
        <View style={styles.secRow}>
          {teacherStore.sections.map(sec => {
            const isSelected = activeSecId === sec.id;
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
      )}

      {/* Empty State: No Sections */}
      {teacherStore.sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#C9B6FA" />
          </View>
          <Text style={styles.emptyTitle}>No Class Sections Assigned</Text>
          <Text style={styles.emptySubtitle}>
            Your school administrator has not assigned you to any class sections yet. Once assigned in the Admin Portal, sections will appear here.
          </Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="users" size={40} color="#C9B6FA" />
          </View>
          <Text style={styles.emptyTitle}>No Students Enrolled</Text>
          <Text style={styles.emptySubtitle}>
            No students are currently registered in this section. Students can be enrolled individually or imported via Excel in the Admin Portal.
          </Text>
        </View>
      ) : (
        <>
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
              <Feather name="check-circle" size={16} color="#2FA36B" style={{ marginRight: 6 }} />
              <Text style={styles.feedbackText}>{savedFeedback}</Text>
            </View>
          )}

          {!isMySection && (
            <View style={styles.warningBox}>
              <Feather name="info" size={14} color="#6B6880" style={{ marginRight: 6 }} />
              <Text style={styles.warningText}>
                Read-Only: Only assigned class teacher can record attendance for this section.
              </Text>
            </View>
          )}

          {/* Student Rows List */}
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {students.map(stu => {
              const st = statusMap[stu.id] || 'present';
              let stColor = THEME.colors.present;
              let iconName: 'check-circle' | 'x-circle' | 'clock' | 'file-text' = 'check-circle';
              if (st === 'absent') { stColor = THEME.colors.absent; iconName = 'x-circle'; }
              else if (st === 'late') { stColor = THEME.colors.late; iconName = 'clock'; }
              else if (st === 'leave') { stColor = THEME.colors.leave; iconName = 'file-text'; }

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
                    <Feather name={iconName} size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
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
                <Feather name="check-square" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Save Attendance Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
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
    backgroundColor: '#F4F3F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  headerSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  markAllText: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  secRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  secPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F4F3F8',
  },
  secPillActive: {
    backgroundColor: THEME.colors.primary,
  },
  secPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  secPillTextActive: {
    color: '#FFFFFF',
  },
  countersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  counterCard: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  counterNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  feedbackText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8F7FC',
    borderRadius: 12,
  },
  warningText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rollBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEE9FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rollText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  nameBlock: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  fatherName: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  statusToggleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: THEME.roundness.pill,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEE9FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textMain,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
