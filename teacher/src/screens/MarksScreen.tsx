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
import type { Exam } from '../types/database';

interface Props {
  onBack: () => void;
}

export const MarksScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);

  const teacher = teacherStore.currentTeacher;
  const exams = teacherStore.exams;
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [marksMap, setMarksMap] = useState<Record<string, { obtained: number | null; absent: boolean }>>({});
  const [savedNote, setSavedNote] = useState<string | null>(null);

  // Modal to create new exam
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examType, setExamType] = useState<Exam['type']>('monthly');
  const [totalMarks, setTotalMarks] = useState('50');

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const activeExam = teacherStore.exams.find(e => e.id === selectedExamId) || teacherStore.exams[0];
  const students = activeExam
    ? teacherStore.students.filter(s => s.section_id === activeExam.section_id && s.status === 'active')
    : [];

  useEffect(() => {
    if (!activeExam) return;
    const map: Record<string, { obtained: number | null; absent: boolean }> = {};
    students.forEach(s => {
      const existing = teacherStore.marks.find(m => m.exam_id === activeExam.id && m.student_id === s.id);
      map[s.id] = {
        obtained: existing ? existing.obtained : 35,
        absent: existing ? existing.absent : false
      };
    });
    setMarksMap(map);
    setSavedNote(null);
  }, [selectedExamId]);

  const handleScoreChange = (studentId: string, text: string) => {
    const num = text === '' ? null : Number(text);
    if (num !== null && (num < 0 || num > (activeExam?.total_marks || 100))) {
      Alert.alert("Invalid Score", `Obtained marks cannot exceed total marks (${activeExam?.total_marks}).`);
      return;
    }
    setMarksMap(prev => ({
      ...prev,
      [studentId]: { obtained: num, absent: false }
    }));
    setSavedNote(null);
  };

  const handleToggleAbsent = (studentId: string) => {
    setMarksMap(prev => {
      const cur = prev[studentId] || { obtained: null, absent: false };
      return {
        ...prev,
        [studentId]: {
          obtained: cur.absent ? 35 : null,
          absent: !cur.absent
        }
      };
    });
    setSavedNote(null);
  };

  const handleSaveMarks = () => {
    if (!activeExam) return;
    const records = Object.entries(marksMap).map(([student_id, rec]) => ({
      student_id,
      obtained: rec.obtained,
      absent: rec.absent
    }));
    teacherStore.saveMarks(activeExam.id, records);
    setSavedNote("Marks saved and submitted successfully!");
  };

  const handleCreateExam = () => {
    if (!examTitle.trim()) {
      Alert.alert("Required", "Please provide an assessment title.");
      return;
    }
    const mySec = teacherStore.sections.find(s => s.class_teacher_id === teacher?.id) || teacherStore.sections[0];
    const newEx = teacherStore.createExam(
      examTitle.trim(),
      examType,
      Number(totalMarks) || 50,
      '2026-11-26',
      mySec.id
    );
    setSelectedExamId(newEx.id);
    setShowCreateModal(false);
    setExamTitle('');
  };

  // Calculations
  const scored = Object.values(marksMap).filter(m => !m.absent && m.obtained !== null);
  const avg = scored.length ? Math.round(scored.reduce((s, m) => s + (m.obtained || 0), 0) / scored.length) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Marks & Assessment</Text>
          <Text style={styles.headerSub}>Subject: {teacher?.subject || 'Mathematics'}</Text>
        </View>
        <TouchableOpacity
          style={styles.newExamBtn}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.newExamText}>+ New Exam</Text>
        </TouchableOpacity>
      </View>

      {/* Exam Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examScroll}>
        {exams.map(ex => {
          const isSelected = ex.id === activeExam?.id;
          return (
            <TouchableOpacity
              key={ex.id}
              style={[styles.examPill, isSelected && styles.examPillActive]}
              onPress={() => setSelectedExamId(ex.id)}
            >
              <Text style={[styles.examPillText, isSelected && styles.examPillTextActive]}>
                {ex.title} ({ex.type})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* KPI Stats */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Total Marks</Text>
          <Text style={styles.kpiVal}>{activeExam?.total_marks || 50}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Running Average</Text>
          <Text style={[styles.kpiVal, { color: THEME.colors.primary }]}>{avg} / {activeExam?.total_marks || 50}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Students Tested</Text>
          <Text style={styles.kpiVal}>{scored.length} / {students.length}</Text>
        </View>
      </View>

      {savedNote && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>✓ {savedNote}</Text>
        </View>
      )}

      {/* Student Marks List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {students.map(stu => {
          const m = marksMap[stu.id] || { obtained: null, absent: false };
          return (
            <View key={stu.id} style={styles.studentCard}>
              <View style={styles.studentLeft}>
                <View style={styles.rollBadge}>
                  <Text style={styles.rollText}>{stu.roll_no}</Text>
                </View>
                <View style={styles.nameBlock}>
                  <Text style={styles.studentName}>{stu.full_name}</Text>
                  <Text style={styles.fatherName}>{stu.father_name || 'Guardian'}</Text>
                </View>
              </View>

              <View style={styles.marksInputBlock}>
                {m.absent ? (
                  <View style={styles.absentPill}>
                    <Text style={styles.absentText}>ABSENT</Text>
                  </View>
                ) : (
                  <TextInput
                    style={styles.scoreInput}
                    keyboardType="number-pad"
                    value={m.obtained !== null ? String(m.obtained) : ''}
                    onChangeText={(txt) => handleScoreChange(stu.id, txt)}
                  />
                )}

                <TouchableOpacity
                  style={[styles.absBtn, m.absent && styles.absBtnActive]}
                  onPress={() => handleToggleAbsent(stu.id)}
                >
                  <Text style={[styles.absBtnText, m.absent && styles.absBtnTextActive]}>
                    {m.absent ? 'Unmark' : 'Abs'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Sticky Save Bar */}
      <View style={styles.saveBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveMarks}>
          <Text style={styles.saveBtnText}>Save Assessment Marks</Text>
        </TouchableOpacity>
      </View>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Assessment</Text>
            <Text style={styles.modalSub}>Subject: {teacher?.subject || 'Mathematics'}</Text>

            <Text style={styles.mLabel}>Exam Title</Text>
            <TextInput
              style={styles.mInput}
              placeholder="e.g. November Monthly Test"
              value={examTitle}
              onChangeText={setExamTitle}
            />

            <Text style={styles.mLabel}>Exam Type</Text>
            <View style={styles.typeRow}>
              {(['weekly', 'monthly', 'term', 'annual'] as Exam['type'][]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typePill, examType === t && styles.typePillActive]}
                  onPress={() => setExamType(t)}
                >
                  <Text style={[styles.typePillText, examType === t && styles.typePillTextActive]}>
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.mLabel}>Total Marks</Text>
            <TextInput
              style={styles.mInput}
              keyboardType="number-pad"
              value={totalMarks}
              onChangeText={setTotalMarks}
            />

            <View style={styles.mBtnRow}>
              <TouchableOpacity
                style={styles.mCancelBtn}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.mCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mCreateBtn}
                onPress={handleCreateExam}
              >
                <Text style={styles.mCreateText}>Create Exam</Text>
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
  newExamBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.roundness.pill,
  },
  newExamText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  examScroll: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
    maxHeight: 52,
  },
  examPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.roundness.pill,
    backgroundColor: THEME.colors.pageBg,
    marginRight: 8,
  },
  examPillActive: {
    backgroundColor: THEME.colors.primary,
  },
  examPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  examPillTextActive: {
    color: '#FFFFFF',
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  kpiVal: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.textMain,
    marginTop: 2,
  },
  feedbackBox: {
    marginHorizontal: 16,
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 90,
  },
  studentCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 18,
    paddingVertical: 10,
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  marksInputBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreInput: {
    width: 60,
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 12,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  absentPill: {
    width: 60,
    backgroundColor: '#FDE8EA',
    borderRadius: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  absentText: {
    color: THEME.colors.absent,
    fontSize: 10,
    fontWeight: '900',
  },
  absBtn: {
    marginLeft: 8,
    backgroundColor: THEME.colors.pageBg,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: THEME.roundness.pill,
  },
  absBtnActive: {
    backgroundColor: THEME.colors.absent,
  },
  absBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  absBtnTextActive: {
    color: '#FFFFFF',
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
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  modalSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginBottom: 16,
  },
  mLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMain,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 10,
  },
  mInput: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.colors.textMain,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typePill: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: THEME.colors.pageBg,
    alignItems: 'center',
  },
  typePillActive: {
    backgroundColor: THEME.colors.primary,
  },
  typePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  mBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  mCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  mCreateBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: THEME.roundness.pill,
  },
  mCreateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
