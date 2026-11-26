import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';

interface Props {
  onBack: () => void;
}

const DAYS = [
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

const PERIOD_TIMES = [
  '08:00 - 08:45',
  '08:45 - 09:30',
  '09:30 - 10:15',
  '10:30 - 11:15',
  '11:15 - 12:00',
  '12:00 - 12:45',
  '12:45 - 01:30'
];

export const TimetableScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 1);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const teacher = teacherStore.currentTeacher;
  const dayEntries = teacherStore.timetableEntries.filter(
    e => e.day === selectedDay && e.teacher_id === teacher?.id
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#1F1B2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Faculty Timetable</Text>
          <Text style={styles.headerSub}>Master Schedule (Approved)</Text>
        </View>
      </View>

      {/* Day Selector Tabs */}
      <View style={styles.dayTabs}>
        {DAYS.map(d => {
          const isSelected = selectedDay === d.id;
          return (
            <TouchableOpacity
              key={d.id}
              style={[styles.dayTab, isSelected && styles.dayTabActive]}
              onPress={() => setSelectedDay(d.id)}
            >
              <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Periods List */}
      {teacherStore.timetableEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="calendar" size={48} color="#C9B6FA" />
          </View>
          <Text style={styles.emptyTitle}>No Timetable Published</Text>
          <Text style={styles.emptySubtitle}>
            Your teaching periods and daily schedules will appear here once built and approved by the school administrator in the Admin Portal.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {[1, 2, 3, 4, 5, 6, 7].map(periodNo => {
            const entry = dayEntries.find(e => e.period_no === periodNo);
            const sec = entry ? teacherStore.sections.find(s => s.id === entry.section_id) : null;
            const isTeaching = Boolean(entry);

            return (
              <View key={periodNo} style={[styles.periodCard, isTeaching && styles.periodCardActive]}>
                <View style={styles.periodTimeBox}>
                  <Text style={styles.periodNoText}>Period {periodNo}</Text>
                  <Text style={styles.periodTimeText}>{PERIOD_TIMES[periodNo - 1]}</Text>
                </View>

                <View style={styles.periodDetails}>
                  {isTeaching ? (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Feather name="book-open" size={14} color="#7048E8" />
                        <Text style={styles.subjectText}>{entry?.subject}</Text>
                      </View>
                      <Text style={styles.classText}>
                        Class {sec ? `${sec.grade}-${sec.name}` : 'Assigned Class'}
                      </Text>
                    </>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Feather name="coffee" size={14} color="#6B6880" />
                      <Text style={styles.freeText}>Free Period / Preparation</Text>
                    </View>
                  )}
                </View>

                {isTeaching && (
                  <View style={styles.activeTag}>
                    <Text style={styles.activeTagText}>Class</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
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
  dayTabs: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F3F8',
    justifyContent: 'space-between',
  },
  dayTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: THEME.roundness.pill,
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: THEME.colors.pageBg,
  },
  dayTabActive: {
    backgroundColor: THEME.colors.primary,
  },
  dayTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  periodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  periodCardActive: {
    borderColor: THEME.colors.primaryLight,
    backgroundColor: '#FAF9FE',
  },
  periodTimeBox: {
    width: 90,
  },
  periodNoText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  periodTimeText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  periodDetails: {
    flex: 1,
    marginLeft: 8,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  classText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  freeText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  activeTag: {
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.roundness.pill,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
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
  },
});
