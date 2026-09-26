import React from 'react';
import { CheckSquare, LogOut, BookOpen, User as UserIcon } from 'lucide-react';

export const Navbar = ({ user, onLogout, onOpenGuide }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 tracking-tight text-base">
                TaskFlow
              </span>
              <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.2 rounded font-medium">
                Real-Time JS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Full-Stack Node.js · Express · Socket.IO · React
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onOpenGuide}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Project Docs & Setup</span>
            <span className="sm:hidden">Docs</span>
          </button>

          {user && (
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
              <div className="flex items-center space-x-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-700 bg-slate-800"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <span className="block text-xs font-medium text-slate-200 leading-tight">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono leading-tight">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
