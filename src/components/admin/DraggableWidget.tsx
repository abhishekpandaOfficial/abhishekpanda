import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { GripVertical, X, Settings, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";

interface DraggableWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  gridArea?: string;
}

export const DraggableWidget = ({
  id,
  title,
  children,
  className,
}: DraggableWidgetProps) => {
  const { isEditMode, removeWidget } = useDashboard();
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const constraintsRef = useRef(null);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        zIndex: isDragging ? 50 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      drag={isEditMode}
      dragConstraints={constraintsRef}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
      className={cn(
        "relative rounded-xl border border-border bg-card overflow-hidden",
        isEditMode && "cursor-move",
        isDragging && "ring-2 ring-primary shadow-2xl",
        isExpanded && "col-span-2 row-span-2",
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b border-border",
        isEditMode && "bg-muted/50"
      )}>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          )}
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {!isEditMode && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
          {isEditMode && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => removeWidget(id)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>

      {/* Edit mode overlay indicator */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />
        </div>
      )}
    </motion.div>
  );
};
