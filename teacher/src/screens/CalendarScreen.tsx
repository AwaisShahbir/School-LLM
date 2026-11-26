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
import { Feather } from '@expo/vector-icons';
import { THEME } from '../theme/colors';
import { teacherStore } from '../lib/teacherStore';

interface Props {
  onBack: () => void;
}

export const CalendarScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const handleAddEvent = () => {
    if (!title.trim()) return;
    teacherStore.addEvent(title.trim(), desc.trim(), startDate);
    setTitle('');
    setDesc('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#1F1B2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Academic Calendar</Text>
          <Text style={styles.headerSub}>Events & Institutional Schedule</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Feather name="plus" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Event</Text>
        </TouchableOpacity>
      </View>

      {teacherStore.events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="calendar" size={48} color="#C9B6FA" />
          </View>
          <Text style={styles.emptyTitle}>No Academic Events</Text>
          <Text style={styles.emptySubtitle}>
            Upcoming examinations, holidays, and school functions will appear here. Tap below to create an event.
          </Text>
          <TouchableOpacity
            style={styles.emptyAddBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.emptyAddBtnText}>Add Calendar Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {teacherStore.events.map(ev => (
            <View key={ev.id} style={styles.eventCard}>
              <View style={styles.dateBadge}>
                <Feather name="clock" size={12} color="#7048E8" style={{ marginRight: 4 }} />
                <Text style={styles.dateText}>{ev.start_date}</Text>
              </View>
              <Text style={styles.eventTitle}>{ev.title}</Text>
              {ev.description && <Text style={styles.eventDesc}>{ev.description}</Text>}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Add Calendar Event</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={20} color="#1F1B2E" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.mInput}
              placeholder="Event Title..."
              placeholderTextColor={THEME.colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.mInput}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={THEME.colors.textMuted}
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={[styles.mInput, { height: 70, textAlignVertical: 'top' }]}
              multiline
              placeholder="Description..."
              placeholderTextColor={THEME.colors.textMuted}
              value={desc}
              onChangeText={setDesc}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleAddEvent}
              >
                <Text style={styles.submitText}>Publish Event</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  eventDesc: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
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
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: THEME.roundness.pill,
  },
  emptyAddBtnText: {
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
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  modalCloseBtn: {
    padding: 4,
  },
  mInput: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textMain,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
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
    fontWeight: '800',
    fontSize: 12,
  },
});
