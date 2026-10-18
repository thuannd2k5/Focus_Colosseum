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

  // Keep latest callbacks in refs so effects do not re-run on callback identity changes
  const onViolationRef = useRef(onViolation);
  const onRecoverRef = useRef(onRecover);
  useEffect(() => {
    onViolationRef.current = onViolation;
    onRecoverRef.current = onRecover;
  });

  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInGracePeriodRef = useRef<boolean>(false);
  const isFacedDownRef = useRef<boolean>(false);
  const isAppActiveRef = useRef<boolean>(true);

  const startGracePeriod = useCallback(() => {
    if (isInGracePeriodRef.current) return; // already in grace period

    isInGracePeriodRef.current = true;
    setIsInGracePeriod(true);
    setGraceSecondsLeft(SENSOR_TOLERANCE.GRACE_PERIOD_SECONDS);

    // Haptic warning
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    let seconds = SENSOR_TOLERANCE.GRACE_PERIOD_SECONDS;
    graceTimerRef.current = setInterval(() => {
      seconds -= 1;
      setGraceSecondsLeft(seconds);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}

      if (seconds <= 0) {
        if (graceTimerRef.current) {
          clearInterval(graceTimerRef.current);
          graceTimerRef.current = null;
        }
        isInGracePeriodRef.current = false;
        setIsInGracePeriod(false);
        if (onViolationRef.current) {
          onViolationRef.current();
        }
      }
    }, 1000);
  }, []);

  const cancelGracePeriod = useCallback(() => {
    if (!isInGracePeriodRef.current) return;

    if (graceTimerRef.current) {
      clearInterval(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    isInGracePeriodRef.current = false;
    setIsInGracePeriod(false);
    setGraceSecondsLeft(SENSOR_TOLERANCE.GRACE_PERIOD_SECONDS);

    if (onRecoverRef.current) {
      onRecoverRef.current();
    }
  }, []);

  // Monitor sensor and app lifecycle
  useEffect(() => {
    if (!enabled) {
      if (graceTimerRef.current) {
        clearInterval(graceTimerRef.current);
        graceTimerRef.current = null;
      }
      isInGracePeriodRef.current = false;
      setIsInGracePeriod(false);
      deactivateKeepAwake();
      return;
    }

    // Keep screen awake while focusing
    activateKeepAwakeAsync().catch(() => {});

    // Polling rate 500ms
    Accelerometer.setUpdateInterval(500);

    const accelSubscription = Accelerometer.addListener((data) => {
      const faceDown = isOrientationFacedDown(data);
      isFacedDownRef.current = faceDown;
      setIsFacedDown(faceDown);

      if (!faceDown && isAppActiveRef.current) {
        startGracePeriod();
      } else if (faceDown && isAppActiveRef.current && isInGracePeriodRef.current) {
        cancelGracePeriod();
      }
    });

    const appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const active = nextAppState === 'active';
      isAppActiveRef.current = active;

      if (!active) {
        startGracePeriod();
      } else if (isFacedDownRef.current && isInGracePeriodRef.current) {
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
      isInGracePeriodRef.current = false;
      deactivateKeepAwake();
    };
  }, [enabled, startGracePeriod, cancelGracePeriod]);

  return {
    isFacedDown,
    isInGracePeriod,
    graceSecondsLeft,
  };
};
