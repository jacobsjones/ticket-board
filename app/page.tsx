'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  completed: boolean;
  createdAt: number;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
};

const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Booth', 'Vending'];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'General',
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

  const openDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        category: task.category,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'General',
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
    setFormData({ title: '', description: '', priority: 'medium', category: 'General' });
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ticket Board 🪻
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {activeTasks.length} {activeTasks.length === 1 ? 'task' : 'tasks'} to go
          </p>
        </div>

        {/* Add Task Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => openDialog()}
            size="lg"
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-5 w-5" />
            Add Task
          </Button>
        </div>

        {/* Active Tasks */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            To Do
          </h2>
          {activeTasks.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 dark:text-slate-400 border-dashed">
              No tasks yet. Add one to get started! 🚀
            </Card>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => openDialog(task)}
                  onDelete={() => deleteTask(task.id)}
                  onToggle={() => toggleComplete(task.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-slate-500 dark:text-slate-400">
              Done ✨
            </h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => openDialog(task)}
                  onDelete={() => deleteTask(task.id)}
                  onToggle={() => toggleComplete(task.id)}
                />
              ))}
            </div>
          </section>
        )}
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
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggle,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <Card
      className={`p-4 transition-all hover:shadow-lg ${
        task.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={`mt-1 shrink-0 ${
            task.completed
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {task.completed ? (
            <Check className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5 opacity-0 hover:opacity-100" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3
              className={`font-medium ${
                task.completed
                  ? 'line-through text-slate-500 dark:text-slate-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
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
            <p
              className={`text-sm ${
                task.completed
                  ? 'text-slate-400 dark:text-slate-500'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
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
    </Card>
  );
}
