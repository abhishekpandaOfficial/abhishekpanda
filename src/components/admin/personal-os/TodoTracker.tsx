import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Check, X, Calendar, Tag, Trash2, Edit2, 
  CheckCircle2, Clock, SkipForward, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, parseISO } from "date-fns";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'completed' | 'skipped';
  category: string;
  due_date: string;
  completed_at: string | null;
  created_at: string;
}

interface TodoTrackerProps {
  onUpdate?: () => void;
}

const categoryColors: Record<string, string> = {
  personal: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  study: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  finance: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  health: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  work: "bg-rose-500/10 text-rose-500 border-rose-500/20"
};

const TodoTracker = ({ onUpdate }: TodoTrackerProps) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "personal",
    due_date: format(new Date(), 'yyyy-MM-dd')
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchTodos();
  }, [viewMode]);

  const getDateRange = () => {
    const now = new Date();
    switch (viewMode) {
      case "week":
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: now, end: now };
    }
  };

  const fetchTodos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { start, end } = getDateRange();
      
      let query = supabase
        .from('personal_todos')
        .select('*')
        .eq('user_id', user.id)
        .gte('due_date', format(start, 'yyyy-MM-dd'))
        .lte('due_date', format(end, 'yyyy-MM-dd'))
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setTodos(data as Todo[] || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({ title: "Error", description: "Failed to load todos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: 'create' | 'update' | 'delete', recordId: string, oldValues?: any, newValues?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('activity_log').insert({
      user_id: user.id,
      module: 'todos',
      action,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues
    });
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingTodo) {
        const { error } = await supabase
          .from('personal_todos')
          .update({
            title: formData.title,
            description: formData.description || null,
            category: formData.category,
            due_date: formData.due_date
          })
          .eq('id', editingTodo.id);

        if (error) throw error;
        await logActivity('update', editingTodo.id, editingTodo, formData);
        toast({ title: "Updated", description: "Todo updated successfully" });
      } else {
        const { data, error } = await supabase
          .from('personal_todos')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            category: formData.category,
            due_date: formData.due_date
          })
          .select()
          .single();

        if (error) throw error;
        await logActivity('create', data.id, null, formData);
        toast({ title: "Created", description: "New todo added" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTodos();
      onUpdate?.();
    } catch (error) {
      console.error('Error saving todo:', error);
      toast({ title: "Error", description: "Failed to save todo", variant: "destructive" });
    }
  };

  const handleStatusChange = async (todo: Todo, newStatus: 'pending' | 'completed' | 'skipped') => {
    try {
      const updates: any = { 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('personal_todos')
        .update(updates)
        .eq('id', todo.id);

      if (error) throw error;
      await logActivity('update', todo.id, { status: todo.status }, { status: newStatus });
      
      fetchTodos();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (todo: Todo) => {
    try {
      const { error } = await supabase
        .from('personal_todos')
        .delete()
        .eq('id', todo.id);

      if (error) throw error;
      await logActivity('delete', todo.id, todo, null);
      
      toast({ title: "Deleted", description: "Todo removed" });
      fetchTodos();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "personal",
      due_date: format(new Date(), 'yyyy-MM-dd')
    });
    setEditingTodo(null);
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      category: todo.category,
      due_date: todo.due_date
    });
    setIsDialogOpen(true);
  };

  const filteredTodos = filterCategory === "all" 
    ? todos 
    : todos.filter(t => t.category === filterCategory);

  const stats = {
    total: filteredTodos.length,
    completed: filteredTodos.filter(t => t.status === 'completed').length,
    pending: filteredTodos.filter(t => t.status === 'pending').length,
    skipped: filteredTodos.filter(t => t.status === 'skipped').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">Completion Rate</p>
              <Progress value={completionRate} className="mt-2 h-1" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-emerald-500">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-slate-500">{stats.skipped}</p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="study">Study</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="work">Work</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Add Todo
        </Button>
      </div>

      {/* Todo List */}
      <Card>
        <CardContent className="pt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No todos for this period</p>
              <Button variant="outline" className="mt-4" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                Add your first todo
              </Button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-2">
                {filteredTodos.map((todo, index) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      todo.status === 'completed' 
                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                        : todo.status === 'skipped'
                        ? 'bg-muted/50 border-muted'
                        : 'bg-card hover:bg-accent/50'
                    }`}
                  >
                    {/* Status Actions */}
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant={todo.status === 'completed' ? 'default' : 'ghost'}
                        className="h-8 w-8"
                        onClick={() => handleStatusChange(todo, todo.status === 'completed' ? 'pending' : 'completed')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant={todo.status === 'skipped' ? 'secondary' : 'ghost'}
                        className="h-8 w-8"
                        onClick={() => handleStatusChange(todo, todo.status === 'skipped' ? 'pending' : 'skipped')}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${todo.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className="text-xs text-muted-foreground truncate">{todo.description}</p>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={categoryColors[todo.category]}>
                        {todo.category}
                      </Badge>
                      {!isToday(parseISO(todo.due_date)) && (
                        <Badge variant="secondary" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(parseISO(todo.due_date), 'dd MMM')}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEditDialog(todo)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(todo)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTodo ? "Edit Todo" : "Add New Todo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What needs to be done?"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="study">Study</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.title.trim()}>
              {editingTodo ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoTracker;
