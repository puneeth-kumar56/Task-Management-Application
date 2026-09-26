import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });
  }

  return socket;
};

export const getSocket = () => {
  return socket || initSocket();
};

export const subscribeToTaskEvents = (handlers) => {
  const s = getSocket();

  if (handlers.onTaskCreated) {
    s.on('task:created', handlers.onTaskCreated);
  }
  if (handlers.onTaskUpdated) {
    s.on('task:updated', handlers.onTaskUpdated);
  }
  if (handlers.onTaskDeleted) {
    s.on('task:deleted', handlers.onTaskDeleted);
  }
  if (handlers.onUserActivity) {
    s.on('user:activity', handlers.onUserActivity);
  }
  if (handlers.onUsersCount) {
    s.on('users:count', handlers.onUsersCount);
  }

  // Cleanup function
  return () => {
    if (handlers.onTaskCreated) s.off('task:created', handlers.onTaskCreated);
    if (handlers.onTaskUpdated) s.off('task:updated', handlers.onTaskUpdated);
    if (handlers.onTaskDeleted) s.off('task:deleted', handlers.onTaskDeleted);
    if (handlers.onUserActivity) s.off('user:activity', handlers.onUserActivity);
    if (handlers.onUsersCount) s.off('users:count', handlers.onUsersCount);
  };
};
