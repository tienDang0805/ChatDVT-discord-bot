import axios from 'axios';

const api = axios.create({
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
export { api }; // Export api instance for Login page
export const getDashboardStats = async () => (await api.get('/dashboard/stats')).data;
export const getLogs = async (guildId: string = 'global', page: number = 1, search: string = '') => (await api.get(`/logs/${guildId}?page=${page}&search=${encodeURIComponent(search)}`)).data;
export const getBotConfig = async (guildId: string) => (await api.get(`/config/${guildId}`)).data;
export const updateBotConfig = async (guildId: string, data: any) => (await api.post(`/config/${guildId}`, data)).data;

// New Endpoints
export const getPrompts = async (guildId: string = 'global') => (await api.get(`/prompts?guildId=${guildId}`)).data;
export const updatePrompts = async (data: any, guildId: string = 'global') => (await api.post('/prompts', { ...data, guildId })).data;
export const getGuilds = async () => (await api.get('/guilds')).data;
export const getTopUsers = async () => (await api.get('/stats/users')).data;
export const getActivityHistory = async () => (await api.get('/stats/activity-history')).data;
export const getUsageDistribution = async () => (await api.get('/stats/usage-distribution')).data;
export const getGuildChannels = async (guildId: string) => (await api.get(`/guilds/${guildId}/channels`)).data;
export const sendAnnouncement = async (guildId: string, data: any) => (await api.post(`/guilds/${guildId}/announce`, data)).data;
export const leaveGuild = async (guildId: string) => (await api.delete(`/guilds/${guildId}`)).data;
export const getSystemLogs = async () => (await api.get('/system-logs')).data;
export const resetChatHistory = async (guildId: string) => (await api.delete(`/prompts/history/${guildId}`)).data;
export const getGeminiApiKey = async (guildId: string = 'global') => (await api.get(`/gemini-api-key?guildId=${guildId}`)).data;
export const updateGeminiApiKey = async (data: { apiKey: string }, guildId: string = 'global') => (await api.post('/gemini-api-key', { ...data, guildId })).data;

// Control Panel Endpoints
export const sendControlMessage = async (guildId: string, channelId: string, content: string, embed?: any, files?: File[]) => {
    const formData = new FormData();
    formData.append('guildId', guildId);
    formData.append('channelId', channelId);
    if (content) formData.append('content', content);
    if (embed) formData.append('embed', JSON.stringify(embed));
    
    if (files && files.length > 0) {
        files.forEach(file => {
            formData.append('files', file);
        });
    }

    return (await api.post('/control-panel/send-message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};

export default api;
