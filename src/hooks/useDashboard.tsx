import { useState, useEffect, createContext, useContext, ReactNode } from "react";

interface Widget {
  id: string;
  type: string;
  title: string;
  config: Record<string, any>;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardContextType {
  widgets: Widget[];
  addWidget: (widget: Omit<Widget, "id">) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, x: number, y: number) => void;
  updateWidgetConfig: (id: string, config: Record<string, any>) => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

const DEFAULT_WIDGETS: Widget[] = [
  { id: "stats-1", type: "stats", title: "Overview Stats", config: {}, x: 0, y: 0, w: 4, h: 1 },
  { id: "chart-traffic", type: "area-chart", title: "Traffic Overview", config: { metric: "pageViews" }, x: 0, y: 1, w: 2, h: 2 },
  { id: "chart-revenue", type: "bar-chart", title: "Revenue", config: { metric: "revenue" }, x: 2, y: 1, w: 2, h: 2 },
  { id: "recent-downloads", type: "list", title: "Recent CV Downloads", config: { source: "cv_downloads" }, x: 0, y: 3, w: 2, h: 2 },
  { id: "recent-contacts", type: "list", title: "Recent Contacts", config: { source: "contact_requests" }, x: 2, y: 3, w: 2, h: 2 },
];

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const stored = localStorage.getItem("dashboard-widgets");
    return stored ? JSON.parse(stored) : DEFAULT_WIDGETS;
  });
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    localStorage.setItem("dashboard-widgets", JSON.stringify(widgets));
  }, [widgets]);

  const addWidget = (widget: Omit<Widget, "id">) => {
    const newWidget: Widget = {
      ...widget,
      id: `widget-${Date.now()}`,
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  };

  const updateWidgetPosition = (id: string, x: number, y: number) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  };

  const updateWidgetConfig = (id: string, config: Record<string, any>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, config: { ...w.config, ...config } } : w))
    );
  };

  return (
    <DashboardContext.Provider
      value={{
        widgets,
        addWidget,
        removeWidget,
        updateWidgetPosition,
        updateWidgetConfig,
        isEditMode,
        setIsEditMode,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};
