import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
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
  const mySection = teacherStore.sections.find(s => s.class_teacher_id === teacher?.id);
  const secStudents = mySection 
    ? teacherStore.students.filter(s => s.section_id === mySection.id && s.status === 'active')
    : [];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAtt = teacherStore.attendance.filter(a => a.date === todayStr);
  const presentCount = todayAtt.filter(a => a.status === 'present').length;
  const absentCount = todayAtt.filter(a => a.status === 'absent').length;

  const currentDayOfWeek = new Date().getDay() || 1; // 1 = Monday
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const todaySchedule = teacherStore.timetableEntries.filter(
    e => e.day === currentDayOfWeek && e.teacher_id === teacher?.id
  ).sort((a, b) => a.period_no - b.period_no);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Lavender Gradient Header Banner */}
        <View style={styles.gradientHeader}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {teacher?.full_name || 'Faculty Member'}</Text>
              <View style={styles.subjectPill}>
                <Text style={styles.subjectText}>{teacher?.subject || 'Faculty Specialist'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.bellBtn} onPress={() => onNavigate('Notices')}>
              <Feather name="bell" size={20} color={THEME.colors.textMain} />
              {teacherStore.unreadNotificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{teacherStore.unreadNotificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card: Class Teacher Role */}
        <View style={styles.heroCard}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#7048E8" />
              <Text style={styles.heroPre}>Class Teacher Desk</Text>
            </View>
            <Text style={styles.heroTitle}>Daily Attendance</Text>
            <Text style={styles.heroSubtitle}>
              {mySection
                ? `Class ${mySection.grade}-${mySection.name} • ${secStudents.length} Students`
                : 'No class section assigned yet.'}
            </Text>
          </View>
          {mySection && (
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => onNavigate('Attendance')}
            >
              <Text style={styles.heroBtnText}>Roll Call</Text>
              <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Access Row with Vector Icons */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Attendance')}>
            <View style={[styles.tileIconBox, { backgroundColor: '#EEE9FD' }]}>
              <Feather name="clipboard" size={20} color="#7048E8" />
            </View>
            <Text style={styles.tileLabel}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Marks')}>
            <View style={[styles.tileIconBox, { backgroundColor: '#E8F5E9' }]}>
              <Feather name="award" size={20} color="#2FA36B" />
            </View>
            <Text style={styles.tileLabel}>Marks</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Timetable')}>
            <View style={[styles.tileIconBox, { backgroundColor: '#FFF8E1' }]}>
              <Feather name="clock" size={20} color="#F6C177" />
            </View>
            <Text style={styles.tileLabel}>Timetable</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Classes')}>
            <View style={[styles.tileIconBox, { backgroundColor: '#EEE9FD' }]}>
              <Feather name="users" size={20} color="#7048E8" />
            </View>
            <Text style={styles.tileLabel}>Students</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Classes')}>
            <View style={[styles.tileIconBox, { backgroundColor: '#E8F5E9' }]}>
              <Feather name="dollar-sign" size={20} color="#2FA36B" />
            </View>
            <Text style={styles.tileLabel}>Fees</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickTile} onPress={() => onNavigate('Sports')}>
            <View style={[styles.tileIconBox, { backgroundColor: '#FDE8EA' }]}>
              <MaterialCommunityIcons name="trophy-outline" size={20} color="#F27D8D" />
            </View>
            <Text style={styles.tileLabel}>Sports</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Card with Dynamic Metrics */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeaderTitle}>Daily Progress Summary</Text>

          <View style={styles.progItem}>
            <View style={styles.progLabelRow}>
              <Text style={styles.progName}>Today's Roll Call</Text>
              <Text style={styles.progStat}>
                {todayAtt.length === 0 ? 'Not marked yet' : `${presentCount} Present / ${absentCount} Absent`}
              </Text>
            </View>
            <View style={styles.progBarBg}>
              <View
                style={[
                  styles.progBarFill,
                  {
                    width: `${secStudents.length && todayAtt.length ? Math.round((presentCount / secStudents.length) * 100) : 0}%`,
                    backgroundColor: THEME.colors.present
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {/* Dynamic Schedule Card */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.cardHeaderTitle}>Today's Schedule ({dayName})</Text>
            <TouchableOpacity onPress={() => onNavigate('Timetable')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.viewAllText}>Full Week</Text>
              <Feather name="chevron-right" size={14} color="#7048E8" />
            </TouchableOpacity>
          </View>

          {todaySchedule.length === 0 ? (
            <View style={styles.emptySchedule}>
              <Feather name="calendar" size={28} color="#C9B6FA" style={{ marginBottom: 6 }} />
              <Text style={styles.emptySchedText}>No classes scheduled for today.</Text>
            </View>
          ) : (
            todaySchedule.map((entry, idx) => {
              const sec = teacherStore.sections.find(s => s.id === entry.section_id);
              return (
                <View key={entry.id || idx} style={styles.scheduleRow}>
                  <View style={styles.timeTag}>
                    <Text style={styles.timeTagText}>Period {entry.period_no}</Text>
                  </View>
                  <View style={styles.schedDetails}>
                    <Text style={styles.schedSubject}>{entry.subject}</Text>
                    <Text style={styles.schedClass}>
                      {sec ? `Class ${sec.grade}-${sec.name}` : 'Section'}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
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
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: THEME.colors.absent,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    marginTop: -16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroPre: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  heroBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8,
  },
  quickTile: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMain,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 14,
  },
  progItem: {
    marginBottom: 4,
  },
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
    backgroundColor: '#F0EEF8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
  emptySchedule: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptySchedText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
  },
  timeTag: {
    width: 70,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  schedDetails: {
    flex: 1,
    paddingHorizontal: 8,
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
});
