import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { UserProfile } from '../types';

interface HomeScreenProps {
  profile: UserProfile | null;
  onNavigate: (screen: 'create-join' | 'admin' | 'profile') => void;
  onSignOut?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  profile,
  onNavigate,
  onSignOut,
}) => {
  const streak = profile?.streak || 0;
  const totalMinutes = profile?.totalFocusMinutes || 0;
  const isAdmin = profile?.role === 'admin';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.avatar}>🏛️</Text>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{profile?.displayName || 'Chiến binh'}</Text>
              {isAdmin && <Text style={styles.adminBadge}>ADMIN</Text>}
            </View>
            <Text style={styles.emailText}>{profile?.email}</Text>
          </View>
        </View>

        {onSignOut && (
          <TouchableOpacity style={styles.logoutBtn} onPress={onSignOut}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Streak and Stats Banner */}
      <View style={styles.statsCard}>
        <Text style={styles.statsHeading}>CHỈ SỐ ĐẤU TRƯỜNG</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{streak} ngày</Text>
            <Text style={styles.statLabel}>Chuỗi tập trung</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statValue}>{totalMinutes} phút</Text>
            <Text style={styles.statLabel}>Tổng thời gian</Text>
          </View>
        </View>
      </View>

      {/* Main Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.primaryActionButton}
          onPress={() => onNavigate('create-join')}
        >
          <Text style={styles.actionIcon}>⚔️</Text>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionButtonTitle}>Tạo phòng hoặc Vào phòng</Text>
            <Text style={styles.actionButtonSubtitle}>
              Lập đội 2–6 chiến binh hoặc tham gia bằng mã PIN
            </Text>
          </View>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={styles.adminActionButton}
            onPress={() => onNavigate('admin')}
          >
            <Text style={styles.actionIcon}>🛡️</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.adminActionTitle}>Bảng Quản Trị (Admin)</Text>
              <Text style={styles.actionButtonSubtitle}>
                Quản lý người dùng, khóa / mở khóa tài khoản
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Rules summary banner */}
      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>📜 QUY TẮC ĐẤU TRƯỜNG</Text>
        <Text style={styles.ruleItem}>1. Bắt đầu phiên: Úp điện thoại xuống mặt bàn.</Text>
        <Text style={styles.ruleItem}>2. Tuyệt đối không bật màn hình hoặc đổi ứng dụng.</Text>
        <Text style={styles.ruleItem}>3. 10 giây ân hạn nếu nhấc máy trước khi cả phòng thất bại!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0D1117',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 34,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    color: '#F0F6FC',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  adminBadge: {
    backgroundColor: '#9E6A03',
    color: '#F0E6D2',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  emailText: {
    color: '#8B949E',
    fontSize: 13,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#21262D',
    borderRadius: 6,
  },
  logoutText: {
    color: '#8B949E',
    fontSize: 12,
  },
  statsCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 24,
  },
  statsHeading: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  statValue: {
    color: '#F0F6FC',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#8B949E',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#30363D',
  },
  actionSection: {
    marginBottom: 24,
  },
  primaryActionButton: {
    backgroundColor: '#1F6FEB',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  adminActionButton: {
    backgroundColor: '#238636',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  adminActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    color: '#E6EDF3',
    fontSize: 12,
    opacity: 0.85,
  },
  rulesCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  rulesTitle: {
    color: '#D29922',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  ruleItem: {
    color: '#C9D1D9',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
});
