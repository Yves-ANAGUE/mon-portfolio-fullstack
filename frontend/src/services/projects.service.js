import api from './api';

class ProjectsService {
  async getAll() {
    const response = await api.get('/projects');
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  }

  async create(formData) {
    const response = await api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id, formData) {
    const response = await api.put(`/projects/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }
}

export default new ProjectsService();
