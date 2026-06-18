import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, Monitor, Tablet, Fingerprint, ScanFace, 
  Trash2, Plus, Shield, Clock, MapPin, CheckCircle2,
  AlertTriangle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebAuthn } from '@/hooks/useWebAuthn';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
}

export const DeviceManagementPanel = () => {
  const { credentials, removeCredential, registerCredential, isLoading } = useWebAuthn();
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'MacBook Pro',
      browser: 'Chrome 120',
      location: 'Mumbai, India',
      lastActive: new Date(),
      isCurrent: true,
    },
    {
      id: '2',
      device: 'iPhone 15 Pro',
      browser: 'Safari',
      location: 'Mumbai, India',
      lastActive: new Date(Date.now() - 3600000),
      isCurrent: false,
    },
  ]);

  const securityScore = Math.min(100, 40 + (credentials.length * 20) + (sessions.length <= 2 ? 20 : 0));

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.includes('iPhone') || deviceName.includes('Android')) {
      return Smartphone;
    } else if (deviceName.includes('iPad') || deviceName.includes('Tablet')) {
      return Tablet;
    }
    return Monitor;
  };

  const getBiometricIcon = (type: string) => {
    if (type === 'faceid') return ScanFace;
    return Fingerprint;
  };

  const handleRemoveDevice = async (id: string) => {
    await removeCredential(id);
    toast.success('Device removed successfully');
  };

  const handleAddDevice = async () => {
    const success = await registerCredential();
    if (success) {
      toast.success('New device registered');
    } else {
      toast.error('Failed to register device');
    }
  };

  const handleTerminateSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success('Session terminated');
  };

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <Card className="bg-card/50 border-emerald-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-gray-700"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(securityScore / 100) * 226} 226`}
                  initial={{ strokeDasharray: '0 226' }}
                  animate={{ strokeDasharray: `${(securityScore / 100) * 226} 226` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{securityScore}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                {securityScore >= 80 ? 'Excellent protection' : 
                 securityScore >= 60 ? 'Good protection' : 'Needs improvement'}
              </p>
              <div className="flex flex-wrap gap-2">
                {credentials.length > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Biometric Enabled
                  </span>
                )}
                <span className="px-2 py-1 text-xs rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  2FA Active
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Devices */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
                Enrolled Devices
              </CardTitle>
              <CardDescription>Biometric credentials registered for authentication</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={handleAddDevice}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Device
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {credentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No biometric devices enrolled</p>
              <p className="text-sm mt-1">Add a device to enable passwordless login</p>
            </div>
          ) : (
            credentials.map((credential) => {
              const DeviceIcon = getDeviceIcon(credential.deviceName);
              const BiometricIcon = getBiometricIcon(credential.biometricType);
              
              return (
                <motion.div
                  key={credential.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <DeviceIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{credential.deviceName}</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                          <BiometricIcon className="w-3 h-3" />
                          {credential.biometricType === 'faceid' ? 'FaceID' :
                           credential.biometricType === 'touchid' ? 'TouchID' :
                           credential.biometricType === 'windows-hello' ? 'Windows Hello' : 'Fingerprint'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last used: {format(new Date(credential.lastUsed), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDevice(credential.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5 text-cyan-400" />
                Active Sessions
              </CardTitle>
              <CardDescription>Currently logged in devices and sessions</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                session.isCurrent 
                  ? 'bg-emerald-500/5 border-emerald-500/30' 
                  : 'bg-card border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  session.isCurrent ? 'bg-emerald-500/20' : 'bg-muted'
                }`}>
                  {session.device.includes('iPhone') ? (
                    <Smartphone className={`w-6 h-6 ${session.isCurrent ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                  ) : (
                    <Monitor className={`w-6 h-6 ${session.isCurrent ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{session.device}</span>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{session.browser}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {session.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(session.lastActive, 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Terminate
                </Button>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceManagementPanel;
