import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let alarmSoundInstance: Audio.Sound | null = null;

export const soundService = {
  async playViolationAlarm(): Promise<void> {
    try {
      // Fire strong haptic alert
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Play alert horn/sound
      try {
        const { sound } = await Audio.Sound.createAsync(
          // Fallback URI or asset placeholder
          { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
          { shouldPlay: true, isLooping: true }
        );
        alarmSoundInstance = sound;
        await sound.playAsync();
      } catch {
        // Audio playback failed (e.g. offline/mock environment)
      }
    } catch {
      // Audio or haptics unavailable
    }
  },

  async playSuccessFanfare(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://actions.google.com/sounds/v1/cartoon/clap_applause.ogg' },
          { shouldPlay: true }
        );
        await sound.playAsync();
      } catch {}
    } catch {}
  },

  async stopAlarm(): Promise<void> {
    try {
      if (alarmSoundInstance) {
        await alarmSoundInstance.stopAsync();
        await alarmSoundInstance.unloadAsync();
        alarmSoundInstance = null;
      }
    } catch {}
  },
};
