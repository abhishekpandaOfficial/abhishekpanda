import { useState } from 'react';
import { Monitor, Smartphone, Tablet, Laptop, X, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ActiveSession {
  id: string;
  sessionToken: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: Date;
  isCurrentSession: boolean;
}

interface ActiveSessionIndicatorProps {
  activeSessions: ActiveSession[];
  onKillSession: (sessionId: string) => Promise<void>;
  onKillAllOtherSessions: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case 'mobile':
      return <Smartphone className="w-4 h-4" />;
    case 'tablet':
      return <Tablet className="w-4 h-4" />;
    case 'desktop':
      return <Laptop className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
};

export const ActiveSessionIndicator = ({
  activeSessions,
  onKillSession,
  onKillAllOtherSessions,
  onRefresh,
}: ActiveSessionIndicatorProps) => {
  const [open, setOpen] = useState(false);
  const [killing, setKilling] = useState<string | null>(null);

  const sessionCount = activeSessions.length;
  const otherSessionCount = activeSessions.filter(s => !s.isCurrentSession).length;
  const hasOtherSessions = otherSessionCount > 0;

  const handleKillSession = async (sessionId: string) => {
    setKilling(sessionId);
    await onKillSession(sessionId);
    setKilling(null);
  };

  const handleKillAll = async () => {
    setKilling('all');
    await onKillAllOtherSessions();
    setKilling(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative gap-2 px-3",
            hasOtherSessions 
              ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{sessionCount}</span>
          {hasOtherSessions && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-card/95 backdrop-blur-xl border-border/50"
        align="end"
      >
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-foreground">Active Sessions</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sessionCount} active session{sessionCount !== 1 ? 's' : ''}
              </p>
            </div>
            {hasOtherSessions && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleKillAll}
                disabled={killing === 'all'}
                className="text-xs h-7"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Kill All Others
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {activeSessions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No active sessions
            </div>
          ) : (
            activeSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "p-3 border-b border-border/20 last:border-b-0",
                  session.isCurrentSession && "bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className={cn(
                      "p-1.5 rounded-lg mt-0.5",
                      session.isCurrentSession 
                        ? "bg-primary/20 text-primary" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground truncate">
                          {session.deviceName}
                        </span>
                        {session.isCurrentSession && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 bg-primary/10 text-primary border-primary/30">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.browser} • {formatDistanceToNow(session.lastActive, { addSuffix: true })}
                      </p>
                      {session.location !== 'Unknown' && (
                        <p className="text-xs text-muted-foreground/70">
                          {session.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {!session.isCurrentSession && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleKillSession(session.id)}
                      disabled={killing === session.id}
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-2 border-t border-border/30 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Refresh Sessions
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
