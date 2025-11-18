// frontend/src/services/experiences.service.js
import api from './api';

class ExperiencesService {
  async getAll() {
    const response = await api.get('/experiences');
    return response.data;
  }

  async create(data) {
    const response = await api.post('/experiences', data);
    return response.data;
  }

  async update(id, data) {
    const response = await api.put(`/experiences/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/experiences/${id}`);
    return response.data;
  }
}

export default new ExperiencesService();