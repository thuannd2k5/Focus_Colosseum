import { renderHook, act } from '@testing-library/react-native';
import { isOrientationFacedDown, SENSOR_TOLERANCE, useSensors } from '../../src/hooks/useSensors';
import { soundService } from '../../src/services/soundService';
import { Accelerometer } from 'expo-sensors';
import { AppState } from 'react-native';

describe('useSensors: isOrientationFacedDown', () => {
  it('should identify face down when Z axis is near -1.0 within tolerance', () => {
    expect(isOrientationFacedDown({ x: 0, y: 0, z: -0.95 })).toBe(true);
    expect(isOrientationFacedDown({ x: 0, y: 0, z: -0.85 })).toBe(true);
    expect(isOrientationFacedDown({ x: 0, y: 0, z: -1.15 })).toBe(true);
    expect(isOrientationFacedDown({ x: 0, y: 0, z: -1.0 })).toBe(true);
  });

  it('should identify not face down when phone is flat screen up', () => {
    expect(isOrientationFacedDown({ x: 0, y: 0, z: 1.0 })).toBe(false);
    expect(isOrientationFacedDown({ x: 0, y: 0, z: 0.0 })).toBe(false);
    expect(isOrientationFacedDown({ x: 0, y: 0, z: -0.5 })).toBe(false);
    expect(isOrientationFacedDown({ x: 0, y: 0, z: -1.3 })).toBe(false);
  });

  it('should export sensor tolerance constants', () => {
    expect(SENSOR_TOLERANCE.TARGET_Z).toBe(-1.0);
    expect(SENSOR_TOLERANCE.DELTA).toBe(0.2);
    expect(SENSOR_TOLERANCE.GRACE_PERIOD_SECONDS).toBe(10);
  });
});

describe('useSensors hook countdown and recovery lifecycle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should cancel grace period when phone is flipped back face-down within 10 seconds (transient jitter)', () => {
    let accelCallback: any = null;
    (Accelerometer.addListener as jest.Mock).mockImplementationOnce((cb) => {
      accelCallback = cb;
      return { remove: jest.fn() };
    });

    const onViolation = jest.fn();
    const onRecover = jest.fn();

    const { result } = renderHook(() =>
      useSensors({ enabled: true, onViolation, onRecover })
    );

    // Initial face-down state
    act(() => {
      accelCallback({ x: 0, y: 0, z: -1.0 });
    });
    expect(result.current.isFacedDown).toBe(true);
    expect(result.current.isInGracePeriod).toBe(false);

    // Bump/Tilt up (violation triggers grace period)
    act(() => {
      accelCallback({ x: 0, y: 0, z: 0 });
    });
    expect(result.current.isInGracePeriod).toBe(true);

    // Advance 3 seconds (less than 10s)
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Recover back face-down
    act(() => {
      accelCallback({ x: 0, y: 0, z: -0.98 });
    });

    expect(result.current.isInGracePeriod).toBe(false);
    expect(onRecover).toHaveBeenCalled();
    expect(onViolation).not.toHaveBeenCalled();
  });

  it('should trigger onViolation when phone remains lifted beyond 10 seconds', () => {
    let accelCallback: any = null;
    (Accelerometer.addListener as jest.Mock).mockImplementationOnce((cb) => {
      accelCallback = cb;
      return { remove: jest.fn() };
    });

    const onViolation = jest.fn();
    const onRecover = jest.fn();

    const { result } = renderHook(() =>
      useSensors({ enabled: true, onViolation, onRecover })
    );

    // Tilt up
    act(() => {
      accelCallback({ x: 0, y: 0, z: 0.5 });
    });
    expect(result.current.isInGracePeriod).toBe(true);

    // Advance 10 full seconds
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(onViolation).toHaveBeenCalledTimes(1);
  });
});

describe('soundService', () => {
  it('should provide playViolationAlarm and playSuccessFanfare methods', async () => {
    expect(typeof soundService.playViolationAlarm).toBe('function');
    expect(typeof soundService.playSuccessFanfare).toBe('function');
    expect(typeof soundService.stopAlarm).toBe('function');

    await expect(soundService.playViolationAlarm()).resolves.not.toThrow();
    await expect(soundService.stopAlarm()).resolves.not.toThrow();
  });
});
