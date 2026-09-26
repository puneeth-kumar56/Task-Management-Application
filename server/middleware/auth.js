import jwt from 'jsonwebtoken';
import { userDB } from '../db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'taskflow-super-secret-jwt-key-2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    res.status(401).json({ error: 'Access denied. No authentication token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = userDB.findById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'Session expired or user no longer exists.' });
      return;
    }

    req.user = {
      id: user._id,
      email: user.email,
      name: user.name
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};
