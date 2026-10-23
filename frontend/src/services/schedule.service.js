import api from './api';

export const scheduleService = {
  async getSchedules(params = {}) {
    const response = await api.get('/schedules', { params });
    return response.data;
  },

  async getScheduleById(id) {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  },

  async createSchedule(data) {
    const response = await api.post('/schedules', data);
    return response.data;
  },

  async updateSchedule(id, data) {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  },

  async deleteSchedule(id) {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  },
};
