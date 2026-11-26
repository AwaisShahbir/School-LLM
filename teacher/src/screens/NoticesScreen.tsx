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

export const NoticesScreen: React.FC<Props> = ({ onBack }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Clear unread count when viewing notices
    teacherStore.unreadNotificationCount = 0;
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#1F1B2E" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Faculty Notices</Text>
          <Text style={styles.headerSub}>Official Administrative Broadcasts</Text>
        </View>
      </View>

      {teacherStore.notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Feather name="bell-off" size={48} color="#C9B6FA" />
          </View>
          <Text style={styles.emptyTitle}>No Faculty Notices</Text>
          <Text style={styles.emptySubtitle}>
            Administrative announcements and official broadcasts dispatched to faculty will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {teacherStore.notifications.map(n => (
            <View key={n.id} style={styles.card}>
              <View style={styles.bellIconBox}>
                <Feather name="bell" size={20} color="#7048E8" />
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.noticeTitle}>{n.title}</Text>
                <Text style={styles.noticeBody}>{n.body}</Text>
                <Text style={styles.noticeDate}>Delivered to Faculty • Active Notice</Text>
              </View>
            </View>
          ))}
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E9E6F2',
  },
  bellIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardRight: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.textMain,
  },
  noticeBody: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  noticeDate: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginTop: 8,
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
