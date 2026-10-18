import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

interface BannedModalProps {
  visible: boolean;
  onSignOut: () => void;
  reason?: string;
}

export const BannedModal: React.FC<BannedModalProps> = ({
  visible,
  onSignOut,
  reason = 'Hành vi vi phạm quy tắc kỷ luật hoặc gian lận cảm biến.',
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>⚔️🚫</Text>
          <Text style={styles.title}>Tài khoản của bạn đã bị khóa</Text>
          <Text style={styles.description}>
            Bạn không có quyền tham gia hoặc tạo phòng đấu trường.
          </Text>
          <View style={styles.reasonBox}>
            <Text style={styles.reasonLabel}>Lý do:</Text>
            <Text style={styles.reasonText}>{reason}</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
            <Text style={styles.signOutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DA3633',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#8B949E',
    textAlign: 'center',
    marginBottom: 16,
  },
  reasonBox: {
    backgroundColor: '#21262D',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 20,
  },
  reasonLabel: {
    fontSize: 12,
    color: '#8B949E',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#C9D1D9',
  },
  signOutButton: {
    backgroundColor: '#DA3633',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
