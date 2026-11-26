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
import type { Student } from '../types/database';

interface Props {
  onBack: () => void;
}

export const ClassesScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);

  const [selectedGrade, setSelectedGrade] = useState<number>(6);
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [searchRoll, setSearchRoll] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Student Directory</Text>
          <Text style={styles.headerSub}>Grades 6 to 10 Enrolment</Text>
        </View>
      </View>

      {/* Grade Selector */}
      <View style={styles.pickerSection}>
        <View style={styles.row}>
          <Text style={styles.pickerLabel}>Grade:</Text>
          {[6, 7, 8, 9, 10].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.gPill, selectedGrade === g && !searchRoll && styles.gPillActive]}
              onPress={() => {
                setSelectedGrade(g);
                setSearchRoll('');
              }}
            >
              <Text style={[styles.gPillText, selectedGrade === g && !searchRoll && styles.gPillTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section Selector */}
        <View style={[styles.row, { marginTop: 8 }]}>
          <Text style={styles.pickerLabel}>Section:</Text>
          {['A', 'B', 'C'].map(s => (
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
        </View>

        {/* Roll Search */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by roll number or student name..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchRoll}
            onChangeText={setSearchRoll}
          />
        </View>
      </View>

      {/* Students List */}
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
                  <Text style={styles.stuSub}>Class {sec?.grade}-{sec?.name} • Father: {stu.father_name}</Text>
                </View>
              </View>
              <Text style={styles.arrowText}>Profile →</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedStudent.full_name}</Text>
                <Text style={styles.modalSub}>
                  Roll #{selectedStudent.roll_no} • Class {selectedGrade}-{selectedSection}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedStudent(null)} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Attendance Donut / Ring Indicator */}
            <View style={styles.donutCard}>
              <View style={styles.donutCircle}>
                <Text style={styles.donutNum}>94%</Text>
                <Text style={styles.donutLabel}>Attendance</Text>
              </View>
              <View style={styles.donutLegend}>
                <Text style={styles.legText}>• Present: 18 Sessions</Text>
                <Text style={styles.legText}>• Absent: 1 Session</Text>
                <Text style={styles.legText}>• Late: 1 Session</Text>
              </View>
            </View>

            {/* Fee Status (Read-Only) */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>November Fee:</Text>
              <View style={styles.feePill}>
                <Text style={styles.feePillText}>PAID (Rs. 3,500)</Text>
              </View>
            </View>

            {/* Guardian Phone */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Guardian Tel:</Text>
              <Text style={styles.infoVal}>{selectedStudent.phone1 || '03121000001'}</Text>
            </View>

            {/* B-Form */}
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>B-Form / CNIC:</Text>
              <Text style={styles.infoVal}>{selectedStudent.b_form || '35202-0000000-1'}</Text>
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
  backBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
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
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: THEME.roundness.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    color: THEME.colors.textMain,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
    marginRight: 10,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  stuName: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  stuSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  arrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: THEME.colors.textMuted,
  },
  donutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  donutCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  donutNum: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.textMain,
  },
  donutLabel: {
    fontSize: 8,
    color: THEME.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  donutLegend: {
    flex: 1,
  },
  legText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMain,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  feePill: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  feePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.paid,
  },
  modalDismissBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.pill,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  modalDismissText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
