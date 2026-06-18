import { useCallback, useRef, useState, useEffect } from "react";

// Notification sound as base64 (short pleasant chime)
const NOTIFICATION_SOUND_URL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdXmHhYN1aGNqa3V2dnJrYFdaYGZscHFuZ11UUFRdZm1vb2tiWE9LTV5pbHBtZ11ST1BcaG1vb2xhVk1KUl9ob3BuaV5UTU9aZWtub2thVUxJT1thZ2tsamFXUExPWmJmaWpmXlVQT1RcYWRnZWBYUU9RV11hZGRgWlNPT1NaXmJjYV1XUVBSV1xfYmFdWFNQUVVaXV9gX1tWUVBSVlpdX15cV1NRUlVZXF1eXVtXVFJTVlpcXV1cWlZUU1RXWltcXFtZVlRUVVhZW1tbWlhWVVRWWFlbW1taWFZVVVZYWVpbW1pYV1ZWV1hZWltbWlhXVlZXWFlZWlpaWVhXV1dYWVlaWlpZWFdXV1hZWVpaWllYV1dYWFlaWlpZWFhXV1hYWVpaWllYWFdYWFlZWlpZWVhYV1hYWVlaWllZWFhXWFhZWVpaWVlYWFdYWFlZWlpZWVhYV1hYWVlaWllZWFhXWFhZWVpaWVlYWA==";

export const useSoundNotification = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem("admin-sound-enabled");
    return stored !== null ? stored === "true" : true;
  });
  const [volume, setVolume] = useState(() => {
    const stored = localStorage.getItem("admin-sound-volume");
    return stored !== null ? parseFloat(stored) : 0.5;
  });

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = volume;
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem("admin-sound-volume", String(volume));
  }, [volume]);

  useEffect(() => {
    localStorage.setItem("admin-sound-enabled", String(soundEnabled));
  }, [soundEnabled]);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.log("Audio play failed:", err);
      });
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playNotificationSound,
    toggleSound,
  };
};
