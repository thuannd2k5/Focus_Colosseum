import { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';

export const SENSOR_TOLERANCE = {
  TARGET_Z: -1.0,
  DELTA: 0.2,
  GRACE_PERIOD_SECONDS: 10,
};

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export const isOrientationFacedDown = (data: AccelerometerData): boolean => {
  const minZ = SENSOR_TOLERANCE.TARGET_Z - SENSOR_TOLERANCE.DELTA;
  const maxZ = SENSOR_TOLERANCE.TARGET_Z + SENSOR_TOLERANCE.DELTA;
  return data.z >= minZ && data.z <= maxZ;
};

interface UseSensorsOptions {
  enabled?: boolean;
  onViolation?: () => void;
  onRecover?: () => void;
}

export const useSensors = ({
  enabled = false,
  onViolation,
  onRecover,
}: UseSensorsOptions = {}) => {
  const [isFacedDown, setIsFacedDown] = useState<boolean>(false);
  const [isInGracePeriod, setIsInGracePeriod] = useState<boolean>(false);
  const [graceSecondsLeft, setGraceSecondsLeft] = useState<number>(SENSOR_TOLERANCE.GRACE_PERIOD_SECONDS);

  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFacedDownRef = useRef<boolean>(false);
  const isAppActiveRef = useRef<boolean>(true);

  // Keep ref up to date
  isFacedDownRef.current = isFacedDown;

  const startGracePeriod = useCallback(() => {
    if (graceTimerRef.current) return; // already running

    setIsInGracePeriod(true);
    setGraceSecondsLeft(SENSOR_TOLERANCE.GRACE_PERIOD_SECONDS);

    // Haptic alert on initial violation
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    let seconds = SENSOR_TOLERANCE.GRACE_PERIOD_SECONDS;
    graceTimerRef.current = setInterval(() => {
      seconds -= 1;
      setGraceSecondsLeft(seconds);

      // Pulse haptic during countdown
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}

      if (seconds <= 0) {
        if (graceTimerRef.current) {
          clearInterval(graceTimerRef.current);
          graceTimerRef.current = null;
        }
        setIsInGracePeriod(false);
        if (onViolation) {
          onViolation();
        }
      }
    }, 1000);
  }, [onViolation]);

  const cancelGracePeriod = useCallback(() => {
    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    setIsInGracePeriod(false);
    setGraceSecondsLeft(SENSOR_TOLERANCE.GRACE_PERIOD_SECONDS);
    if (onRecover) {
      onRecover();
    }
  }, [onRecover]);

  // Monitor sensor and app state changes
  useEffect(() => {
    if (!enabled) {
      cancelGracePeriod();
      deactivateKeepAwake();
      return;
    }

    // Keep screen awake while focusing
    activateKeepAwakeAsync().catch(() => {});

    // Set accelerometer polling rate
    Accelerometer.setUpdateInterval(500); // 2 times per second is battery friendly

    const accelSubscription = Accelerometer.addListener((data) => {
      const faceDown = isOrientationFacedDown(data);
      setIsFacedDown(faceDown);

      if (!faceDown && isAppActiveRef.current) {
        startGracePeriod();
      } else if (faceDown && isAppActiveRef.current && isInGracePeriod) {
        cancelGracePeriod();
      }
    });

    const appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const active = nextAppState === 'active';
      isAppActiveRef.current = active;

      if (!active) {
        startGracePeriod();
      } else if (isFacedDownRef.current) {
        cancelGracePeriod();
      }
    });

    return () => {
      accelSubscription.remove();
      appStateSubscription.remove();
      if (graceTimerRef.current) {
        clearInterval(graceTimerRef.current);
        graceTimerRef.current = null;
      }
      deactivateKeepAwake();
    };
  }, [enabled, isInGracePeriod, startGracePeriod, cancelGracePeriod]);

  return {
    isFacedDown,
    isInGracePeriod,
    graceSecondsLeft,
  };
};
