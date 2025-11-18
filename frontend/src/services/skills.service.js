import api from './api';

class SkillsService {
  async getAll() {
    const response = await api.get('/skills');
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/skills/${id}`);
    return response.data;
  }

  async create(formData) {
    const response = await api.post('/skills', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id, formData) {
    const response = await api.put(`/skills/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  }
}

export default new SkillsService();
