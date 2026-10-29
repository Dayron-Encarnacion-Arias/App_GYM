import api from './api';

export const workoutService = {
  async getWorkouts() {
    const response = await api.get('/workouts');
    return response.data;
  },

  async createWorkout(data) {
    const response = await api.post('/workouts', data);
    return response.data;
  },

  async updateWorkout(id, data) {
    const response = await api.put(`/workouts/${id}`, data);
    return response.data;
  },

  async deleteWorkout(id) {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },
};
