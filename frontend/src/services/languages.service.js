// frontend/src/services/languages.service.js
import api from './api';

class LanguagesService {
  async getAll() {
    const response = await api.get('/languages');
    return response.data;
  }

  async create(data) {
    const response = await api.post('/languages', data);
    return response.data;
  }

  async update(id, data) {
    const response = await api.put(`/languages/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/languages/${id}`);
    return response.data;
  }
}

export default new LanguagesService();