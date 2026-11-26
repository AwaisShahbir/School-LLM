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

interface Props {
  onBack: () => void;
}

export const CalendarScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startDate, setStartDate] = useState('2026-12-02');

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
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Academic Calendar</Text>
          <Text style={styles.headerSub}>Events & Institutional Schedule</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addBtnText}>+ Event</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {teacherStore.events.map(ev => (
          <View key={ev.id} style={styles.eventCard}>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{ev.start_date}</Text>
            </View>
            <Text style={styles.eventTitle}>{ev.title}</Text>
            {ev.description && <Text style={styles.eventDesc}>{ev.description}</Text>}
          </View>
        ))}
      </ScrollView>

      {/* Add Modal */}
      {showAddModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Calendar Event</Text>
            <TextInput
              style={styles.mInput}
              placeholder="Event Title..."
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.mInput}
              placeholder="Date (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={[styles.mInput, { height: 70 }]}
              multiline
              placeholder="Description..."
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
  addBtn: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  dateBadge: {
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
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textMain,
    marginBottom: 14,
  },
  mInput: {
    backgroundColor: THEME.colors.pageBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textMain,
    marginBottom: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
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
    fontSize: 12,
    fontWeight: '800',
  },
});
