import { Router } from 'express';
import { taskDB } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protect all task endpoints
router.use(authenticateToken);

// GET /api/tasks
router.get('/', (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const tasks = taskDB.getAll({
      status,
      priority,
      search,
      userId: req.user?.id
    });

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  try {
    const task = taskDB.getById(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }
    res.json(task);
  } catch (err) {
    console.error('Error fetching task by ID:', err);
    res.status(500).json({ error: 'Failed to retrieve task.' });
  }
});

// POST /api/tasks (Create task)
router.post('/', (req, res) => {
  try {
    const { title, description, dueDate, status, priority, assignedTo, tags } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Task title is required.' });
      return;
    }

    if (!dueDate) {
      res.status(400).json({ error: 'Due date is required.' });
      return;
    }

    const newTaskData = {
      title: title.trim(),
      description: (description || '').trim(),
      dueDate,
      status: status || 'Pending',
      priority: priority || 'Medium',
      assignedTo: (assignedTo || req.user?.name || '').trim(),
      tags: Array.isArray(tags) ? tags : [],
      createdBy: {
        _id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    };

    const task = taskDB.create(newTaskData);

    // Emit Real-time Socket.IO events
    const io = req.app.get('io');
    if (io) {
      io.emit('task:created', task);
      io.emit('user:activity', {
        text: `${req.user.name} created task "${task.title}"`,
        time: new Date().toISOString(),
        userName: req.user.name
      });
    }

    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id (Update task)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = taskDB.getById(id);

    if (!existing) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.createdAt;
    delete updates.createdBy;

    const updatedTask = taskDB.update(id, updates);
    if (!updatedTask) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    // Emit Real-time Socket.IO events
    const io = req.app.get('io');
    if (io) {
      io.emit('task:updated', updatedTask);
      io.emit('user:activity', {
        text: `${req.user.name} updated "${updatedTask.title}" (${updatedTask.status})`,
        time: new Date().toISOString(),
        userName: req.user.name
      });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id (Delete task)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = taskDB.getById(id);

    if (!existing) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const taskTitle = existing.title;
    const deleted = taskDB.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Task not found or already removed.' });
      return;
    }

    // Emit Real-time Socket.IO events
    const io = req.app.get('io');
    if (io) {
      io.emit('task:deleted', { taskId: id, deletedBy: req.user.name });
      io.emit('user:activity', {
        text: `${req.user.name} deleted task "${taskTitle}"`,
        time: new Date().toISOString(),
        userName: req.user.name
      });
    }

    res.json({ message: 'Task removed successfully', taskId: id });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

export default router;
