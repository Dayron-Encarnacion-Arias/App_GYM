import api from './api';

export const exerciseService = {
  async getExercises(params = {}) {
    const response = await api.get('/exercises', { params });
    return response.data;
  },

  async getExerciseById(id) {
    const response = await api.get(`/exercises/${id}`);
    return response.data;
  },

  async createExercise(data) {
    const response = await api.post('/exercises', data);
    return response.data;
  },

  async updateExercise(id, data) {
    const response = await api.put(`/exercises/${id}`, data);
    return response.data;
  },

  async deleteExercise(id) {
    const response = await api.delete(`/exercises/${id}`);
    return response.data;
  },
};
