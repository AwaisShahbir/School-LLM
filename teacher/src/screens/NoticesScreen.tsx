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
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Faculty Notices</Text>
          <Text style={styles.headerSub}>Official Administrative Broadcasts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {teacherStore.notifications.map(n => (
          <View key={n.id} style={styles.card}>
            <View style={styles.bellIconBox}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.noticeTitle}>{n.title}</Text>
              <Text style={styles.noticeBody}>{n.body}</Text>
              <Text style={styles.noticeDate}>Delivered to Faculty • Active Notice</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
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
});
