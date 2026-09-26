import React, { useState } from 'react';
import { X, FolderTree, Terminal, Server, FileCode, Check, Copy, Database } from 'lucide-react';

export const ProjectGuideModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('tree');
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const projectTree = `task-management-app/
├── server/                    # Node.js + Express + MongoDB Backend
│   ├── models/
│   │   ├── User.js            # Mongoose User Schema (bcrypt, email, avatar)
│   │   └── Task.js            # Mongoose Task Schema (title, status, priority, dueDate)
│   ├── routes/
│   │   ├── auth.js            # /api/auth/register, /api/auth/login, /api/auth/me
│   │   └── tasks.js           # /api/tasks CRUD + Socket.IO live emissions
│   ├── middleware/
│   │   └── auth.js            # JWT Bearer Token verification middleware
│   ├── db.js                  # Database persistence layer
│   └── server.js              # Express app + HTTP server + Socket.IO initialization
│
├── client/                    # React.js Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx        # Login Form with JWT storage
│   │   │   │   └── Register.jsx     # Registration Form with validation
│   │   │   ├── Dashboard.jsx        # Task Board, Filters, Stats, Real-time
│   │   │   ├── TaskCard.jsx         # Status badge, Priority tag, Quick actions
│   │   │   ├── TaskForm.jsx         # Create & Update Modal Form
│   │   │   ├── TaskDetailModal.jsx  # Detailed View & Status progression
│   │   │   └── DeleteConfirmModal.jsx # Delete confirmation prompt
│   │   ├── services/
│   │   │   ├── api.js               # REST client with JWT Bearer header
│   │   │   └── socket.js            # Socket.IO client instance & event listeners
│   │   ├── App.jsx                  # Main Auth routing & state orchestration
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Tailwind CSS styling
│   ├── index.html
│   └── package.json
│
├── .env.example               # Environment variables template
└── README.md                  # Complete deployment and run guide`;

  const setupCommands = `# 1. Backend Setup & Run
cd server
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors socket.io dotenv
npm install -D nodemon

# Start Backend Server (runs on http://localhost:5000)
node server.js

# 2. Frontend Setup & Run (in another terminal)
cd client
npm create vite@latest . -- --template react
npm install socket.io-client axios lucide-react tailwindcss @tailwindcss/vite
npm run dev`;

  const envTemplate = `# Server .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_jwt_super_secret_key_change_in_production
CLIENT_URL=http://localhost:3000

# Client .env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Project Architecture & Standalone Guide
              </h3>
              <p className="text-xs text-slate-400">
                100% JavaScript (ES6+), React JSX, Node.js, Express & MongoDB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeTab === 'tree'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Directory Layout</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeTab === 'setup'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup & Terminal Commands</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backend')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeTab === 'backend'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Backend Specs (Mongoose & JWT)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('frontend')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              activeTab === 'frontend'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Frontend & WebSockets</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
          {activeTab === 'tree' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-400 font-sans text-xs">
                  Clean single-folder project layout with separated client/ and server/ (100% JavaScript)
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(projectTree, 'tree')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'tree' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'tree' ? 'Copied' : 'Copy Tree'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 overflow-x-auto leading-relaxed">
                {projectTree}
              </pre>
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-4 font-sans text-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-medium">Terminal Commands for Local Execution (Pure JS)</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(setupCommands, 'setup')}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer font-mono"
                  >
                    {copiedKey === 'setup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'setup' ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono overflow-x-auto leading-relaxed">
                  {setupCommands}
                </pre>
              </div>

              <div>
                <span className="text-slate-300 font-medium block mb-2">Environment Configuration (.env)</span>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-amber-300 font-mono overflow-x-auto leading-relaxed">
                  {envTemplate}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="font-sans space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <h4 className="font-semibold text-slate-100 flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Mongoose Task Schema (JavaScript)</span>
                </h4>
                <p className="text-slate-400 mb-2">
                  Enforces title, description, dueDate, status enum (Pending, In Progress, Completed), priority enum (Low, Medium, High), tags array, and createdBy ObjectId reference.
                </p>
                <div className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded border border-slate-800">
                  {`status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }`}
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <h4 className="font-semibold text-slate-100 mb-2">JWT Authentication Flow</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Passwords hashed with bcrypt (10 rounds) before persistence</li>
                  <li>Tokens signed using secret with 7-day expiration</li>
                  <li>Client stores token in localStorage and includes `Authorization: Bearer &lt;token&gt;`</li>
                  <li>Express middleware verifies token and attaches user payload to `req.user`</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'frontend' && (
            <div className="font-sans space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <h4 className="font-semibold text-slate-100 mb-2">Real-Time WebSockets with Socket.IO</h4>
                <p className="text-slate-400 mb-2">
                  When any user creates, modifies, or deletes a task, Express broadcasts events through Socket.IO:
                </p>
                <div className="text-[11px] font-mono text-indigo-300 bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                  <div>io.emit('task:created', task);</div>
                  <div>io.emit('task:updated', updatedTask);</div>
                  <div>io.emit('task:deleted', &#123; taskId, deletedBy &#125;);</div>
                  <div>io.emit('users:count', activeCount);</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg">
                <h4 className="font-semibold text-slate-100 mb-2">Idempotent Frontend Reconciliation</h4>
                <p className="text-slate-400">
                  To prevent duplicate items or race conditions during rapid re-connections, client listeners check `_id` before adding and cleanly update or remove in place without page reload.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900">
          <span className="text-[11px] text-slate-400">
            TaskFlow Production Architecture v1.0.0 (Pure JavaScript)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
