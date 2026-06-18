import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  Star,
  Crown,
  TreeDeciduous,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Edit3,
  Eye,
  GripVertical,
  Link2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Settings2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FamilyMember } from "@/hooks/useFamilyMembers";
import { useFamilyPhotoUrls } from "@/hooks/useFamilyPhotoUrl";
import { toast } from "sonner";

interface FamilyTreeDAGProps {
  familyMembers: FamilyMember[];
  onEdit: (member: FamilyMember) => void;
  onPreview: (member: FamilyMember) => void;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  direction: "outgoing" | "incoming" | "bidirectional";
  color?: string;
  label?: string;
}

const ARROW_COLORS = [
  { name: "Amber", value: "#fbbf24" },
  { name: "Emerald", value: "#34d399" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Pink", value: "#f472b6" },
  { name: "Purple", value: "#a78bfa" },
  { name: "Red", value: "#f87171" },
  { name: "Teal", value: "#2dd4bf" },
  { name: "Orange", value: "#fb923c" },
];

const getDefaultArrowColor = (relationship: string, isDark: boolean) => {
  const baseColors: Record<string, { light: string; dark: string }> = {
    "Grandfather": { light: "#b45309", dark: "#fbbf24" },
    "Grandmother": { light: "#c2410c", dark: "#fb923c" },
    "Father": { light: "#047857", dark: "#34d399" },
    "Mother": { light: "#0f766e", dark: "#2dd4bf" },
    "Wife": { light: "#be185d", dark: "#f472b6" },
    "Daughter": { light: "#be123c", dark: "#fb7185" },
    "Son": { light: "#6d28d9", dark: "#a78bfa" },
  };

  for (const [key, colors] of Object.entries(baseColors)) {
    if (relationship.includes(key)) {
      return isDark ? colors.dark : colors.light;
    }
  }
  return isDark ? "#8b5cf6" : "#6d28d9";
};

const getGenerationColor = (generation: number) => {
  switch (generation) {
    case 1: return "from-amber-500 to-orange-600";
    case 2: return "from-emerald-500 to-teal-600";
    case 3: return "from-blue-500 to-indigo-600";
    case 4: return "from-pink-500 to-rose-600";
    default: return "from-primary to-purple-600";
  }
};

const getRelationshipIcon = (relationship: string) => {
  if (relationship.includes("Grandfather") || relationship.includes("Grandmother")) return Crown;
  if (relationship.includes("Father") || relationship.includes("Mother")) return Heart;
  if (relationship === "Self") return Star;
  if (relationship === "Wife") return Heart;
  if (relationship === "Daughter" || relationship === "Son") return TreeDeciduous;
  return User;
};

const getInitialPositions = (members: FamilyMember[], containerWidth: number, containerHeight: number) => {
  const positions: Record<string, { x: number; y: number }> = {};
  
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  
  const scaleX = Math.min(containerWidth / 1000, 1);
  const scaleY = Math.min(containerHeight / 700, 1);
  const scale = Math.min(scaleX, scaleY);
  
  const hSpacing = 200 * scale;
  const vSpacing = 150 * scale;
  
  members.forEach((member) => {
    if (member.id === "me" || member.relationship === "Self") {
      positions[member.id] = { x: centerX, y: centerY };
    } else if (member.id === "wife" || member.relationship === "Wife") {
      positions[member.id] = { x: centerX + hSpacing, y: centerY };
    } else if (member.id === "f" || member.relationship === "Father") {
      positions[member.id] = { x: centerX - hSpacing * 0.5, y: centerY - vSpacing };
    } else if (member.id === "m" || member.relationship === "Mother") {
      positions[member.id] = { x: centerX + hSpacing * 0.5, y: centerY - vSpacing };
    } else if (member.id === "gf" || member.relationship.includes("Grandfather")) {
      positions[member.id] = { x: centerX - hSpacing, y: centerY - vSpacing * 2 };
    } else if (member.id === "gm" || member.relationship.includes("Grandmother")) {
      positions[member.id] = { x: centerX, y: centerY - vSpacing * 2 };
    } else if (member.id === "d" || member.relationship === "Daughter") {
      positions[member.id] = { x: centerX - hSpacing * 0.3, y: centerY + vSpacing };
    } else if (member.id === "s" || member.relationship === "Son") {
      positions[member.id] = { x: centerX + hSpacing * 0.7, y: centerY + vSpacing };
    }
  });
  
  return positions;
};

// Interactive Curved Arrow with click handling
const InteractiveCurvedArrow = ({ 
  id,
  startX, startY, endX, endY, color, delay = 0, isDark,
  direction,
  isSelected,
  onClick,
  onDelete,
}: { 
  id: string;
  startX: number; startY: number; endX: number; endY: number; 
  color: string; delay?: number; isDark: boolean;
  direction: "outgoing" | "incoming" | "bidirectional";
  isSelected?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}) => {
  const nodeRadius = 45;
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length < nodeRadius * 2) return null;
  
  const adjustedStartX = startX + (dx / length) * nodeRadius;
  const adjustedStartY = startY + (dy / length) * nodeRadius;
  const adjustedEndX = endX - (dx / length) * nodeRadius;
  const adjustedEndY = endY - (dy / length) * nodeRadius;
  
  const midX = (adjustedStartX + adjustedEndX) / 2;
  const midY = (adjustedStartY + adjustedEndY) / 2;
  const perpX = -(dy / length) * 30;
  const perpY = (dx / length) * 30;
  const controlX = midX + perpX;
  const controlY = midY + perpY;
  
  const pathId = `path-${id}`;
  const gradientId = `gradient-${id}`;
  const filterId = `glow-${id}`;
  
  const angle = Math.atan2(adjustedEndY - controlY, adjustedEndX - controlX);
  const angleStart = Math.atan2(adjustedStartY - controlY, adjustedStartX - controlX);
  const arrowSize = 8;
  
  const renderArrowhead = (x: number, y: number, ang: number, isStart = false) => (
    <polygon
      points={`
        ${x},${y}
        ${x - arrowSize * Math.cos(ang - Math.PI / 6)},${y - arrowSize * Math.sin(ang - Math.PI / 6)}
        ${x - arrowSize * Math.cos(ang + Math.PI / 6)},${y - arrowSize * Math.sin(ang + Math.PI / 6)}
      `}
      fill={color}
      className="transition-all duration-200"
    />
  );
  
  return (
    <g 
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'opacity-100' : 'hover:opacity-90'}`}
      onClick={onClick}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={isSelected ? "4" : "2"} result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Clickable hit area */}
      <path
        d={`M ${adjustedStartX} ${adjustedStartY} Q ${controlX} ${controlY} ${adjustedEndX} ${adjustedEndY}`}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        className="cursor-pointer"
      />
      
      {/* Glow effect */}
      <path
        d={`M ${adjustedStartX} ${adjustedStartY} Q ${controlX} ${controlY} ${adjustedEndX} ${adjustedEndY}`}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? "6" : "4"}
        strokeOpacity={isSelected ? "0.3" : "0.15"}
        filter={`url(#${filterId})`}
      />
      
      {/* Main path */}
      <path
        id={pathId}
        d={`M ${adjustedStartX} ${adjustedStartY} Q ${controlX} ${controlY} ${adjustedEndX} ${adjustedEndY}`}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={isSelected ? "3" : "2"}
        strokeLinecap="round"
        className="transition-all duration-200"
      />
      
      {/* Animated particle */}
      <circle r={isSelected ? "5" : "4"} fill={color} filter={`url(#${filterId})`}>
        <animateMotion dur="3s" repeatCount="indefinite" begin={`${delay}s`}>
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      
      {/* Arrow heads based on direction */}
      {(direction === "outgoing" || direction === "bidirectional") && (
        renderArrowhead(adjustedEndX, adjustedEndY, angle)
      )}
      {(direction === "incoming" || direction === "bidirectional") && (
        renderArrowhead(adjustedStartX, adjustedStartY, angleStart + Math.PI)
      )}
      
      {/* Delete button on selected arrow */}
      {isSelected && onDelete && (
        <g 
          className="cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <circle 
            cx={controlX} 
            cy={controlY} 
            r="12" 
            fill="hsl(var(--destructive))" 
            className="hover:opacity-80 transition-opacity"
          />
          <text 
            x={controlX} 
            y={controlY + 4} 
            textAnchor="middle" 
            fill="white" 
            fontSize="14"
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
};

// Photo component with signed URL
const FamilyPhoto = ({ 
  photoPath, 
  name, 
  signedUrl,
}: { 
  photoPath: string | null; 
  name: string;
  signedUrl?: string;
}) => {
  if (!photoPath || !signedUrl) {
    return <User className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />;
  }

  return (
    <img 
      src={signedUrl} 
      alt={name} 
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export const FamilyTreeDAG = ({ familyMembers, onEdit, onPreview }: FamilyTreeDAGProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  // Draggable positions state
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Connection mode state
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [newConnectionColor, setNewConnectionColor] = useState(ARROW_COLORS[0].value);
  const [newConnectionDirection, setNewConnectionDirection] = useState<"outgoing" | "incoming" | "bidirectional">("outgoing");
  
  // Get all photo paths for batch fetching
  const photoPaths = useMemo(() => 
    familyMembers.map(m => m.photo).filter(Boolean) as string[],
    [familyMembers]
  );
  
  const { signedUrls, loading: photosLoading } = useFamilyPhotoUrls(photoPaths);
  
  // Initialize default connections based on family relationships
  useEffect(() => {
    if (familyMembers.length > 0 && connections.length === 0) {
      const abhishek = familyMembers.find(m => m.id === "me" || m.relationship === "Self");
      if (abhishek) {
        const defaultConnections: Connection[] = familyMembers
          .filter(m => m.id !== abhishek.id)
          .map((member, index) => ({
            id: `default-${abhishek.id}-${member.id}`,
            fromId: abhishek.id,
            toId: member.id,
            direction: "outgoing" as const,
            color: getDefaultArrowColor(member.relationship, isDarkTheme),
          }));
        setConnections(defaultConnections);
      }
    }
  }, [familyMembers, isDarkTheme]);
  
  // Initialize positions when members or container size changes
  useEffect(() => {
    if (familyMembers.length > 0) {
      const initialPositions = getInitialPositions(familyMembers, containerSize.width, containerSize.height);
      setNodePositions(prev => {
        const newPositions = { ...initialPositions };
        Object.keys(prev).forEach(key => {
          if (prev[key]) newPositions[key] = prev[key];
        });
        return newPositions;
      });
    }
  }, [familyMembers, containerSize]);
  
  // Observe container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  
  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
        (!document.documentElement.classList.contains('light') && 
         window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkTheme(isDark);
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, memberId: string) => {
    if (isConnectMode) return;
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const pos = nodePositions[memberId];
    if (pos) {
      setDraggingNode(memberId);
      setDragOffset({ x: clientX - pos.x, y: clientY - pos.y });
    }
  }, [nodePositions, isConnectMode]);
  
  const handleDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingNode) return;
    e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newX = Math.max(60, Math.min(containerSize.width - 60, (clientX - rect.left - dragOffset.x + containerSize.width / 2)));
    const newY = Math.max(60, Math.min(containerSize.height - 60, (clientY - rect.top - dragOffset.y + containerSize.height / 2)));
    
    setNodePositions(prev => ({
      ...prev,
      [draggingNode]: { x: newX, y: newY }
    }));
  }, [draggingNode, dragOffset, containerSize]);
  
  const handleDragEnd = useCallback(() => {
    setDraggingNode(null);
  }, []);
  
  // Connection handlers
  const handleNodeClick = useCallback((memberId: string) => {
    if (!isConnectMode) return;
    
    if (!connectingFrom) {
      setConnectingFrom(memberId);
      toast.info("Now click another family member to create connection");
    } else if (connectingFrom !== memberId) {
      // Create new connection
      const newConnection: Connection = {
        id: `custom-${connectingFrom}-${memberId}-${Date.now()}`,
        fromId: connectingFrom,
        toId: memberId,
        direction: newConnectionDirection,
        color: newConnectionColor,
      };
      
      setConnections(prev => [...prev, newConnection]);
      setConnectingFrom(null);
      toast.success("Connection created!");
    } else {
      setConnectingFrom(null);
    }
  }, [isConnectMode, connectingFrom, newConnectionColor, newConnectionDirection]);
  
  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnection(prev => prev === connectionId ? null : connectionId);
  }, []);
  
  const handleDeleteConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
    setSelectedConnection(null);
    toast.success("Connection removed");
  }, []);
  
  const toggleConnectionDirection = useCallback((connectionId: string) => {
    setConnections(prev => prev.map(c => {
      if (c.id !== connectionId) return c;
      const directions: Array<"outgoing" | "incoming" | "bidirectional"> = ["outgoing", "incoming", "bidirectional"];
      const currentIndex = directions.indexOf(c.direction);
      return { ...c, direction: directions[(currentIndex + 1) % 3] };
    }));
  }, []);
  
  const updateConnectionColor = useCallback((connectionId: string, color: string) => {
    setConnections(prev => prev.map(c => 
      c.id === connectionId ? { ...c, color } : c
    ));
  }, []);
  
  const resetPositions = () => {
    const initialPositions = getInitialPositions(familyMembers, containerSize.width, containerSize.height);
    setNodePositions(initialPositions);
    setZoom(1);
  };
  
  const resetConnections = () => {
    const abhishek = familyMembers.find(m => m.id === "me" || m.relationship === "Self");
    if (abhishek) {
      const defaultConnections: Connection[] = familyMembers
        .filter(m => m.id !== abhishek.id)
        .map((member) => ({
          id: `default-${abhishek.id}-${member.id}`,
          fromId: abhishek.id,
          toId: member.id,
          direction: "outgoing" as const,
          color: getDefaultArrowColor(member.relationship, isDarkTheme),
        }));
      setConnections(defaultConnections);
    }
    toast.success("Connections reset to default");
  };

  return (
    <div className="relative w-full h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-background via-muted/10 to-background shadow-xl">
      {/* Top Controls */}
      <div className="absolute top-3 right-3 z-20 flex gap-1.5 sm:gap-2">
        <Button variant="outline" size="icon" onClick={() => setZoom(prev => Math.min(prev + 0.15, 2))}
          className="h-8 w-8 sm:h-9 sm:w-9 bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg">
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.5))}
          className="h-8 w-8 sm:h-9 sm:w-9 bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg">
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={resetPositions}
          className="h-8 w-8 sm:h-9 sm:w-9 bg-card/90 backdrop-blur-sm border-border/50 hover:bg-card shadow-lg">
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>
      
      {/* Connection Mode Controls */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <div className="flex gap-1.5">
          <Button 
            variant={isConnectMode ? "default" : "outline"} 
            size="sm"
            onClick={() => {
              setIsConnectMode(!isConnectMode);
              setConnectingFrom(null);
              setSelectedConnection(null);
            }}
            className={`h-8 px-2.5 text-xs ${isConnectMode ? 'bg-primary text-primary-foreground' : 'bg-card/90 backdrop-blur-sm border-border/50'}`}
          >
            <Link2 className="w-3.5 h-3.5 mr-1.5" />
            {isConnectMode ? "Exit Edit" : "Edit Arrows"}
          </Button>
          
          {isConnectMode && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 bg-card/90 backdrop-blur-sm border-border/50"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium mb-2">New Arrow Direction</p>
                    <div className="flex gap-1">
                      {[
                        { value: "outgoing", icon: ArrowRight, label: "Out" },
                        { value: "incoming", icon: ArrowLeft, label: "In" },
                        { value: "bidirectional", icon: Link2, label: "Both" },
                      ].map(({ value, icon: Icon, label }) => (
                        <Button
                          key={value}
                          variant={newConnectionDirection === value ? "default" : "outline"}
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => setNewConnectionDirection(value as typeof newConnectionDirection)}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium mb-2">New Arrow Color</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ARROW_COLORS.map(color => (
                        <button
                          key={color.value}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            newConnectionColor === color.value ? 'border-foreground scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setNewConnectionColor(color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-7 text-xs"
                    onClick={resetConnections}
                  >
                    Reset All Arrows
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {/* Connection status */}
        {isConnectMode && connectingFrom && (
          <Badge variant="secondary" className="text-[10px] animate-pulse">
            Connecting from: {familyMembers.find(m => m.id === connectingFrom)?.name.split(' ')[0]}
          </Badge>
        )}
        
        {/* Selected connection controls */}
        <AnimatePresence>
          {selectedConnection && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-2 rounded-lg bg-card/95 backdrop-blur-sm border border-border/50 shadow-lg"
            >
              <p className="text-[10px] text-muted-foreground mb-2">Edit Selected Arrow</p>
              <div className="flex gap-1 mb-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleConnectionDirection(selectedConnection)}
                  title="Toggle Direction"
                >
                  <ArrowRight className="w-3 h-3" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleDeleteConnection(selectedConnection)}
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {ARROW_COLORS.map(color => (
                  <button
                    key={color.value}
                    className="w-4 h-4 rounded-full border border-border/50 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                    onClick={() => updateConnectionColor(selectedConnection, color.value)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-card/90 backdrop-blur-sm border border-border/50 text-xs text-muted-foreground shadow-lg">
        {Math.round(zoom * 100)}%
      </div>
      
      {/* Legend - hidden on small screens */}
      <div className="hidden sm:block absolute bottom-3 left-3 z-20 p-3 rounded-xl bg-card/90 backdrop-blur-sm border border-border/50 shadow-lg">
        <p className="text-[10px] sm:text-xs font-semibold text-foreground mb-2">
          {isConnectMode ? "Click nodes to connect" : "Relationships"}
        </p>
        {!isConnectMode ? (
          <div className="space-y-1.5">
            {[
              { rel: "Grandparents", color: getDefaultArrowColor("Grandfather", isDarkTheme) },
              { rel: "Parents", color: getDefaultArrowColor("Father", isDarkTheme) },
              { rel: "Spouse", color: getDefaultArrowColor("Wife", isDarkTheme) },
              { rel: "Children", color: getDefaultArrowColor("Son", isDarkTheme) },
            ].map(item => (
              <div key={item.rel} className="flex items-center gap-2">
                <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-muted-foreground">{item.rel}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <GripVertical className="w-3 h-3" />
              <span>Drag to move cards</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Link2 className="w-3 h-3" />
              <span>Click arrow to select</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden"
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
        onClick={() => {
          if (!isConnectMode) setSelectedConnection(null);
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* SVG Arrows */}
          <svg
            className="absolute inset-0"
            width="100%"
            height="100%"
            style={{ overflow: 'visible', pointerEvents: isConnectMode ? 'auto' : 'none' }}
          >
            {connections.map((connection, index) => {
              const fromPos = nodePositions[connection.fromId];
              const toPos = nodePositions[connection.toId];
              if (!fromPos || !toPos) return null;
              
              return (
                <InteractiveCurvedArrow
                  key={connection.id}
                  id={connection.id}
                  startX={fromPos.x}
                  startY={fromPos.y}
                  endX={toPos.x}
                  endY={toPos.y}
                  color={connection.color || getDefaultArrowColor("", isDarkTheme)}
                  delay={index * 0.3}
                  isDark={isDarkTheme}
                  direction={connection.direction}
                  isSelected={selectedConnection === connection.id}
                  onClick={() => isConnectMode && handleConnectionClick(connection.id)}
                  onDelete={() => handleDeleteConnection(connection.id)}
                />
              );
            })}
          </svg>
          
          {/* Family Member Cards */}
          {familyMembers.map((member) => {
            const pos = nodePositions[member.id];
            if (!pos) return null;
            
            const RelIcon = getRelationshipIcon(member.relationship);
            const isAbhishek = member.id === "me" || member.relationship === "Self";
            const isDragging = draggingNode === member.id;
            const isConnecting = connectingFrom === member.id;
            const photoUrl = member.photo ? signedUrls[member.photo] : undefined;
            
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: pos.x - 55,
                  y: pos.y - 65,
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: isDragging ? 500 : 200,
                  damping: isDragging ? 30 : 20,
                }}
                className={`absolute ${isConnectMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'} ${
                  isDragging ? 'z-50' : isAbhishek ? 'z-30' : 'z-20'
                }`}
                onMouseDown={(e) => !isConnectMode && handleDragStart(e, member.id)}
                onTouchStart={(e) => !isConnectMode && handleDragStart(e, member.id)}
                onClick={() => isConnectMode && handleNodeClick(member.id)}
                style={{ touchAction: 'none' }}
              >
                <Card 
                  className={`w-[110px] sm:w-[120px] bg-card/95 backdrop-blur-md shadow-xl transition-all duration-200 group select-none ${
                    isConnecting ? 'ring-2 ring-primary ring-offset-2 scale-105' :
                    isDragging ? 'scale-105 shadow-2xl ring-2 ring-primary' :
                    isAbhishek 
                      ? 'border-2 border-primary shadow-primary/20 ring-4 ring-primary/10' 
                      : 'border border-border/50 hover:border-primary/50 hover:shadow-primary/10'
                  }`}
                >
                  <div className={`h-1 bg-gradient-to-r ${getGenerationColor(member.generation)}`} />
                  
                  <CardContent className="p-2 sm:p-2.5 text-center">
                    <div className="relative mx-auto mb-1.5">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${getGenerationColor(member.generation)} p-0.5 mx-auto shadow-lg ${
                        isAbhishek ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''
                      }`}>
                        <div className="w-full h-full rounded-full bg-card flex items-center justify-center overflow-hidden">
                          <FamilyPhoto 
                            photoPath={member.photo} 
                            name={member.name}
                            signedUrl={photoUrl}
                          />
                        </div>
                      </div>
                      <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r ${getGenerationColor(member.generation)} flex items-center justify-center shadow-lg border-2 border-card`}>
                        <RelIcon className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>

                    <h3 className="font-bold text-foreground text-[10px] sm:text-xs truncate mt-1.5">
                      {member.name.split(' ').slice(0, 2).join(' ')}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                      {member.relationship.split('(')[0].trim()}
                    </p>

                    {!isConnectMode && (
                      <div className="flex justify-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 sm:h-6 sm:w-6 bg-muted/50 hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); onPreview(member); }}
                        >
                          <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 sm:h-6 sm:w-6 bg-muted/50 hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                        >
                          <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </Button>
                      </div>
                    )}
                    
                    {isConnectMode && (
                      <div className="flex justify-center mt-1.5">
                        <Badge variant={isConnecting ? "default" : "outline"} className="text-[8px] h-4">
                          {isConnecting ? "Selected" : "Click"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FamilyTreeDAG;
