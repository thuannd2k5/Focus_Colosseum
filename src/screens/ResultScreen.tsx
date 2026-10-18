import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ResultScreenProps {
  status: 'completed' | 'failed';
  durationMinutes: number;
  failedBy?: {
    userId: string;
    displayName: string;
    reason?: string;
  };
  onBackHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  status,
  durationMinutes,
  failedBy,
  onBackHome,
}) => {
  const isVictory = status === 'completed';

  return (
    <View style={styles.container}>
      <View style={[styles.card, isVictory ? styles.victoryBorder : styles.defeatBorder]}>
        <Text style={styles.icon}>{isVictory ? '🏆' : '💀'}</Text>
        <Text style={[styles.title, isVictory ? styles.victoryTitle : styles.defeatTitle]}>
          {isVictory ? 'CHIẾN THẮNG VINH QUANG!' : 'PHIÊN TẬP TRUNG THẤT BẠI'}
        </Text>

        <Text style={styles.subtitle}>
          {isVictory
            ? `Cả đội đã xuất sắc hoàn thành trọn vẹn ${durationMinutes} phút kỷ luật!`
            : 'Đấu trường bị phá vỡ vì có thành viên không giữ được cam kết.'}
        </Text>

        {isVictory ? (
          <View style={styles.rewardBox}>
            <Text style={styles.rewardIcon}>🔥</Text>
            <View>
              <Text style={styles.rewardTitle}>+1 Chuỗi ngày kỷ luật (Streak)</Text>
              <Text style={styles.rewardDesc}>+{durationMinutes} phút tập trung tích lũy</Text>
            </View>
          </View>
        ) : (
          <View style={styles.shameBox}>
            <Text style={styles.shameHeading}>CHIẾN BINH VI PHẠM KỶ LUẬT:</Text>
            <Text style={styles.violatorName}>
              ⚔️ {failedBy?.displayName || 'Một thành viên'}
            </Text>
            <Text style={styles.shameReason}>
              Lý do: {failedBy?.reason || 'Lật điện thoại hoặc chuyển ứng dụng'}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, isVictory ? styles.victoryBtn : styles.defeatBtn]}
          onPress={onBackHome}
        >
          <Text style={styles.actionBtnText}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#161B22',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  victoryBorder: {
    borderColor: '#3FB950',
  },
  defeatBorder: {
    borderColor: '#DA3633',
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  victoryTitle: {
    color: '#3FB950',
  },
  defeatTitle: {
    color: '#F85149',
  },
  subtitle: {
    color: '#8B949E',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  rewardBox: {
    backgroundColor: '#21262D',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#238636',
  },
  rewardIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  rewardTitle: {
    color: '#F0F6FC',
    fontSize: 15,
    fontWeight: 'bold',
  },
  rewardDesc: {
    color: '#8B949E',
    fontSize: 13,
    marginTop: 2,
  },
  shameBox: {
    backgroundColor: 'rgba(218, 54, 51, 0.15)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#DA3633',
    alignItems: 'center',
  },
  shameHeading: {
    color: '#FFA657',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  violatorName: {
    color: '#F85149',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  shameReason: {
    color: '#8B949E',
    fontSize: 12,
    textAlign: 'center',
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  victoryBtn: {
    backgroundColor: '#238636',
  },
  defeatBtn: {
    backgroundColor: '#30363D',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
