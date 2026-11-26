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
import type { Student } from '../types/database';

interface Props {
  onBack: () => void;
}

export const ClassesScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const availableGrades = Array.from(new Set(teacherStore.sections.map(s => s.grade))).sort((a, b) => a - b);
  const [selectedGrade, setSelectedGrade] = useState<number>(availableGrades[0] || 6);

  useEffect(() => {
    if (availableGrades.length > 0 && !availableGrades.includes(selectedGrade)) {
      setSelectedGrade(availableGrades[0]);
    }
  }, [availableGrades.length]);

  const availableSections = Array.from(
    new Set(teacherStore.sections.filter(s => s.grade === selectedGrade).map(s => s.name))
  ).sort();
  const [selectedSection, setSelectedSection] = useState<string>(availableSections[0] || 'A');

  useEffect(() => {
    if (availableSections.length > 0 && !availableSections.includes(selectedSection)) {
      setSelectedSection(availableSections[0]);
    }
  }, [selectedGrade, availableSections.length]);

  const [searchRoll, setSearchRoll] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const currentSection = teacherStore.sections.find(
    s => s.grade === selectedGrade && s.name === selectedSection
  );

  const students = teacherStore.students.filter(s => {
    if (searchRoll.trim()) {
      const q = searchRoll.toLowerCase();
      return (
        String(s.roll_no) === q ||
        s.full_name.toLowerCase().includes(q)
      );
    }
    return s.section_id === currentSection?.id && s.status === 'active';
  });

  // Dynamic calculations for selected student profile
  const stuAtt = selectedStudent ? teacherStore.attendance.filter(a => a.student_id === selectedStudent.id) : [];
  const presentCount = stuAtt.filter(a => a.status === 'present').length;
  const absentCount = stuAtt.filter(a => a.status === 'absent').length;
  const lateCount = stuAtt.filter(a => a.status === 'late').length;
  const attPct = stuAtt.length ? Math.round((presentCount / stuAtt.length) * 100) : 0;

  const stuFee = selectedStudent ? teacherStore.fees.filter(f => f.student_id === selectedStudent.id) : [];
  const latestFee = stuFee[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#1F1B2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Student Directory</Text>
          <Text style={styles.headerSub}>
            {teacherStore.students.length > 0 
              ? `${teacherStore.students.length} Total Enrolled Students` 
              : 'School Enrolment'}
          </Text>
        </View>
      </View>

      {/* Grade Selector & Filters */}
      <View style={styles.pickerSection}>
        {availableGrades.length > 0 ? (
          <>
            <View style={styles.row}>
              <Text style={styles.pickerLabel}>Grade:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableGrades.map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.gPill, selectedGrade === g && !searchRoll && styles.gPillActive]}
                    onPress={() => {
                      setSelectedGrade(g);
                      setSearchRoll('');
                    }}
                  >
                    <Text style={[styles.gPillText, selectedGrade === g && !searchRoll && styles.gPillTextActive]}>
                      Grade {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Section Selector */}
            {availableSections.length > 0 && (
              <View style={[styles.row, { marginTop: 8 }]}>
                <Text style={styles.pickerLabel}>Section:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {availableSections.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sPill, selectedSection === s && !searchRoll && styles.sPillActive]}
                      onPress={() => {
                        setSelectedSection(s);
                        setSearchRoll('');
                      }}
                    >
                      <Text style={[styles.sPillText, selectedSection === s && !searchRoll && styles.sPillTextActive]}>
                        Sec {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        ) : null}

        {/* Search Box */}
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={THEME.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by roll number or student name..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchRoll}
            onChangeText={setSearchRoll}
          />
          {searchRoll.length > 0 && (
            <TouchableOpacity onPress={() => setSearchRoll('')} style={styles.clearBtn}>
              <Feather name="x" size={14} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Students List */}
      {teacherStore.sections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="google-classroom" size={48} color="#C9B6FA" />
          <Text style={styles.emptyTitle}>No Classes Configured</Text>
          <Text style={styles.emptySubtitle}>
            Classes and sections can be created dynamically by the school administrator in the Admin Portal.
          </Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="users" size={44} color="#C9B6FA" />
          <Text style={styles.emptyTitle}>No Students Found</Text>
          <Text style={styles.emptySubtitle}>
            {searchRoll.trim() 
              ? `No student matching "${searchRoll}". Try searching with another roll number or name.`
              : `No students enrolled in Class ${selectedGrade}-${selectedSection} yet.`}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {students.map(stu => {
            const sec = teacherStore.sections.find(s => s.id === stu.section_id);
            return (
              <TouchableOpacity
                key={stu.id}
                style={styles.card}
                onPress={() => setSelectedStudent(stu)}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>R{stu.roll_no}</Text>
                  </View>
                  <View>
                    <Text style={styles.stuName}>{stu.full_name}</Text>
                    <Text style={styles.stuSub}>
                      Class {sec ? `${sec.grade}-${sec.name}` : ''} • Father: {stu.father_name || 'Guardian'}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={THEME.colors.primary} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Student Profile Modal */}
      {selectedStudent && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{selectedStudent.full_name}</Text>
                <Text style={styles.modalSub}>
                  Roll #{selectedStudent.roll_no} • Class {selectedGrade}-{selectedSection}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedStudent(null)} style={styles.closeBtn}>
                <Feather name="x" size={20} color="#1F1B2E" />
              </TouchableOpacity>
            </View>

            {/* Attendance Donut / Ring Indicator */}
            <View style={styles.donutCard}>
              <View style={styles.donutCircle}>
                <Text style={styles.donutNum}>{stuAtt.length > 0 ? `${attPct}%` : '—'}</Text>
                <Text style={styles.donutLabel}>Attendance</Text>
              </View>
              <View style={styles.donutLegend}>
                {stuAtt.length > 0 ? (
                  <>
                    <Text style={styles.legText}>• Present: {presentCount} Sessions</Text>
                    <Text style={styles.legText}>• Absent: {absentCount} Sessions</Text>
                    <Text style={styles.legText}>• Late: {lateCount} Sessions</Text>
                  </>
                ) : (
                  <Text style={styles.legText}>No attendance records recorded yet.</Text>
                )}
              </View>
            </View>

            {/* Fee Status (Read-Only) */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Fee Status:</Text>
              {latestFee ? (
                <View style={[styles.feePill, { backgroundColor: latestFee.status === 'paid' ? '#E8F5E9' : '#FDE8EA' }]}>
                  <Text style={[styles.feePillText, { color: latestFee.status === 'paid' ? '#2FA36B' : '#F27D8D' }]}>
                    {latestFee.status.toUpperCase()} ({latestFee.amount ? `Rs. ${latestFee.amount.toLocaleString()}` : ''})
                  </Text>
                </View>
              ) : (
                <Text style={styles.infoVal}>No fee records</Text>
              )}
            </View>

            {/* Guardian Phone */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Guardian Tel:</Text>
              <Text style={styles.infoVal}>{selectedStudent.phone1 || 'Not recorded'}</Text>
            </View>

            {/* B-Form */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>B-Form / CNIC:</Text>
              <Text style={styles.infoVal}>{selectedStudent.b_form || 'Not recorded'}</Text>
            </View>

            <TouchableOpacity
              style={styles.modalDismissBtn}
              onPress={() => setSelectedStudent(null)}
            >
              <Text style={styles.modalDismissText}>Close Profile</Text>
            </TouchableOpacity>
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
  pickerSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    width: 60,
    textTransform: 'uppercase',
  },
  gPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.roundness.pill,
    backgroundColor: THEME.colors.pageBg,
    marginRight: 6,
  },
  gPillActive: {
    backgroundColor: THEME.colors.primary,
  },
  gPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  gPillTextActive: {
    color: '#FFFFFF',
  },
  sPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.roundness.pill,
    backgroundColor: THEME.colors.pageBg,
    marginRight: 6,
  },
  sPillActive: {
    backgroundColor: THEME.colors.primaryLight,
  },
  sPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  sPillTextActive: {
    color: THEME.colors.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.pageBg,
    borderRadius: THEME.roundness.pill,
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 12,
    color: THEME.colors.textMain,
  },
  clearBtn: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
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
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  stuName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  stuSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginTop: 14,
    marginBottom: 6,
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  modalSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  donutCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  donutNum: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  donutLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  donutLegend: {
    flex: 1,
  },
  legText: {
    fontSize: 11,
    color: THEME.colors.textMain,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
  },
  infoKey: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMain,
  },
  feePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.roundness.pill,
  },
  feePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalDismissBtn: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: THEME.roundness.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  modalDismissText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
});
