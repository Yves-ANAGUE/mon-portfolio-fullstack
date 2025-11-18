import api from './api';

class ContactService {
  async send(data) {
    const response = await api.post('/contact', data);
    return response.data;
  }

  async getAll() {
    const response = await api.get('/contact');
    return response.data;
  }

  async delete(id) {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  }
}

export default new ContactService();
