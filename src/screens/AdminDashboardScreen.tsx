import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { adminService, toggleBanStatus } from '../services/adminService';
import { UserProfile, UserStatus } from '../types';

interface AdminDashboardScreenProps {
  users?: UserProfile[];
  onToggleBan?: (userId: string, currentStatus: UserStatus) => Promise<void> | void;
  onBack?: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  users: initialUsers,
  onToggleBan,
  onBack,
}) => {
  const [userList, setUserList] = useState<UserProfile[]>(initialUsers || []);
  const [loading, setLoading] = useState<boolean>(!initialUsers);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialUsers) {
      setUserList(initialUsers);
      setLoading(false);
    } else {
      loadUsers();
    }
  }, [initialUsers]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await adminService.listUsers();
    setUserList(data);
    setLoading(false);
  };

  const handleToggle = async (user: UserProfile) => {
    const nextStatus = toggleBanStatus(user.status);
    const actionLabel = nextStatus === 'banned' ? 'Khóa tài khoản' : 'Mở khóa tài khoản';

    const executeToggle = async () => {
      setUpdatingId(user.id);
      try {
        if (onToggleBan) {
          await onToggleBan(user.id, user.status);
        } else {
          await adminService.toggleUserBan(user.id, user.status);
        }
        setUserList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
        );
      } finally {
        setUpdatingId(null);
      }
    };

    Alert.alert(
      actionLabel,
      `Bạn có chắc chắn muốn ${actionLabel.toLowerCase()} của "${user.displayName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: nextStatus === 'banned' ? 'destructive' : 'default',
          onPress: executeToggle,
        },
      ]
    );
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = userList.filter((u) => u.status === 'active').length;
  const bannedCount = userList.filter((u) => u.status === 'banned').length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Quay lại</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>Bảng Điều Khiển Quản Trị</Text>
        <Text style={styles.subtitle}>
          Kiểm duyệt người dùng, khóa tài khoản vi phạm quy chuẩn
        </Text>
      </View>

      {/* Summary KPI Badges */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiValue}>{userList.length}</Text>
          <Text style={styles.kpiLabel}>Tổng người dùng</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiValue, styles.activeText]}>{activeCount}</Text>
          <Text style={styles.kpiLabel}>Đang hoạt động</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={[styles.kpiValue, styles.bannedText]}>{bannedCount}</Text>
          <Text style={styles.kpiLabel}>Đã bị khóa</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên hiển thị hoặc email..."
          placeholderTextColor="#6E7681"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Users List */}
      <View style={styles.listCard}>
        <Text style={styles.listTitle}>DANH SÁCH CHIẾN BINH</Text>

        {loading ? (
          <ActivityIndicator color="#58A6FF" style={styles.loader} />
        ) : filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>Không tìm thấy người dùng phù hợp.</Text>
        ) : (
          filteredUsers.map((user) => {
            const isUserBanned = user.status === 'banned';
            const isUpdating = updatingId === user.id;

            return (
              <View key={user.id} style={styles.userRow}>
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.displayName}>{user.displayName}</Text>
                    {user.role === 'admin' && (
                      <Text style={styles.adminTag}>ADMIN</Text>
                    )}
                  </View>
                  <Text style={styles.emailText}>{user.email}</Text>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        isUserBanned ? styles.bannedBadge : styles.activeBadge,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isUserBanned ? styles.bannedBadgeText : styles.activeBadgeText,
                        ]}
                      >
                        {isUserBanned ? 'Đã bị khóa' : 'Đang hoạt động'}
                      </Text>
                    </View>
                    <Text style={styles.streakText}>
                      🔥 {user.streak}d • ⏳ {user.totalFocusMinutes}m
                    </Text>
                  </View>
                </View>

                {user.role !== 'admin' && (
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      isUserBanned ? styles.unbanBtn : styles.banBtn,
                      isUpdating && styles.disabledBtn,
                    ]}
                    onPress={() => handleToggle(user)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.toggleBtnText}>
                        {isUserBanned ? 'Mở khóa' : 'Khóa tài khoản'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
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
    marginBottom: 20,
    paddingTop: 16,
  },
  backBtn: {
    marginBottom: 10,
  },
  backBtnText: {
    color: '#58A6FF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#8B949E',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  kpiValue: {
    color: '#F0F6FC',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  activeText: {
    color: '#3FB950',
  },
  bannedText: {
    color: '#F85149',
  },
  kpiLabel: {
    color: '#8B949E',
    fontSize: 11,
    textAlign: 'center',
  },
  searchBox: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#161B22',
    borderColor: '#30363D',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F0F6FC',
    fontSize: 14,
  },
  listCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  listTitle: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    color: '#8B949E',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  displayName: {
    color: '#F0F6FC',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },
  adminTag: {
    backgroundColor: '#9E6A03',
    color: '#F0E6D2',
    fontSize: 9,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  emailText: {
    color: '#8B949E',
    fontSize: 12,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(63, 185, 80, 0.2)',
  },
  activeBadgeText: {
    color: '#3FB950',
    fontSize: 11,
    fontWeight: '600',
  },
  bannedBadge: {
    backgroundColor: 'rgba(248, 81, 73, 0.2)',
  },
  bannedBadgeText: {
    color: '#F85149',
    fontSize: 11,
    fontWeight: '600',
  },
  streakText: {
    color: '#8B949E',
    fontSize: 11,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  banBtn: {
    backgroundColor: '#DA3633',
  },
  unbanBtn: {
    backgroundColor: '#238636',
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
