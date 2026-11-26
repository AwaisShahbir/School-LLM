import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const teacher = teacherStore.currentTeacher;
  const mySection = teacherStore.sections.find(s => s.class_teacher_id === teacher?.id) || teacherStore.sections[0];
  const secStudents = teacherStore.students.filter(s => s.section_id === mySection.id && s.status === 'active');

  const todayAtt = teacherStore.attendance.filter(a => a.date === '2026-11-26');
  const presentCount = todayAtt.filter(a => a.status === 'present').length;
  const absentCount = todayAtt.filter(a => a.status === 'absent').length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Lavender Gradient Header Banner */}
        <View style={styles.gradientHeader}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {teacher?.full_name || 'Teacher'}</Text>
              <View style={styles.subjectPill}>
                <Text style={styles.subjectText}>{teacher?.subject || 'Faculty Specialist'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.bellBtn} onPress={() => onNavigate('Notices')}>
              <Text style={styles.bellIcon}>🔔</Text>
              {teacherStore.unreadNotificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{teacherStore.unreadNotificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card: Primary Action */}
        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroPre}>Class Teacher Role</Text>
            <Text style={styles.heroTitle}>Take Daily Attendance</Text>
            <Text style={styles.heroSubtitle}>
              Class {mySection.grade}-{mySection.name} • {secStudents.length} Students Registered
            </Text>
          </View>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => onNavigate('Attendance')}
          >
            <Text style={styles.heroBtnText}>Open Register →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access Row */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Attendance')}>
            <View style={styles.tileIconBox}>
              <Text style={styles.tileEmoji}>📋</Text>
            </View>
            <Text style={styles.tileLabel}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Marks')}>
            <View style={styles.tileIconBox}>
              <Text style={styles.tileEmoji}>📝</Text>
            </View>
            <Text style={styles.tileLabel}>Marks</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Timetable')}>
            <View style={styles.tileIconBox}>
              <Text style={styles.tileEmoji}>🕒</Text>
            </View>
            <Text style={styles.tileLabel}>Timetable</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Classes')}>
            <View style={styles.tileIconBox}>
              <Text style={styles.tileEmoji}>👥</Text>
            </View>
            <Text style={styles.tileLabel}>Students</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Classes')}>
            <View style={styles.tileIconBox}>
              <Text style={styles.tileEmoji}>💳</Text>
            </View>
            <Text style={styles.tileLabel}>Fees</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Sports')}>
            <View style={styles.tileIconBox}>
              <Text style={styles.tileEmoji}>🏆</Text>
            </View>
            <Text style={styles.tileLabel}>Sports</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card with Thin Progress Bars */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeaderTitle}>Daily Progress Summary</Text>

          {/* Attendance progress */}
          <View style={styles.progItem}>
            <View style={styles.progLabelRow}>
              <Text style={styles.progName}>Today's Roll Call</Text>
              <Text style={styles.progStat}>{presentCount} Present / {absentCount} Absent</Text>
            </View>
            <View style={styles.progBarBg}>
              <View
                style={[
                  styles.progBarFill,
                  { width: `${secStudents.length ? Math.round((presentCount / secStudents.length) * 100) : 0}%`, backgroundColor: THEME.colors.present }
                ]}
              />
            </View>
          </View>

          {/* Marks progress */}
          <View style={[styles.progItem, { marginTop: 14 }]}>
            <View style={styles.progLabelRow}>
              <Text style={styles.progName}>November Monthly Assessment</Text>
              <Text style={styles.progStat}>100% Submitted</Text>
            </View>
            <View style={styles.progBarBg}>
              <View style={[styles.progBarFill, { width: '100%', backgroundColor: THEME.colors.paid }]} />
            </View>
          </View>
        </View>

        {/* Today's Schedule Card */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.cardHeaderTitle}>Today's Schedule (Monday)</Text>
            <TouchableOpacity onPress={() => onNavigate('Timetable')}>
              <Text style={styles.viewAllText}>Full Week →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleRow}>
            <View style={styles.timeTag}>
              <Text style={styles.timeTagText}>08:00 AM</Text>
              <Text style={styles.periodTag}>Period 1</Text>
            </View>
            <View style={styles.schedDetails}>
              <Text style={styles.schedSubject}>Mathematics</Text>
              <Text style={styles.schedClass}>Class 6-A • Room 102</Text>
            </View>
            <View style={styles.statusPillActive}>
              <Text style={styles.statusPillText}>Next</Text>
            </View>
          </View>

          <View style={styles.scheduleRow}>
            <View style={styles.timeTag}>
              <Text style={styles.timeTagText}>09:30 AM</Text>
              <Text style={styles.periodTag}>Period 3</Text>
            </View>
            <View style={styles.schedDetails}>
              <Text style={styles.schedSubject}>Mathematics</Text>
              <Text style={styles.schedClass}>Class 6-B • Room 104</Text>
            </View>
          </View>

          <View style={styles.scheduleRow}>
            <View style={styles.timeTag}>
              <Text style={styles.timeTagText}>11:15 AM</Text>
              <Text style={styles.periodTag}>Period 5</Text>
            </View>
            <View style={styles.schedDetails}>
              <Text style={styles.schedSubject}>Mathematics</Text>
              <Text style={styles.schedClass}>Class 6-C • Room 106</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.pageBg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  gradientHeader: {
    backgroundColor: '#E6DCFE',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  subjectPill: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.roundness.pill,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bellIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: THEME.colors.absent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: -16,
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.roundness.card,
    padding: 20,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPre: {
    color: '#D8CEFE',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  heroSubtitle: {
    color: '#E9E4FD',
    fontSize: 12,
    marginTop: 2,
  },
  heroBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: THEME.roundness.pill,
  },
  heroBtnText: {
    color: THEME.colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  quickTile: {
    width: '31%',
    backgroundColor: THEME.colors.card,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  tileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tileEmoji: {
    fontSize: 20,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  summaryCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.roundness.card,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 14,
  },
  progItem: {},
  progLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progName: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMain,
  },
  progStat: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
  },
  progBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.pageBg,
    overflow: 'hidden',
  },
  progBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scheduleCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.roundness.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
  },
  timeTag: {
    width: 76,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  periodTag: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  schedDetails: {
    flex: 1,
    marginLeft: 8,
  },
  schedSubject: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  schedClass: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 1,
  },
  statusPillActive: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.roundness.pill,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
});
