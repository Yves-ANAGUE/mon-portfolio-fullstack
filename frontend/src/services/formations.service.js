// frontend/src/services/formations.service.js
import api from './api';

class FormationsService {
  async getAll() {
    const response = await api.get('/formations');
    return response.data;
  }

  async create(data) {
    const response = await api.post('/formations', data);
    return response.data;
  }

  async update(id, data) {
    const response = await api.put(`/formations/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/formations/${id}`);
    return response.data;
  }
}

export default new FormationsService();