import React, { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, Clock, MoreVertical, Edit2, Trash2, ArrowRightCircle } from 'lucide-react';

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetails,
  compact = false
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const isOverdue = useMemo(() => {
    if (task.status === 'Completed') return false;
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }, [task.dueDate, task.status]);

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

  const getStatusDot = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500';
      case 'In Progress':
        return 'bg-sky-500';
      case 'Pending':
      default:
        return 'bg-amber-500';
    }
  };

  const getNextStatus = (current) => {
    if (current === 'Pending') return 'In Progress';
    if (current === 'In Progress') return 'Completed';
    return 'Pending';
  };

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 transition-all duration-150 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top bar: Status & Priority & Menu */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${getStatusDot(task.status)} shrink-0`} />
            <span className="text-xs font-medium text-slate-300">
              {task.status}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
              {task.priority}
            </span>

            {/* Actions Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                aria-label="Task options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} 
                  />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-slate-850 border border-slate-700 rounded-lg shadow-xl z-30 py-1 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onViewDetails(task);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-750 flex items-center space-x-2"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(task);
                      }}
                      className="w-full text-left px-3 py-1.5 text-slate-300 hover:bg-slate-750 flex items-center space-x-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit Task</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(task);
                      }}
                      className="w-full text-left px-3 py-1.5 text-rose-400 hover:bg-rose-950/40 flex items-center space-x-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Task Title & Description */}
        <h3
          onClick={() => onViewDetails(task)}
          className={`text-sm font-semibold text-slate-100 hover:text-indigo-300 cursor-pointer transition-colors line-clamp-2 mb-1.5 ${
            task.status === 'Completed' ? 'line-through text-slate-400' : ''
          }`}
        >
          {task.title}
        </h3>

        {!compact && task.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info: Due date & Assignee & Advance button */}
      <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <Calendar className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`} />
          <span className={`text-[11px] ${isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'}`}>
            {task.dueDate}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {task.assignedTo && (
            <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 truncate max-w-[100px]" title={task.assignedTo}>
              {task.assignedTo}
            </span>
          )}

          <button
            type="button"
            onClick={() => onStatusChange(task, getNextStatus(task.status))}
            className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            title={`Advance status to "${getNextStatus(task.status)}"`}
          >
            {task.status === 'Completed' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowRightCircle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
