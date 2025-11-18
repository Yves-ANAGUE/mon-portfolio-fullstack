// frontend/src/services/interests.service.js
import api from './api';

class InterestsService {
  async getAll() {
    const response = await api.get('/interests');
    return response.data;
  }

  async create(data) {
    const response = await api.post('/interests', data);
    return response.data;
  }

  async update(id, data) {
    const response = await api.put(`/interests/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/interests/${id}`);
    return response.data;
  }
}

export default new InterestsService();