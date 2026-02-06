import { useCallback, useRef, useEffect, useState } from 'react';

type SoundType = 'scan' | 'success' | 'error' | 'lock' | 'unlock' | 'alert' | 'click';

export const useBiometricSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('biometric_sounds_enabled');
    return stored !== 'false';
  });
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem('biometric_sounds_volume');
    return stored ? parseFloat(stored) : 0.3;
  });

  useEffect(() => {
    localStorage.setItem('biometric_sounds_enabled', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('biometric_sounds_volume', String(volume));
  }, [volume]);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', gain: number = volume) => {
    if (!soundEnabled) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(gain, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [getAudioContext, soundEnabled, volume]);

  const playScan = useCallback(() => {
    // Scanning beep sequence
    playTone(800, 0.1, 'sine', volume * 0.5);
    setTimeout(() => playTone(1000, 0.1, 'sine', volume * 0.5), 150);
    setTimeout(() => playTone(1200, 0.1, 'sine', volume * 0.5), 300);
  }, [playTone, volume]);

  const playSuccess = useCallback(() => {
    // Triumphant success sound
    playTone(523.25, 0.15, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine'), 100); // E5
    setTimeout(() => playTone(783.99, 0.25, 'sine'), 200); // G5
  }, [playTone]);

  const playError = useCallback(() => {
    // Warning/error sound
    playTone(200, 0.2, 'square', volume * 0.3);
    setTimeout(() => playTone(150, 0.3, 'square', volume * 0.3), 200);
  }, [playTone, volume]);

  const playLock = useCallback(() => {
    // Lock sound - descending tone
    playTone(600, 0.1, 'sine');
    setTimeout(() => playTone(400, 0.15, 'sine'), 100);
  }, [playTone]);

  const playUnlock = useCallback(() => {
    // Unlock sound - ascending tone
    playTone(400, 0.1, 'sine');
    setTimeout(() => playTone(600, 0.15, 'sine'), 100);
  }, [playTone]);

  const playAlert = useCallback(() => {
    // Alert notification
    playTone(880, 0.1, 'triangle');
    setTimeout(() => playTone(880, 0.1, 'triangle'), 150);
  }, [playTone]);

  const playClick = useCallback(() => {
    // Soft click
    playTone(1000, 0.05, 'sine', volume * 0.2);
  }, [playTone, volume]);

  const play = useCallback((type: SoundType) => {
    const sounds: Record<SoundType, () => void> = {
      scan: playScan,
      success: playSuccess,
      error: playError,
      lock: playLock,
      unlock: playUnlock,
      alert: playAlert,
      click: playClick,
    };
    sounds[type]?.();
  }, [playScan, playSuccess, playError, playLock, playUnlock, playAlert, playClick]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    play,
    playScan,
    playSuccess,
    playError,
    playLock,
    playUnlock,
    playAlert,
    playClick,
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    volume,
    setVolume,
  };
};
