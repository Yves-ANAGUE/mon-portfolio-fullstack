import api from './api';

class SettingsService {
  async get() {
    const response = await api.get('/settings');
    return response.data;
  }

  async update(formData) {
    const response = await api.put('/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default new SettingsService();
