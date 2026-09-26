import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const DeleteConfirmModal = ({
  isOpen,
  task,
  onClose,
  onConfirm,
  loading
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-xl shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-100">
              Confirm Delete Task
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-slate-200 font-medium">"{task.title}"</strong>? This action will sync immediately across all connected team sessions.
            </p>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-lg transition-colors shadow-lg shadow-rose-600/30 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{loading ? 'Deleting...' : 'Delete Task'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
