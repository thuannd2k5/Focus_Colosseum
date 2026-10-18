import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Room, RoomParticipant } from '../types';

interface LobbyScreenProps {
  room: Room;
  participants: RoomParticipant[];
  isHost: boolean;
  onStartSession: () => void;
  onLeaveRoom: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  participants,
  isHost,
  onStartSession,
  onLeaveRoom,
}) => {
  const participantCount = participants.length;
  const isReadyToStart = participantCount >= 1; // Can start with 1+ (optimal 2-6)

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeaveRoom}>
          <Text style={styles.leaveBtnText}>✕ Rời phòng</Text>
        </TouchableOpacity>
        <Text style={styles.roomType}>PHÒNG CHỜ ĐẤU TRƯỜNG</Text>
      </View>

      {/* PIN Code Display Box */}
      <View style={styles.pinCard}>
        <Text style={styles.pinLabel}>MÃ PIN PHÒNG</Text>
        <Text style={styles.pinCode}>{room.code}</Text>
        <Text style={styles.pinNotice}>
          Chia sẻ mã 6 số này cho bạn bè để cùng vào phòng
        </Text>
        <View style={styles.durationBadge}>
          <Text style={styles.durationBadgeText}>
            ⏱️ Thời gian: {room.durationMinutes} phút
          </Text>
        </View>
      </View>

      {/* Participants List */}
      <View style={styles.participantsCard}>
        <View style={styles.participantsHeader}>
          <Text style={styles.participantsTitle}>ĐỘI NGŨ CHIẾN BINH</Text>
          <Text style={styles.participantsCount}>{participantCount}/6</Text>
        </View>

        {participants.map((p, idx) => {
          const isParticipantHost = p.userId === room.hostId;
          return (
            <View key={p.userId || idx} style={styles.participantRow}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantAvatar}>🛡️</Text>
                <View>
                  <View style={styles.nameContainer}>
                    <Text style={styles.participantName}>{p.displayName}</Text>
                    {isParticipantHost && (
                      <Text style={styles.hostBadge}>CHỦ PHÒNG</Text>
                    )}
                  </View>
                  <Text style={styles.participantStatus}>
                    {p.isFacedDown ? 'Đã úp máy 📱' : 'Sẵn sàng ✅'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Action Button */}
      <View style={styles.footer}>
        {isHost ? (
          <TouchableOpacity
            style={[styles.startBtn, !isReadyToStart && styles.disabledBtn]}
            onPress={onStartSession}
            disabled={!isReadyToStart}
          >
            <Text style={styles.startBtnText}>
              BẮT ĐẦU TẬP TRUNG ({room.durationMinutes} PHÚT)
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingNotice}>
            <Text style={styles.waitingNoticeText}>
              ⏳ Đang đợi chủ phòng khai mạc phiên tập trung...
            </Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16,
  },
  leaveBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#21262D',
    borderRadius: 6,
  },
  leaveBtnText: {
    color: '#F85149',
    fontSize: 13,
    fontWeight: '600',
  },
  roomType: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  pinCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#30363D',
    alignItems: 'center',
    marginBottom: 20,
  },
  pinLabel: {
    color: '#8B949E',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  pinCode: {
    color: '#58A6FF',
    fontSize: 44,
    fontWeight: 'bold',
    letterSpacing: 8,
    marginBottom: 8,
  },
  pinNotice: {
    color: '#8B949E',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  durationBadge: {
    backgroundColor: '#21262D',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  durationBadgeText: {
    color: '#F0F6FC',
    fontSize: 13,
    fontWeight: '600',
  },
  participantsCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 24,
  },
  participantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  participantsTitle: {
    color: '#8B949E',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  participantsCount: {
    color: '#58A6FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    color: '#F0F6FC',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  hostBadge: {
    backgroundColor: '#9E6A03',
    color: '#F0E6D2',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  participantStatus: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    marginTop: 'auto',
  },
  startBtn: {
    backgroundColor: '#238636',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  waitingNotice: {
    backgroundColor: '#21262D',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  waitingNoticeText: {
    color: '#C9D1D9',
    fontSize: 14,
  },
});
