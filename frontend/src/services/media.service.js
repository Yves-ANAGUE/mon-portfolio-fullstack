import api from './api';

class MediaService {
  async getAll() {
    const response = await api.get('/media');
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/media/${id}`);
    return response.data;
  }

  async upload(formData) {
    const response = await api.post('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id, formData) {
    const response = await api.put(`/media/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/media/${id}`);
    return response.data;
  }
}

export default new MediaService();
