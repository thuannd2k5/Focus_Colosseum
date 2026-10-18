import { isOrientationFacedDown, SENSOR_TOLERANCE } from '../../src/hooks/useSensors';
import { soundService } from '../../src/services/soundService';

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

describe('soundService', () => {
  it('should provide playViolationAlarm and playSuccessFanfare methods', async () => {
    expect(typeof soundService.playViolationAlarm).toBe('function');
    expect(typeof soundService.playSuccessFanfare).toBe('function');
    expect(typeof soundService.stopAlarm).toBe('function');

    await expect(soundService.playViolationAlarm()).resolves.not.toThrow();
    await expect(soundService.stopAlarm()).resolves.not.toThrow();
  });
});
