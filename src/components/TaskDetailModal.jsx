import React from 'react';
import { X, Calendar, User, Clock, CheckCircle2, Edit3, Trash2 } from 'lucide-react';

export const TaskDetailModal = ({
  isOpen,
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  if (!isOpen || !task) return null;

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/50';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
      case 'Low':
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
              {task.priority} Priority
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-300 font-medium">{task.status}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">
              {task.title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.description || <span className="italic text-slate-500">No description provided.</span>}
            </p>
          </div>

          {/* Quick status selector */}
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="block text-xs font-medium text-slate-400 mb-2">Status Progression</span>
            <div className="grid grid-cols-3 gap-2">
              {['Pending', 'In Progress', 'Completed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatusChange(task, s)}
                  className={`py-1.5 px-2 text-xs font-medium rounded border transition-all ${
                    task.status === s
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Meta details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-500">Due Date</span>
                <span>{task.dueDate}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-300">
              <User className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-500">Assignee</span>
                <span>{task.assignedTo || 'Unassigned'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-300">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-500">Created At</span>
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="block text-[11px] text-slate-500">Created By</span>
                <span>{task.createdBy?.name || 'Workspace member'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <span className="block text-xs font-medium text-slate-400 mb-1.5">Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(task);
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1.5 px-3 py-1.5 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-colors flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
