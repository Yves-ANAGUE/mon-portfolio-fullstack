import api from './api';

class FilesService {
  async getAll() {
    const response = await api.get('/files');
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/files/${id}`);
    return response.data;
  }

  async upload(formData) {
    const response = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id, formData) {
    const response = await api.put(`/files/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  }
}

export default new FilesService();
