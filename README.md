# TaskFlow - Full-Stack Real-Time Task Management System

A production-ready full-stack Task Management Application built with **React**, **Node.js**, **Express**, **MongoDB (Mongoose)**, **JWT Authentication**, and **Socket.IO** for live real-time bi-directional synchronization.

---

## 1. Project Directory Structure

```text
task-management-app/
├── server/                             # Node.js, Express & MongoDB Backend
│   ├── config/
│   │   └── db.js                       # Mongoose connection logic
│   ├── models/
│   │   ├── User.js                     # User Schema (bcrypt hashing, timestamps)
│   │   └── Task.js                     # Task Schema (enums, priority, dueDate, refs)
│   ├── routes/
│   │   ├── auth.js                     # /api/auth/register, /api/auth/login, /api/auth/me
│   │   └── tasks.js                    # /api/tasks CRUD endpoints + Socket.IO emitters
│   ├── middleware/
│   │   └── auth.js                     # JWT Bearer Token verification middleware
│   ├── .env.example
│   ├── package.json
│   └── server.js                       # Express & Socket.IO server initialization
│
├── client/                             # React Frontend (Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx           # Login form with JWT local storage
│   │   │   │   └── Register.jsx        # Registration form with validation
│   │   │   ├── Dashboard.jsx           # Task Kanban/List, live stats, filters & sort
│   │   │   ├── TaskCard.jsx            # Status badges, priority tags, quick actions
│   │   │   ├── TaskForm.jsx            # Create & Edit modal form
│   │   │   ├── TaskDetailModal.jsx     # Detail view with activity log
│   │   │   └── DeleteConfirmModal.jsx  # Confirmation prompt
│   │   ├── services/
│   │   │   ├── api.js                  # Axios/Fetch client with Bearer auth headers
│   │   │   └── socket.js               # Socket.IO client instance & event dispatcher
│   │   ├── types/
│   │   ├── App.jsx                     # Route guarding, auth state, and notifications
│   │   ├── main.jsx                    # Root mount
│   │   └── index.css                   # Tailwind CSS styling
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .env.example
└── README.md
```

---

## 2. Quick Setup & Local Run Instructions

### Step 1: Backend Setup
```bash
# Navigate to the backend directory
cd server

# Initialize and install dependencies
npm init -y
npm install express mongoose jsonwebtoken bcryptjs cors socket.io dotenv
npm install -D nodemon

# Create .env file
cat <<EOF > .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=super_secret_jwt_key_taskflow_2026
CLIENT_URL=http://localhost:3000
EOF

# Start development server
npm run dev
# (or: npx nodemon server.js)
```

### Step 2: Frontend Setup
```bash
# Navigate to the frontend directory in a separate terminal
cd client

# Initialize React project with Vite
npm create vite@latest . -- --template react
npm install
npm install socket.io-client axios lucide-react tailwindcss @tailwindcss/vite

# Create .env file
cat <<EOF > .env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
EOF

# Start frontend dev server
npm run dev
```

---

## 3. Real-Time Socket.IO Synchronization

Task mutations emit events to all connected clients:
- `task:created`: Prepends new task to clients' boards without page reload.
- `task:updated`: Updates task in-place with latest state and timestamp.
- `task:deleted`: Drops removed task from active views.
- `users:count`: Broadcasts active concurrent connection count.
- `user:activity`: Shows contextual toast of workspace team activities.

---

## 4. Key Application Features

1. **Authentication & Authorization**:
   - Secure registration and login forms with validation
   - Passwords hashed using bcrypt (10 rounds)
   - JSON Web Token (JWT) verification on protected endpoints

2. **Full CRUD Task Management**:
   - Create: Modal form supporting Title, Description, Due Date, Status (Pending, In Progress, Completed), Priority (Low, Medium, High), Assignee, and Tags.
   - Read: Kanban columns or List view with dynamic search, status filtering, and sorting.
   - Update: Modal and in-place quick status advance.
   - Delete: Safe confirmation prompt preventing accidental loss.

3. **Production Polish**:
   - Responsive layout for desktop, tablet, and mobile browsers
   - Real-time connection status pill with pulse animation
   - Demo account pre-configured (`demo@taskflow.dev` / `password123`)
