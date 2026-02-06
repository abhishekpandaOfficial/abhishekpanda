import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeoData {
  ip: string;
  city: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface IPCheckResult {
  allowed: boolean;
  whitelisted?: boolean;
  reason?: string;
}

interface LoginPattern {
  usual_countries: string[];
  usual_cities: string[];
  usual_ips: string[];
  last_login_location?: GeoData;
}

// Suspicious countries with high fraud rates
const HIGH_RISK_COUNTRIES = ['RU', 'CN', 'KP', 'IR', 'NG', 'UA'];

// Rate limiting storage
const ipAttempts: Record<string, { count: number; timestamp: number }> = {};
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS_PER_WINDOW = 5;

export const useGeoBlocking = () => {
  const [currentLocation, setCurrentLocation] = useState<GeoData | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');

  const fetchGeoData = async (): Promise<GeoData | null> => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const geoData: GeoData = {
          ip: data.ip,
          city: data.city,
          country: data.country_name,
          country_code: data.country_code,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
        };
        setCurrentLocation(geoData);
        return geoData;
      }
    } catch (error) {
      console.error('Failed to fetch geo data:', error);
    }
    return null;
  };

  // Check IP against database whitelist/blacklist
  const checkIPRules = async (ip: string): Promise<IPCheckResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('location-confirmation', {
        body: { action: 'check_ip', ipAddress: ip }
      });

      if (error) {
        console.error('Error checking IP rules:', error);
        return { allowed: true };
      }

      return data as IPCheckResult;
    } catch (error) {
      console.error('Failed to check IP rules:', error);
      return { allowed: true };
    }
  };

  // Check IP-based rate limiting
  const checkRateLimit = (ip: string): { blocked: boolean; remainingAttempts: number } => {
    const now = Date.now();
    const record = ipAttempts[ip];

    if (!record || (now - record.timestamp) > RATE_LIMIT_WINDOW) {
      // Reset or initialize
      ipAttempts[ip] = { count: 1, timestamp: now };
      return { blocked: false, remainingAttempts: MAX_ATTEMPTS_PER_WINDOW - 1 };
    }

    // Check if within window
    if (record.count >= MAX_ATTEMPTS_PER_WINDOW) {
      const timeRemaining = Math.ceil((RATE_LIMIT_WINDOW - (now - record.timestamp)) / 1000 / 60);
      setBlockReason(`Too many attempts from this IP. Please wait ${timeRemaining} minutes.`);
      setIsBlocked(true);
      return { blocked: true, remainingAttempts: 0 };
    }

    // Increment count
    record.count++;
    return { blocked: false, remainingAttempts: MAX_ATTEMPTS_PER_WINDOW - record.count };
  };

  // Increment failed attempt for rate limiting
  const recordFailedAttempt = (ip: string) => {
    const now = Date.now();
    const record = ipAttempts[ip];

    if (!record || (now - record.timestamp) > RATE_LIMIT_WINDOW) {
      ipAttempts[ip] = { count: 1, timestamp: now };
    } else {
      record.count++;
    }
  };

  // Check if location is suspicious based on user's pattern
  const checkLocationAnomaly = async (
    email: string,
    currentGeo: GeoData
  ): Promise<{ suspicious: boolean; reason: string }> => {
    try {
      // Fetch user's login history
      const { data: loginHistory } = await supabase
        .from('login_audit_logs')
        .select('country, city, ip_address')
        .eq('email', email)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!loginHistory || loginHistory.length < 3) {
        // Not enough history to determine pattern
        return { suspicious: false, reason: '' };
      }

      // Build pattern
      const usualCountries = new Set(loginHistory.map(l => l.country).filter(Boolean));
      const usualCities = new Set(loginHistory.map(l => l.city).filter(Boolean));

      // Check if current location matches pattern
      const isNewCountry = !usualCountries.has(currentGeo.country);
      const isNewCity = !usualCities.has(currentGeo.city);

      if (isNewCountry) {
        return {
          suspicious: true,
          reason: `Login attempt from new country: ${currentGeo.country}. Your usual countries: ${Array.from(usualCountries).join(', ')}`,
        };
      }

      if (isNewCity && usualCities.size > 5) {
        return {
          suspicious: true,
          reason: `Login attempt from unusual city: ${currentGeo.city}`,
        };
      }

      return { suspicious: false, reason: '' };
    } catch (error) {
      console.error('Error checking location anomaly:', error);
      return { suspicious: false, reason: '' };
    }
  };

  // Calculate risk level based on various factors
  const calculateRiskLevel = (
    geoData: GeoData,
    isNewLocation: boolean,
    failedAttempts: number
  ): 'low' | 'medium' | 'high' => {
    let riskScore = 0;

    // High risk country
    if (HIGH_RISK_COUNTRIES.includes(geoData.country_code)) {
      riskScore += 40;
    }

    // New location
    if (isNewLocation) {
      riskScore += 20;
    }

    // Failed attempts
    riskScore += failedAttempts * 10;

    // VPN/proxy detection (basic - check for common VPN providers)
    // This would need a more sophisticated approach in production

    if (riskScore >= 50) return 'high';
    if (riskScore >= 25) return 'medium';
    return 'low';
  };

  // Main validation function
  const validateLogin = async (email: string): Promise<{
    allowed: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    warnings: string[];
    geoData: GeoData | null;
  }> => {
    const warnings: string[] = [];
    let allowed = true;

    // Fetch current location
    const geoData = await fetchGeoData();
    if (!geoData) {
      warnings.push('Could not determine your location');
      return { allowed: true, riskLevel: 'medium', warnings, geoData: null };
    }

    // Check rate limiting
    const { blocked, remainingAttempts } = checkRateLimit(geoData.ip);
    if (blocked) {
      return { 
        allowed: false, 
        riskLevel: 'high', 
        warnings: [blockReason], 
        geoData 
      };
    }

    // Check high-risk country
    if (HIGH_RISK_COUNTRIES.includes(geoData.country_code)) {
      warnings.push(`Login from high-risk country: ${geoData.country}`);
      setRiskLevel('high');
    }

    // Check location anomaly
    const anomaly = await checkLocationAnomaly(email, geoData);
    if (anomaly.suspicious) {
      warnings.push(anomaly.reason);
      setRiskLevel(prev => prev === 'low' ? 'medium' : prev);
    }

    // Calculate final risk level
    const risk = calculateRiskLevel(geoData, anomaly.suspicious, ipAttempts[geoData.ip]?.count || 0);
    setRiskLevel(risk);

    // Block high-risk attempts from high-risk countries with anomalies
    if (risk === 'high' && anomaly.suspicious && HIGH_RISK_COUNTRIES.includes(geoData.country_code)) {
      allowed = false;
      warnings.push('Access blocked due to suspicious activity pattern');
    }

    return { allowed, riskLevel: risk, warnings, geoData };
  };

  // Reset rate limit for IP (e.g., after successful login)
  const resetRateLimit = (ip: string) => {
    delete ipAttempts[ip];
  };

  return {
    currentLocation,
    isBlocked,
    blockReason,
    riskLevel,
    fetchGeoData,
    checkRateLimit,
    recordFailedAttempt,
    validateLogin,
    resetRateLimit,
    checkLocationAnomaly,
  };
};
