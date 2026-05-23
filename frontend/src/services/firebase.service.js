// frontend/src/services/firebase.service.js
import api from './api';
import { API_URL } from '../utils/constants';

class FirebaseService {
  async pushMedia(mediaData) {
    // ✅ Log pour voir exactement quelle URL est appelée
    console.log('📡 pushMedia appelé');
    console.log('   API_URL:', API_URL);
    console.log('   URL complète:', API_URL + '/media/register');
    console.log('   data:', JSON.stringify(mediaData).substring(0, 100));

    try {
      const response = await api.post('/media/register', mediaData);
      console.log('✅ pushMedia réponse:', response.status, response.data);
      return response.data?.data?.id;
    } catch (error) {
      console.error('❌ pushMedia erreur:');
      console.error('   status:', error.response?.status);
      console.error('   url appelée:', error.config?.url);
      console.error('   baseURL:', error.config?.baseURL);
      console.error('   data:', error.response?.data);
      throw error;
    }
  }

  async deleteMedia(id) {
    await api.delete(`/media/${id}`);
    return true;
  }

  async getAllMedia() {
    const response = await api.get('/media');
    return response.data?.data || [];
  }
}

export default new FirebaseService();
