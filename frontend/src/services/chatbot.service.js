// frontend/src/services/chatbot.service.js
import api from './api';

class ChatbotService {
  async sendMessage(message, conversationId = null, language = 'fr') {
    try {
      console.log('🚀 Sending message:', { message, conversationId, language });
      
      const response = await api.post('/chatbot/message', {
        message: message.trim(),
        conversationId,
        language
      });
      
      console.log('📥 Response received:', response.data);
      
      if (!response.data || response.data.success === false) {
        throw new Error(response.data?.message || 'Invalid response');
      }
      
      if (!response.data.response) {
        throw new Error('No response content');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Chatbot service error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async getHistory(conversationId) {
    try {
      const response = await api.get(`/chatbot/history/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('❌ History error:', error);
      throw error;
    }
  }
}

export default new ChatbotService();