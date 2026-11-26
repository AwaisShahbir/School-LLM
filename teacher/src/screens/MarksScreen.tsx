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

  useEffect(() => {
    if (exams.length > 0 && (!selectedExamId || !exams.some(e => e.id === selectedExamId))) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams.length]);

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
        obtained: existing ? existing.obtained : null,
        absent: existing ? existing.absent : false
      };
    });
    setMarksMap(map);
    setSavedNote(null);
  }, [selectedExamId, activeExam?.id]);

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
          obtained: null,
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
    if (!mySec) {
      Alert.alert("No Section", "You need at least one class section configured to create an assessment.");
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    teacherStore.createExam(
      examTitle.trim(),
      examType,
      Number(totalMarks) || 50,
      today,
      mySec.id
    ).then(newEx => {
      setSelectedExamId(newEx.id);
      setShowCreateModal(false);
      setExamTitle('');
    });
  };

  // Calculations
  const scored = Object.values(marksMap).filter(m => !m.absent && m.obtained !== null);
  const avg = scored.length ? Math.round(scored.reduce((s, m) => s + (m.obtained || 0), 0) / scored.length) : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#1F1B2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Marks & Assessment</Text>
          <Text style={styles.headerSub}>Subject: {teacher?.subject || 'Faculty Specialist'}</Text>
        </View>
        <TouchableOpacity
          style={styles.newExamBtn}
          onPress={() => setShowCreateModal(true)}
        >
          <Feather name="plus" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.newExamText}>New Exam</Text>
        </TouchableOpacity>
      </View>

      {/* Exam Selector */}
      {exams.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {exams.map(ex => {
            const isSelected = ex.id === activeExam?.id;
            return (
              <TouchableOpacity
                key={ex.id}
                style={[styles.examPill, isSelected && styles.examPillActive]}
                onPress={() => setSelectedExamId(ex.id)}
              >
                <Feather
                  name="award"
                  size={12}
                  color={isSelected ? '#FFFFFF' : '#7048E8'}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.examPillText, isSelected && styles.examPillTextActive]}>
                  {ex.title} ({ex.type})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Empty State if No Exams */}
      {exams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="award" size={48} color="#C9B6FA" />
          </View>
          <Text style={styles.emptyTitle}>No Assessments Created</Text>
          <Text style={styles.emptySubtitle}>
            Create your first weekly test, monthly exam, or term examination to record and evaluate student marks.
          </Text>
          <TouchableOpacity
            style={styles.emptyCreateBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyCreateBtnText}>Create Assessment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* KPI Stats */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total Marks</Text>
              <Text style={styles.kpiVal}>{activeExam?.total_marks || 50}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Average Score</Text>
              <Text style={[styles.kpiVal, { color: THEME.colors.primary }]}>
                {scored.length > 0 ? `${avg} / ${activeExam?.total_marks || 50}` : '—'}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Tested</Text>
              <Text style={styles.kpiVal}>{scored.length} / {students.length}</Text>
            </View>
          </View>

          {savedNote && (
            <View style={styles.feedbackBox}>
              <Feather name="check-circle" size={16} color="#2FA36B" style={{ marginRight: 6 }} />
              <Text style={styles.feedbackText}>{savedNote}</Text>
            </View>
          )}

          {/* Student Marks List */}
          {students.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="users" size={40} color="#C9B6FA" />
              <Text style={styles.emptyTitle}>No Students in Section</Text>
              <Text style={styles.emptySubtitle}>
                Add students to this section in the Admin Portal to record their examination marks.
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {students.map(stu => {
                const m = marksMap[stu.id] || { obtained: null, absent: false };
                return (
                  <View key={stu.id} style={styles.studentCard}>
                    <View style={styles.studentLeft}>
                      <View style={styles.rollBadge}>
                        <Text style={styles.rollText}>R{stu.roll_no}</Text>
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
                          placeholder="—"
                          placeholderTextColor={THEME.colors.textMuted}
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
          )}

          {/* Sticky Save Bar */}
          {students.length > 0 && (
            <View style={styles.saveBar}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveMarks}>
                <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Save Assessment Marks</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Create Exam Modal */}
      {showCreateModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Create Assessment</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color="#1F1B2E" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Subject: {teacher?.subject || 'Faculty Specialist'}</Text>

            <Text style={styles.mLabel}>Exam Title</Text>
            <TextInput
              style={styles.mInput}
              placeholder="e.g. Unit 1 Class Test"
              placeholderTextColor={THEME.colors.textMuted}
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
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
  },
  examPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.roundness.pill,
    backgroundColor: THEME.colors.pageBg,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  examPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  examPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  examPillTextActive: {
    color: '#FFFFFF',
  },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  kpiVal: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginTop: 2,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 10,
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2FA36B',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  studentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rollBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rollText: {
    fontSize: 11,
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
  },
  marksInputBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreInput: {
    width: 48,
    height: 36,
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  absentPill: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FDE8EA',
    borderRadius: 10,
  },
  absentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F27D8D',
  },
  absBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 10,
  },
  absBtnActive: {
    backgroundColor: '#F27D8D',
  },
  absBtnText: {
    fontSize: 10,
    fontWeight: '800',
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
    padding: 16,
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
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
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
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: THEME.roundness.pill,
  },
  emptyCreateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  mLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMain,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },
  mInput: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textMain,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  typePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: THEME.colors.pageBg,
    alignItems: 'center',
  },
  typePillActive: {
    backgroundColor: THEME.colors.primary,
  },
  typePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  mBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  mCancelBtn: {
    paddingHorizontal: 14,
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
