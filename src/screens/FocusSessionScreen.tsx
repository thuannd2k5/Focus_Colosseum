import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSensors } from '../hooks/useSensors';
import { useRealtimeRoom } from '../hooks/useRealtimeRoom';
import { ZenScreen } from '../components/ZenScreen';
import { soundService } from '../services/soundService';
import { Room, UserProfile } from '../types';

interface FocusSessionScreenProps {
  room: Room;
  currentUser: UserProfile | null;
  onSessionFinish: (
    status: 'completed' | 'failed',
    failedBy?: { userId: string; displayName: string; reason?: string }
  ) => void;
}

export const FocusSessionScreen: React.FC<FocusSessionScreenProps> = ({
  room,
  currentUser,
  onSessionFinish,
}) => {
  const totalSeconds = room.durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    failedMember,
    notifyViolation,
    notifyFaceDown,
    completeSession,
  } = useRealtimeRoom({
    roomId: room.id,
    currentUser,
    onRoomFailed: (failed) => {
      soundService.playViolationAlarm();
      onSessionFinish('failed', failed);
    },
    onSessionComplete: () => {
      soundService.playSuccessFanfare();
      onSessionFinish('completed');
    },
  });

  const handleViolation = () => {
    soundService.playViolationAlarm();
    notifyViolation('Lật máy hoặc rời ứng dụng quá thời gian ân hạn 10s');
  };

  const handleRecover = () => {
    soundService.stopAlarm();
    notifyFaceDown(true);
  };

  const { isFacedDown, isInGracePeriod, graceSecondsLeft } = useSensors({
    enabled: true,
    onViolation: handleViolation,
    onRecover: handleRecover,
  });

  // Track faced down status for peer presence
  useEffect(() => {
    notifyFaceDown(isFacedDown);
  }, [isFacedDown, notifyFaceDown]);

  // Main session countdown timer
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          completeSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [completeSession]);

  const handleGiveUp = () => {
    Alert.alert(
      'Bỏ cuộc?',
      'Nếu bạn bỏ cuộc, cả phòng sẽ lập tức bị xử thua và tên bạn sẽ bị ghi nhận vi phạm!',
      [
        { text: 'Tiếp tục tập trung', style: 'cancel' },
        {
          text: 'Chấp nhận bỏ cuộc',
          style: 'destructive',
          onPress: () => {
            handleViolation();
          },
        },
      ]
    );
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* If phone is face-down OR currently in grace period, render ZenScreen */}
      {isFacedDown || isInGracePeriod ? (
        <ZenScreen
          remainingSeconds={secondsRemaining}
          isInGracePeriod={isInGracePeriod}
          graceSecondsLeft={graceSecondsLeft}
        />
      ) : (
        <View style={styles.promptContainer}>
          <Text style={styles.promptIcon}>📱⬇️</Text>
          <Text style={styles.promptTitle}>ÚP ĐIỆN THOẠI XUỐNG BÀN</Text>
          <Text style={styles.promptSubtitle}>
            Để kích hoạt chế độ tập trung và màn hình Zen tối giản
          </Text>

          <View style={styles.timerCard}>
            <Text style={styles.timerText}>{formatTimer(secondsRemaining)}</Text>
            <Text style={styles.timerSubText}>Thời gian còn lại</Text>
          </View>

          <TouchableOpacity style={styles.giveUpBtn} onPress={handleGiveUp}>
            <Text style={styles.giveUpText}>Bỏ cuộc (Phạt toàn đội)</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  promptIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  promptTitle: {
    color: '#D29922',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  promptSubtitle: {
    color: '#8B949E',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
  },
  timerCard: {
    backgroundColor: '#161B22',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
    marginBottom: 40,
  },
  timerText: {
    color: '#F0F6FC',
    fontSize: 48,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  timerSubText: {
    color: '#8B949E',
    fontSize: 12,
    marginTop: 4,
  },
  giveUpBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#21262D',
  },
  giveUpText: {
    color: '#F85149',
    fontSize: 13,
  },
});
