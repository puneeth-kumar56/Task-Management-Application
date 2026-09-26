const TOKEN_KEY = 'taskflow_auth_token';
const USER_KEY = 'taskflow_user';

export const authStorage = {
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function request(endpoint, options = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      authStorage.clear();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      return res;
    },

    register: async (name, email, password) => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
      return res;
    },

    getMe: async () => {
      const res = await request('/api/auth/me');
      authStorage.setUser(res.user);
      return res;
    },

    seedTasks: async () => {
      return request('/api/auth/seed-tasks', {
        method: 'POST'
      });
    },

    logout: () => {
      authStorage.clear();
    }
  },

  tasks: {
    getAll: async (filters) => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }
      if (filters?.priority && filters.priority !== 'All') {
        params.append('priority', filters.priority);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const endpoint = `/api/tasks${queryString ? `?${queryString}` : ''}`;
      return request(endpoint);
    },

    getById: async (id) => {
      return request(`/api/tasks/${id}`);
    },

    create: async (taskData) => {
      return request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
    },

    update: async (id, updates) => {
      return request(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },

    delete: async (id) => {
      return request(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
    }
  }
};
