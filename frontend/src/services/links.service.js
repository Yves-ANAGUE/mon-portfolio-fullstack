import api from './api';

class LinksService {
  async getAll() {
    const response = await api.get('/links');
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/links/${id}`);
    return response.data;
  }

  async create(data) {
    const response = await api.post('/links', data);
    return response.data;
  }

  async update(id, data) {
    const response = await api.put(`/links/${id}`, data);
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/links/${id}`);
    return response.data;
  }
}

export default new LinksService();
