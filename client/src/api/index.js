import api from './axios.js';

// ── Expenses ─────────────────────────────────────────────────────────────────

export const getExpenses = (params) => api.get('/api/expenses', { params });
export const getExpenseById = (id) => api.get(`/api/expenses/${id}`);
export const createExpense = (data) => api.post('/api/expenses', data);
export const updateExpense = (id, data) => api.put(`/api/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/api/expenses/${id}`);
export const getSummary = () => api.get('/api/expenses/summary');
export const getExpensesByDate = (date) => api.get(`/api/expenses/date/${date}`);
export const getMonthlyCalendar = (yearMonth) => api.get(`/api/expenses/monthly-calendar/${yearMonth}`);

// ── Users ─────────────────────────────────────────────────────────────────────

export const updateProfile = (data) => api.put('/api/users/profile', data);
export const updateCurrency = (currency) => api.put('/api/users/currency', { currency });
export const updateTheme = (theme) => api.put('/api/users/theme', { theme });
export const updatePassword = (data) => api.put('/api/users/password', data);
export const deleteAccount = () => api.delete('/api/users/account');
