import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { roomService } from '../services/roomService';
import { Room, UserProfile } from '../types';

interface CreateJoinRoomScreenProps {
  profile: UserProfile | null;
  onRoomReady: (room: Room) => void;
  onBack: () => void;
}

const DURATIONS = [15, 25, 30, 45];

export const CreateJoinRoomScreen: React.FC<CreateJoinRoomScreenProps> = ({
  profile,
  onRoomReady,
  onBack,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [pinCode, setPinCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (!profile) return;
    setLoading(true);
    setErrorMessage(null);
    const { room, error } = await roomService.createRoom(selectedDuration, profile);
    setLoading(false);

    if (error || !room) {
      setErrorMessage(error?.message || 'Không thể tạo phòng.');
      return;
    }
    onRoomReady(room);
  };

  const handleJoinRoom = async () => {
    if (!profile) return;
    if (pinCode.trim().length !== 6) {
      setErrorMessage('Mã PIN phòng phải gồm đúng 6 chữ số.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    const { room, error } = await roomService.joinRoom(pinCode.trim(), profile);
    setLoading(false);

    if (error || !room) {
      setErrorMessage(error?.message || 'Không thể tham gia phòng.');
      return;
    }
    onRoomReady(room);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chuẩn Bị Chiến Trận</Text>
      </View>

      {errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
        </View>
      )}

      {/* Section 1: Create Room */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🏛️ Tạo Phòng Tập Trung Mới</Text>
        <Text style={styles.sectionSubtitle}>
          Chọn thời gian tập trung (phút) cho cả đội:
        </Text>

        <View style={styles.durationSelector}>
          {DURATIONS.map((dur) => (
            <TouchableOpacity
              key={dur}
              style={[
                styles.durationChip,
                selectedDuration === dur && styles.selectedChip,
              ]}
              onPress={() => setSelectedDuration(dur)}
            >
              <Text
                style={[
                  styles.durationText,
                  selectedDuration === dur && styles.selectedDurationText,
                ]}
              >
                {dur}p
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, styles.createBtn, loading && styles.disabledBtn]}
          onPress={handleCreateRoom}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0D1117" />
          ) : (
            <Text style={styles.createBtnText}>Tạo phòng ({selectedDuration} phút)</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>HOẶC</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Section 2: Join Room via PIN */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🔑 Vào Phòng Bằng Mã PIN</Text>
        <Text style={styles.sectionSubtitle}>
          Nhập mã PIN 6 số do trưởng phòng cung cấp:
        </Text>

        <TextInput
          style={styles.pinInput}
          placeholder="Ví dụ: 889900"
          placeholderTextColor="#6E7681"
          value={pinCode}
          onChangeText={setPinCode}
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.actionBtn, styles.joinBtn, loading && styles.disabledBtn]}
          onPress={handleJoinRoom}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.joinBtnText}>Tham gia phòng ngay</Text>
          )}
        </TouchableOpacity>
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
    marginBottom: 12,
  },
  backBtnText: {
    color: '#58A6FF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F0F6FC',
  },
  errorBox: {
    backgroundColor: 'rgba(218, 54, 51, 0.2)',
    borderColor: '#DA3633',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#F85149',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  sectionTitle: {
    color: '#F0F6FC',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionSubtitle: {
    color: '#8B949E',
    fontSize: 13,
    marginBottom: 16,
  },
  durationSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  durationChip: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#21262D',
    borderWidth: 1,
    borderColor: '#30363D',
    alignItems: 'center',
  },
  selectedChip: {
    backgroundColor: '#1F6FEB',
    borderColor: '#58A6FF',
  },
  durationText: {
    color: '#8B949E',
    fontSize: 15,
    fontWeight: 'bold',
  },
  selectedDurationText: {
    color: '#FFFFFF',
  },
  pinInput: {
    backgroundColor: '#0D1117',
    borderColor: '#30363D',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 6,
    color: '#F0F6FC',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createBtn: {
    backgroundColor: '#F778BA',
  },
  createBtnText: {
    color: '#0D1117',
    fontSize: 15,
    fontWeight: 'bold',
  },
  joinBtn: {
    backgroundColor: '#238636',
  },
  joinBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#30363D',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#8B949E',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
