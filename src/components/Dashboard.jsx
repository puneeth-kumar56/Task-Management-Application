import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Search, ArrowUpDown, LayoutGrid, List,
  CheckCircle2, Clock, AlertTriangle, Users, Sparkles, RefreshCw, Layers
} from 'lucide-react';
import { api } from '../services/api.js';
import { getSocket, subscribeToTaskEvents } from '../services/socket.js';
import { TaskCard } from './TaskCard.jsx';
import { TaskForm } from './TaskForm.jsx';
import { TaskDetailModal } from './TaskDetailModal.jsx';
import { DeleteConfirmModal } from './DeleteConfirmModal.jsx';

export const Dashboard = ({ currentUser, onOpenGuide }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('kanban');

  // Real-time tracking
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsersCount, setActiveUsersCount] = useState(1);
  const [recentActivity, setRecentActivity] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState('Pending');
  const [detailTask, setDetailTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch tasks
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.tasks.getAll();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Setup Socket.IO subscription
  useEffect(() => {
    const socket = getSocket();
    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    const unsubscribe = subscribeToTaskEvents({
      onTaskCreated: (newTask) => {
        setTasks((prev) => {
          if (prev.some((t) => t._id === newTask._id)) return prev;
          return [newTask, ...prev];
        });
      },
      onTaskUpdated: (updatedTask) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
        );
        setDetailTask((curr) => (curr && curr._id === updatedTask._id ? updatedTask : curr));
      },
      onTaskDeleted: ({ taskId }) => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
        setDetailTask((curr) => (curr && curr._id === taskId ? null : curr));
      },
      onUserActivity: (activity) => {
        setRecentActivity({ text: activity.text, time: new Date().toLocaleTimeString() });
      },
      onUsersCount: (count) => {
        setActiveUsersCount(count);
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      unsubscribe();
    };
  }, []);

  // CRUD Handlers
  const handleCreateOrUpdateTask = async (taskData) => {
    if (editingTask) {
      const updated = await api.tasks.update(editingTask._id, taskData);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } else {
      const created = await api.tasks.create(taskData);
      setTasks((prev) => {
        if (prev.some((t) => t._id === created._id)) return prev;
        return [created, ...prev];
      });
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
      );
      if (detailTask && detailTask._id === task._id) {
        setDetailTask({ ...detailTask, status: newStatus });
      }

      await api.tasks.update(task._id, { status: newStatus });
    } catch (err) {
      loadTasks();
      alert('Failed to update task status: ' + err.message);
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      setDeleting(true);
      await api.tasks.delete(taskToDelete._id);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      setTaskToDelete(null);
    } catch (err) {
      alert('Failed to delete task: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSeedDemoTasks = async () => {
    try {
      setLoading(true);
      await api.auth.seedTasks();
      await loadTasks();
    } catch (err) {
      alert('Failed to seed tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (statusFilter !== 'All') {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== 'All') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q)) ||
          (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    result.sort((a, b) => {
      let comp = 0;
      if (sortBy === 'dueDate') {
        comp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const pOrder = { High: 3, Medium: 2, Low: 1 };
        comp = (pOrder[b.priority] || 2) - (pOrder[a.priority] || 2);
      } else if (sortBy === 'title') {
        comp = a.title.localeCompare(b.title);
      } else {
        comp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comp : -comp;
    });

    return result;
  }, [tasks, statusFilter, priorityFilter, searchQuery, sortBy, sortOrder]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter((t) => {
      if (t.status === 'Completed') return false;
      return new Date(t.dueDate) < today;
    }).length;

    return { total, pending, inProgress, completed, overdue };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Total Tasks</span>
            <span className="text-lg font-semibold text-slate-100">{stats.total}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Pending</span>
            <span className="text-lg font-semibold text-amber-300">{stats.pending}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">In Progress</span>
            <span className="text-lg font-semibold text-sky-300">{stats.inProgress}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Completed</span>
            <span className="text-lg font-semibold text-emerald-300">{stats.completed}</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Overdue</span>
            <span className="text-lg font-semibold text-rose-300">{stats.overdue}</span>
          </div>
        </div>
      </div>

      {/* Live Activity & WebSocket Connection Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">Socket Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-rose-400 font-medium">Connecting WS</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{activeUsersCount} active session{activeUsersCount > 1 ? 's' : ''}</span>
          </div>

          {recentActivity && (
            <div className="hidden md:flex items-center space-x-2 text-indigo-300 border-l border-slate-800 pl-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="truncate max-w-sm">{recentActivity.text}</span>
              <span className="text-[10px] text-slate-500">({recentActivity.time})</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <button
            type="button"
            onClick={onOpenGuide}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs rounded border border-indigo-500/30 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Project Specs & Setup</span>
          </button>
        </div>
      </div>

      {/* Search, Filter, Sort & Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, tags, assignee..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                &times;
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 self-end md:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-slate-800 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Kanban Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-slate-800 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Create Task Button */}
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setDefaultColumnStatus('Pending');
                setIsFormOpen(true);
              }}
              className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-md shadow-indigo-600/25 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Filter & Sort Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-500">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sort by */}
            <div className="flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded text-slate-300 text-xs transition-colors"
                title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                {sortOrder.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Task View: Kanban Board or List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-400">Synchronizing tasks with real-time server...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No tasks in your workspace</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            Get started by creating your first task or seed sample tasks to experience real-time sync across connected tabs.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setDefaultColumnStatus('Pending');
                setIsFormOpen(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
            <button
              type="button"
              onClick={handleSeedDemoTasks}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Seed Sample Tasks</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Column: Pending */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Pending
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({filteredAndSortedTasks.filter((t) => t.status === 'Pending').length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setDefaultColumnStatus('Pending');
                  setIsFormOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors"
                title="Add task to Pending"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {filteredAndSortedTasks
                .filter((t) => t.status === 'Pending')
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsFormOpen(true);
                    }}
                    onDelete={(t) => setTaskToDelete(t)}
                    onStatusChange={handleStatusChange}
                    onViewDetails={(t) => setDetailTask(t)}
                  />
                ))}
              {filteredAndSortedTasks.filter((t) => t.status === 'Pending').length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-lg">
                  No pending tasks
                </div>
              )}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  In Progress
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({filteredAndSortedTasks.filter((t) => t.status === 'In Progress').length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setDefaultColumnStatus('In Progress');
                  setIsFormOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors"
                title="Add task to In Progress"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {filteredAndSortedTasks
                .filter((t) => t.status === 'In Progress')
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsFormOpen(true);
                    }}
                    onDelete={(t) => setTaskToDelete(t)}
                    onStatusChange={handleStatusChange}
                    onViewDetails={(t) => setDetailTask(t)}
                  />
                ))}
              {filteredAndSortedTasks.filter((t) => t.status === 'In Progress').length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-lg">
                  No active tasks in progress
                </div>
              )}
            </div>
          </div>

          {/* Column: Completed */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Completed
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  ({filteredAndSortedTasks.filter((t) => t.status === 'Completed').length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setDefaultColumnStatus('Completed');
                  setIsFormOpen(true);
                }}
                className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition-colors"
                title="Add task to Completed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 flex-1">
              {filteredAndSortedTasks
                .filter((t) => t.status === 'Completed')
                .map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={(t) => {
                      setEditingTask(t);
                      setIsFormOpen(true);
                    }}
                    onDelete={(t) => setTaskToDelete(t)}
                    onStatusChange={handleStatusChange}
                    onViewDetails={(t) => setDetailTask(t)}
                  />
                ))}
              {filteredAndSortedTasks.filter((t) => t.status === 'Completed').length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-lg">
                  No completed tasks yet
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-2.5">
          {filteredAndSortedTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              compact
              onEdit={(t) => {
                setEditingTask(t);
                setIsFormOpen(true);
              }}
              onDelete={(t) => setTaskToDelete(t)}
              onStatusChange={handleStatusChange}
              onViewDetails={(t) => setDetailTask(t)}
            />
          ))}
          {filteredAndSortedTasks.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
              No tasks match your current filter criteria.
            </div>
          )}
        </div>
      )}

      {/* Task Create / Edit Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdateTask}
        initialTask={editingTask}
        defaultStatus={defaultColumnStatus}
      />

      {/* Task Details Modal */}
      <TaskDetailModal
        isOpen={Boolean(detailTask)}
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={(t) => {
          setEditingTask(t);
          setIsFormOpen(true);
        }}
        onDelete={(t) => setTaskToDelete(t)}
        onStatusChange={handleStatusChange}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
};
