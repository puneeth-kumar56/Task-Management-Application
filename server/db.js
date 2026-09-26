import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// In-memory cache synced to file
let db = {
  users: [],
  tasks: []
};

// Ensure data directory and db file exist
export function initDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
    } else {
      // Seed default user and demo tasks
      const hashedPassword = bcrypt.hashSync('password123', 10);
      const demoUserId = 'usr_' + Date.now().toString(36);

      const demoUser = {
        _id: demoUserId,
        name: 'Alex Rivera',
        email: 'demo@taskflow.dev',
        password: hashedPassword,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const now = new Date();
      const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const demoTasks = [
        {
          _id: 'task_' + Math.random().toString(36).substring(2, 9),
          title: 'Design high-conversion landing page & UI components',
          description: 'Create responsive layout with dark mode accents, Tailwind CSS utility classes, and accessible typography.',
          dueDate: inTwoDays,
          status: 'In Progress',
          priority: 'High',
          assignedTo: 'Alex Rivera',
          tags: ['Design', 'UI/UX'],
          createdBy: {
            _id: demoUserId,
            name: demoUser.name,
            email: demoUser.email
          },
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'task_' + Math.random().toString(36).substring(2, 9),
          title: 'Configure Socket.IO real-time broadcast cluster',
          description: 'Implement bi-directional event pipeline for instant state synchronization across multi-device active sessions.',
          dueDate: inFiveDays,
          status: 'Pending',
          priority: 'Medium',
          assignedTo: 'Dev Team',
          tags: ['Backend', 'WebSockets'],
          createdBy: {
            _id: demoUserId,
            name: demoUser.name,
            email: demoUser.email
          },
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'task_' + Math.random().toString(36).substring(2, 9),
          title: 'Deploy JWT Auth & Password hashing with bcrypt',
          description: 'Enforce Bearer authorization headers and role-protected middleware routes.',
          dueDate: yesterday,
          status: 'Completed',
          priority: 'High',
          assignedTo: 'Alex Rivera',
          tags: ['Security', 'Auth'],
          createdBy: {
            _id: demoUserId,
            name: demoUser.name,
            email: demoUser.email
          },
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      db = {
        users: [demoUser],
        tasks: demoTasks
      };

      persistDB();
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

function persistDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting database:', err);
  }
}

// User CRUD Helpers
export const userDB = {
  findByEmail: (email) => {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findById: (id) => {
    return db.users.find((u) => u._id === id);
  },
  create: (userData) => {
    const newUser = {
      _id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    persistDB();
    return newUser;
  }
};

// Task CRUD Helpers
export const taskDB = {
  getAll: (filters) => {
    let result = [...db.tasks];

    if (filters?.status && filters.status !== 'All') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.priority && filters.priority !== 'All') {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.assignedTo && t.assignedTo.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (id) => {
    return db.tasks.find((t) => t._id === id);
  },

  create: (taskData) => {
    const newTask = {
      _id: 'tsk_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.tasks.unshift(newTask);
    persistDB();
    return newTask;
  },

  update: (id, updates) => {
    const index = db.tasks.findIndex((t) => t._id === id);
    if (index === -1) return null;

    db.tasks[index] = {
      ...db.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    persistDB();
    return db.tasks[index];
  },

  delete: (id) => {
    const initialLength = db.tasks.length;
    db.tasks = db.tasks.filter((t) => t._id !== id);
    const deleted = db.tasks.length !== initialLength;
    if (deleted) persistDB();
    return deleted;
  },

  seedDemoTasksForUser: (user) => {
    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const samples = [
      {
        _id: 'tsk_' + Date.now().toString(36) + '1',
        title: 'Conduct Sprint Retrospective & Planning',
        description: 'Review burndown charts, team feedback, and outline velocity goals for next two weeks.',
        dueDate: inTwoDays,
        status: 'Pending',
        priority: 'High',
        assignedTo: user.name,
        tags: ['Agile', 'Scrum'],
        createdBy: { _id: user._id, name: user.name, email: user.email },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'tsk_' + Date.now().toString(36) + '2',
        title: 'Optimize Database Query Indexes',
        description: 'Add compound indexes on task status and priority fields to reduce latency on high-throughput queries.',
        dueDate: inFiveDays,
        status: 'In Progress',
        priority: 'Medium',
        assignedTo: user.name,
        tags: ['Database', 'Optimization'],
        createdBy: { _id: user._id, name: user.name, email: user.email },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'tsk_' + Date.now().toString(36) + '3',
        title: 'Finalize SSL & Environment Configuration',
        description: 'Verify HTTPS certificates and audit environment variables for production readiness.',
        dueDate: yesterday,
        status: 'Completed',
        priority: 'Low',
        assignedTo: user.name,
        tags: ['DevOps', 'Security'],
        createdBy: { _id: user._id, name: user.name, email: user.email },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const t of samples) {
      db.tasks.unshift(t);
    }
    persistDB();
    return samples;
  }
};
