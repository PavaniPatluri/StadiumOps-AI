import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
};

// Dashboard
export const dashboardApi = {
  getKPIs: () => api.get('/dashboard/kpis'),
  getAnalytics: () => api.get('/dashboard/analytics'),
};

// Incidents
export const incidentsApi = {
  list: (params?: Record<string, string>) => api.get('/incidents/', { params }),
  create: (data: object) => api.post('/incidents/', data),
  get: (id: number) => api.get(`/incidents/${id}`),
  update: (id: number, data: object) => api.patch(`/incidents/${id}`, data),
  delete: (id: number) => api.delete(`/incidents/${id}`),
};

// Zones
export const zonesApi = {
  list: () => api.get('/zones/'),
  get: (id: number) => api.get(`/zones/${id}`),
  update: (id: number, data: object) => api.patch(`/zones/${id}`, data),
};

// Parking
export const parkingApi = {
  list: () => api.get('/parking/'),
  stats: () => api.get('/parking/stats'),
  prediction: (matchImportance?: string) =>
    api.get('/parking/prediction', { params: { match_importance: matchImportance || 'high' } }),
};

// Food Court
export const foodCourtApi = {
  list: () => api.get('/foodcourt/'),
  stats: () => api.get('/foodcourt/stats'),
  forecast: () => api.get('/foodcourt/demand-forecast'),
};

// Tournament
export const tournamentApi = {
  teams: () => api.get('/tournament/teams'),
  fixtures: (status?: string) => api.get('/tournament/fixtures', { params: { status } }),
  standings: () => api.get('/tournament/standings'),
  live: () => api.get('/tournament/live'),
};

// Volunteers
export const volunteersApi = {
  list: (params?: Record<string, string | boolean>) => api.get('/volunteers/', { params }),
  stats: () => api.get('/volunteers/stats'),
  aiTasks: () => api.get('/volunteers/ai-tasks'),
};

// Notifications
export const notificationsApi = {
  list: (params?: Record<string, string | boolean>) => api.get('/notifications/', { params }),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  create: (data: object) => api.post('/notifications/', data),
};

// Chatbot
export const chatbotApi = {
  chat: (message: string) => api.post('/chatbot/chat', { message }),
};

export default api;
