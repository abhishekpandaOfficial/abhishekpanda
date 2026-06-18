import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  X,
  CheckCheck,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRealtimeSecurityAlerts } from "@/hooks/useRealtimeSecurityAlerts";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export const SecurityAlertPanel = () => {
  const {
    alerts,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearAlerts,
  } = useRealtimeSecurityAlerts();
  const [open, setOpen] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      default: return "bg-blue-500 text-white";
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case "critical": return "border-l-4 border-l-red-500";
      case "high": return "border-l-4 border-l-orange-500";
      case "medium": return "border-l-4 border-l-yellow-500";
      default: return "border-l-4 border-l-blue-500";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          {unreadCount > 0 ? (
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <BellRing className="w-5 h-5 text-orange-500" />
            </motion.div>
          ) : (
            <Bell className="w-5 h-5" />
          )}
          
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="p-3 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Security Alerts</span>
              {isConnected ? (
                <Badge variant="outline" className="text-xs gap-1 text-emerald-500 border-emerald-500">
                  <Wifi className="w-3 h-3" />
                  Live
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs gap-1 text-muted-foreground">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 text-xs">
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark all read
                </Button>
              )}
              {alerts.length > 0 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearAlerts}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <ScrollArea className="h-[400px]">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Shield className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No security alerts</p>
              <p className="text-xs">Real-time monitoring active</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              <AnimatePresence mode="popLayout">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={cn(
                      "p-3 rounded-lg bg-card border border-border cursor-pointer transition-colors",
                      getSeverityBorder(alert.severity),
                      !alert.read && "bg-muted/50"
                    )}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <AlertTriangle className={cn(
                          "w-4 h-4 mt-0.5 flex-shrink-0",
                          alert.severity === "critical" && "text-red-500",
                          alert.severity === "high" && "text-orange-500",
                          alert.severity === "medium" && "text-yellow-500",
                          alert.severity === "low" && "text-blue-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground truncate">
                              {alert.title}
                            </span>
                            <Badge className={cn("text-[10px] h-4", getSeverityColor(alert.severity))}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.data.ip_address || "Unknown IP"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!alert.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
