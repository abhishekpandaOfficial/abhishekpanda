import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminSettings {
  inactivityTimeout: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  volume: number;
}

const DEFAULT_SETTINGS: AdminSettings = {
  inactivityTimeout: 60000, // 60 seconds default
  soundEnabled: true,
  hapticEnabled: true,
  volume: 0.7,
};

const LOCAL_STORAGE_KEY = 'admin_settings_cache';

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage first, then sync with database
  useEffect(() => {
    const loadSettings = async () => {
      // First, try to load from localStorage for instant UI
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          setSettings(parsedCache);
        }
      } catch (e) {
        console.error('Error loading cached settings:', e);
      }

      // Then sync with database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching settings:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          const dbSettings: AdminSettings = {
            inactivityTimeout: data.inactivity_timeout,
            soundEnabled: data.sound_enabled,
            hapticEnabled: data.haptic_enabled,
            volume: Number(data.volume),
          };
          setSettings(dbSettings);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dbSettings));
        } else {
          // Create default settings in database
          await supabase.from('admin_settings').insert({
            user_id: user.id,
            inactivity_timeout: DEFAULT_SETTINGS.inactivityTimeout,
            sound_enabled: DEFAULT_SETTINGS.soundEnabled,
            haptic_enabled: DEFAULT_SETTINGS.hapticEnabled,
            volume: DEFAULT_SETTINGS.volume,
          });
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
      
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  // Update a single setting
  const updateSetting = useCallback(async <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage immediately for persistence
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));

    // Sync to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dbKey = key === 'inactivityTimeout' ? 'inactivity_timeout' :
                    key === 'soundEnabled' ? 'sound_enabled' :
                    key === 'hapticEnabled' ? 'haptic_enabled' : key;

      await supabase
        .from('admin_settings')
        .update({ [dbKey]: value })
        .eq('user_id', user.id);
    } catch (err) {
      console.error('Error saving setting:', err);
    }
  }, [settings]);

  return {
    settings,
    isLoading,
    updateInactivityTimeout: (timeout: number) => updateSetting('inactivityTimeout', timeout),
    updateSoundEnabled: (enabled: boolean) => updateSetting('soundEnabled', enabled),
    updateHapticEnabled: (enabled: boolean) => updateSetting('hapticEnabled', enabled),
    updateVolume: (volume: number) => updateSetting('volume', volume),
  };
};
