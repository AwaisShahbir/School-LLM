import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { THEME } from './src/theme/colors';
import { teacherStore } from './src/lib/teacherStore';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { ChangePasswordScreen } from './src/screens/ChangePasswordScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { MarksScreen } from './src/screens/MarksScreen';
import { ClassesScreen } from './src/screens/ClassesScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { NoticesScreen } from './src/screens/NoticesScreen';
import { SportsScreen } from './src/screens/SportsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

type TabType = 'Home' | 'Classes' | 'Calendar' | 'Notices' | 'Profile';
type SubScreenType = 'Attendance' | 'Marks' | 'Timetable' | 'Sports' | null;

export default function App() {
  const [, setTick] = useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Clean initial login state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const [subScreen, setSubScreen] = useState<SubScreenType>(null);

  useEffect(() => {
    return teacherStore.subscribe(() => setTick(t => t + 1));
  }, []);

  const handleLoginSuccess = (changeRequired: boolean) => {
    setIsLoggedIn(true);
    setMustChangePassword(changeRequired);
    setActiveTab('Home');
    setSubScreen(null);
  };

  const handlePasswordChanged = () => {
    setMustChangePassword(false);
  };

  const handleLogout = () => {
    teacherStore.logout();
    setIsLoggedIn(false);
    setSubScreen(null);
  };

  // 1. Not Logged In -> Login Screen
  if (!isLoggedIn) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#E6DCFE" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // 2. Forced Password Change -> Change Password Screen
  if (mustChangePassword) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#F4F3F8" />
        <ChangePasswordScreen onComplete={handlePasswordChanged} />
      </>
    );
  }

  // 3. Sub-screens (modal/stack views)
  if (subScreen === 'Attendance') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <AttendanceScreen onBack={() => setSubScreen(null)} />
      </>
    );
  }

  if (subScreen === 'Marks') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <MarksScreen onBack={() => setSubScreen(null)} />
      </>
    );
  }

  if (subScreen === 'Timetable') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <TimetableScreen onBack={() => setSubScreen(null)} />
      </>
    );
  }

  if (subScreen === 'Sports') {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <SportsScreen onBack={() => setSubScreen(null)} />
      </>
    );
  }

  // 4. Main 5-Tab Application Shell
  return (
    <SafeAreaView style={styles.shellContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#E6DCFE" />

      {/* Screen Body */}
      <View style={styles.screenBody}>
        {activeTab === 'Home' && <HomeScreen onNavigate={(screen) => setSubScreen(screen as SubScreenType)} />}
        {activeTab === 'Classes' && <ClassesScreen onBack={() => setActiveTab('Home')} />}
        {activeTab === 'Calendar' && <CalendarScreen onBack={() => setActiveTab('Home')} />}
        {activeTab === 'Notices' && <NoticesScreen onBack={() => setActiveTab('Home')} />}
        {activeTab === 'Profile' && <ProfileScreen onLogout={handleLogout} onBack={() => setActiveTab('Home')} />}
      </View>

      {/* Bottom Tab Bar with 5 icons per Section 9A */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Home' && styles.tabItemActive]}
          onPress={() => setActiveTab('Home')}
        >
          <Text style={styles.tabEmoji}>🏠</Text>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Classes' && styles.tabItemActive]}
          onPress={() => setActiveTab('Classes')}
        >
          <Text style={styles.tabEmoji}>👥</Text>
          <Text style={[styles.tabLabel, activeTab === 'Classes' && styles.tabLabelActive]}>Classes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Calendar' && styles.tabItemActive]}
          onPress={() => setActiveTab('Calendar')}
        >
          <Text style={styles.tabEmoji}>📅</Text>
          <Text style={[styles.tabLabel, activeTab === 'Calendar' && styles.tabLabelActive]}>Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Notices' && styles.tabItemActive]}
          onPress={() => setActiveTab('Notices')}
        >
          <View>
            <Text style={styles.tabEmoji}>🔔</Text>
            {teacherStore.unreadNotificationCount > 0 && (
              <View style={styles.tabDot} />
            )}
          </View>
          <Text style={[styles.tabLabel, activeTab === 'Notices' && styles.tabLabelActive]}>Notices</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'Profile' && styles.tabItemActive]}
          onPress={() => setActiveTab('Profile')}
        >
          <Text style={styles.tabEmoji}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'Profile' && styles.tabLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shellContainer: {
    flex: 1,
    backgroundColor: THEME.colors.pageBg,
  },
  screenBody: {
    flex: 1,
  },
  bottomBar: {
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9E6F2',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.roundness.pill,
  },
  tabItemActive: {
    backgroundColor: THEME.colors.primaryLight,
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  tabDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.absent,
  },
});
