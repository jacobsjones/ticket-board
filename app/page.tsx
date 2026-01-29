'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X, Circle, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type Priority = 'low' | 'medium' | 'high';
export type Column = 'todo' | 'in-progress' | 'hold' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  column: Column;
  completed: boolean;
  createdAt: number;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 dark:border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 dark:border-yellow-500/30',
  high: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30 dark:border-red-500/30',
};

const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Booth', 'Vending', 'Trading'];

const COLUMNS: Record<Column, { title: string; icon: string; emoji: string }> = {
  'todo': { title: 'To Do', icon: 'Circle', emoji: '📋' },
  'in-progress': { title: 'In Progress', icon: 'Check', emoji: '🔨' },
  'hold': { title: 'Hold', icon: 'Circle', emoji: '⏸️' },
  'done': { title: 'Done', icon: 'Check', emoji: '✅' },
};

export default function TaskBoard() {
  const { theme, setTheme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'General',
    column: 'todo' as Column,
  });

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ticket-board-tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('ticket-board-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const openDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
        column: task.column,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'General',
        column: 'todo',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...formData }
            : t
        )
      );
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        completed: false,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setIsDialogOpen(false);
    setFormData({ title: '', description: '', priority: 'medium', category: 'General', column: 'todo' });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const moveTask = (id: string, toColumn: Column) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, column: toColumn, completed: toColumn === 'done' } : t
      )
    );
  };

  const todoTasks = tasks.filter((t) => t.column === 'todo');
  const inProgressTasks = tasks.filter((t) => t.column === 'in-progress');
  const holdTasks = tasks.filter((t) => t.column === 'hold');
  const doneTasks = tasks.filter((t) => t.column === 'done');

  const tasksByColumn = { todo: todoTasks, 'in-progress': inProgressTasks, hold: holdTasks, done: doneTasks };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Board 🪻
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {tasksByColumn.todo.length} to do · {tasksByColumn['in-progress'].length} in progress · {tasksByColumn.done.length} done
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                onClick={() => openDialog()}
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="h-5 w-5" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(COLUMNS) as [Column, { title: string; icon: string; emoji: string }][]).map(([columnId, col]) => (
            <div key={columnId} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl p-4 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{col.emoji}</span>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {col.title}
                </h2>
                <Badge variant="secondary" className="ml-auto">
                  {tasksByColumn[columnId].length}
                </Badge>
              </div>

              {tasksByColumn[columnId].length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg min-h-32">
                  <Plus className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Drop tasks here or add new</p>
                </div>
              ) : (
                <div className="space-y-3 min-h-32">
                  {tasksByColumn[columnId].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => openDialog(task)}
                      onDelete={() => deleteTask(task.id)}
                      onMove={(col) => moveTask(task.id, col)}
                      currentColumn={columnId}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Update your task details.' : 'Add a new task to your board.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="What needs doing?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Any details?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Column</label>
                  <select
                    value={formData.column}
                    onChange={(e) => setFormData({ ...formData, column: e.target.value as Column })}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="hold">Hold</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:ring-offset-slate-950"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.title.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {editingTask ? 'Save' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onMove,
  currentColumn,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (to: Column) => void;
  currentColumn: Column;
}) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {task.title}
            </h3>
            <Badge className={PRIORITY_COLORS[task.priority]} variant="outline">
              {task.priority}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {task.category}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Pencil className="h-4 w-4 text-slate-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Move Buttons - Only show on active columns */}
      {currentColumn !== 'done' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          {currentColumn === 'todo' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMove('in-progress')}
              className="flex-1"
            >
              → Start
            </Button>
          )}
          {currentColumn === 'in-progress' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMove('todo')}
                className="flex-1"
              >
                ← Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMove('hold')}
                className="flex-1"
              >
                ⏸️ Hold
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMove('done')}
                className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 text-green-700"
              >
                ✓ Done
              </Button>
            </>
          )}
          {currentColumn === 'hold' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMove('in-progress')}
                className="flex-1"
              >
                → Resume
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMove('done')}
                className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 text-green-700"
              >
                ✓ Done
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
