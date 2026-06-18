import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  List,
  Activity,
  Users,
  DollarSign,
  FileText,
  Download,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";

const WIDGET_CATEGORIES = [
  {
    id: "analytics",
    name: "Analytics & Metrics",
    icon: Activity,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "content",
    name: "Content Management",
    icon: FileText,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    id: "revenue",
    name: "Revenue & Payments",
    icon: DollarSign,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    id: "activity",
    name: "User Activity",
    icon: Users,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
];

const WIDGET_TEMPLATES = [
  // Analytics
  {
    category: "analytics",
    type: "area-chart",
    title: "Page Views",
    icon: LineChart,
    description: "Track daily page views over time",
    config: { metric: "pageViews" },
    w: 2,
    h: 2,
  },
  {
    category: "analytics",
    type: "bar-chart",
    title: "Top Pages",
    icon: BarChart3,
    description: "Most visited pages on your site",
    config: { metric: "topPages" },
    w: 2,
    h: 2,
  },
  {
    category: "analytics",
    type: "pie-chart",
    title: "Traffic Sources",
    icon: PieChart,
    description: "Where your visitors come from",
    config: { metric: "trafficSources" },
    w: 1,
    h: 2,
  },
  {
    category: "analytics",
    type: "stat-card",
    title: "Unique Visitors",
    icon: Users,
    description: "Total unique visitors count",
    config: { metric: "uniqueVisitors" },
    w: 1,
    h: 1,
  },
  // Content
  {
    category: "content",
    type: "list",
    title: "Recent Blog Posts",
    icon: FileText,
    description: "Latest published blog posts",
    config: { source: "blog_posts" },
    w: 2,
    h: 2,
  },
  {
    category: "content",
    type: "list",
    title: "Popular Courses",
    icon: TrendingUp,
    description: "Top performing courses",
    config: { source: "courses" },
    w: 2,
    h: 2,
  },
  {
    category: "content",
    type: "table",
    title: "Content Performance",
    icon: Table,
    description: "Overview of all content metrics",
    config: { source: "content_metrics" },
    w: 4,
    h: 2,
  },
  // Revenue
  {
    category: "revenue",
    type: "bar-chart",
    title: "Revenue Overview",
    icon: BarChart3,
    description: "Monthly revenue breakdown",
    config: { metric: "revenue" },
    w: 2,
    h: 2,
  },
  {
    category: "revenue",
    type: "stat-card",
    title: "Total Revenue",
    icon: DollarSign,
    description: "Total revenue this month",
    config: { metric: "totalRevenue" },
    w: 1,
    h: 1,
  },
  {
    category: "revenue",
    type: "list",
    title: "Recent Payments",
    icon: List,
    description: "Latest payment transactions",
    config: { source: "payments" },
    w: 2,
    h: 2,
  },
  {
    category: "revenue",
    type: "pie-chart",
    title: "Revenue by Product",
    icon: PieChart,
    description: "Revenue distribution by product type",
    config: { metric: "revenueByProduct" },
    w: 1,
    h: 2,
  },
  // User Activity
  {
    category: "activity",
    type: "list",
    title: "CV Downloads",
    icon: Download,
    description: "Recent CV download requests",
    config: { source: "cv_downloads" },
    w: 2,
    h: 2,
  },
  {
    category: "activity",
    type: "list",
    title: "Contact Requests",
    icon: MessageSquare,
    description: "Recent contact form submissions",
    config: { source: "contact_requests" },
    w: 2,
    h: 2,
  },
  {
    category: "activity",
    type: "bar-chart",
    title: "Activity Timeline",
    icon: Activity,
    description: "User activity over time",
    config: { metric: "userActivity" },
    w: 2,
    h: 2,
  },
  {
    category: "activity",
    type: "stat-card",
    title: "Active Users Today",
    icon: Users,
    description: "Users active in last 24 hours",
    config: { metric: "activeUsers" },
    w: 1,
    h: 1,
  },
];

export const AddWidgetModal = () => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addWidget } = useDashboard();

  const handleAddWidget = (template: typeof WIDGET_TEMPLATES[0]) => {
    addWidget({
      type: template.type,
      title: template.title,
      config: template.config,
      x: 0,
      y: 100, // Add to bottom
      w: template.w,
      h: template.h,
    });
    setOpen(false);
    setSelectedCategory(null);
  };

  const filteredTemplates = selectedCategory
    ? WIDGET_TEMPLATES.filter((t) => t.category === selectedCategory)
    : WIDGET_TEMPLATES;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
      >
        <Plus className="w-4 h-4" />
        Add Widget
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl">Add Widget to Dashboard</DialogTitle>
            <DialogDescription>
              Choose from our widget templates to customize your dashboard
            </DialogDescription>
          </DialogHeader>

          <div className="flex h-[500px]">
            {/* Categories Sidebar */}
            <div className="w-56 border-r border-border p-4 space-y-2">
              <Button
                variant={selectedCategory === null ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(null)}
              >
                All Widgets
              </Button>
              {WIDGET_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <cat.icon className={cn("w-4 h-4", cat.color)} />
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Widget Templates Grid */}
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map((template, i) => {
                    const category = WIDGET_CATEGORIES.find(
                      (c) => c.id === template.category
                    );
                    return (
                      <motion.div
                        key={`${template.type}-${template.title}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => handleAddWidget(template)}
                        className="group relative p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              category?.bgColor
                            )}
                          >
                            <template.icon
                              className={cn("w-5 h-5", category?.color)}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {template.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {template.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 rounded bg-muted">
                            {template.w}x{template.h}
                          </span>
                          <span className="capitalize">{template.type.replace("-", " ")}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
