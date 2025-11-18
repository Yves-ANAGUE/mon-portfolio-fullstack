import api from './api';

class TestimonialsService {
  async getAll() {
    const response = await api.get('/testimonials');
    return response.data;
  }

  async getById(id) {
    const response = await api.get(`/testimonials/${id}`);
    return response.data;
  }

  async create(formData) {
    const response = await api.post('/testimonials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id, formData) {
    const response = await api.put(`/testimonials/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/testimonials/${id}`);
    return response.data;
  }
}

export default new TestimonialsService();
