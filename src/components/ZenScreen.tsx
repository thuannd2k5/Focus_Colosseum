import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ZenScreenProps {
  remainingSeconds: number;
  isInGracePeriod?: boolean;
  graceSecondsLeft?: number;
}

export const ZenScreen: React.FC<ZenScreenProps> = ({
  remainingSeconds,
  isInGracePeriod = false,
  graceSecondsLeft = 10,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {isInGracePeriod ? (
        <View style={styles.graceContainer}>
          <Text style={styles.graceIcon}>⚠️</Text>
          <Text style={styles.graceTitle}>CẢNH BÁO VI PHẠM!</Text>
          <Text style={styles.graceSubtitle}>
            Hãy úp máy xuống bàn ngay!
          </Text>
          <Text style={styles.graceCountdown}>{graceSecondsLeft}s</Text>
        </View>
      ) : (
        <View style={styles.zenContainer}>
          <Text style={styles.dimTitle}>ZEN MODE • ĐANG TẬP TRUNG</Text>
          <Text style={styles.dimTimer}>{formatTime(remainingSeconds)}</Text>
          <Text style={styles.dimQuote}>"Sự tĩnh lặng tạo nên sức mạnh"</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000', // Pure OLED True Black
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  zenContainer: {
    alignItems: 'center',
    opacity: 0.35, // Ultra dim to save battery and prevent distraction
  },
  dimTitle: {
    color: '#8B949E',
    fontSize: 12,
    letterSpacing: 3,
    marginBottom: 16,
  },
  dimTimer: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    marginBottom: 12,
  },
  dimQuote: {
    color: '#484F58',
    fontSize: 13,
    fontStyle: 'italic',
  },
  graceContainer: {
    alignItems: 'center',
    padding: 24,
  },
  graceIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  graceTitle: {
    color: '#FF7B72',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  graceSubtitle: {
    color: '#C9D1D9',
    fontSize: 16,
    marginBottom: 16,
  },
  graceCountdown: {
    color: '#FFA657',
    fontSize: 64,
    fontWeight: 'bold',
  },
});
