// test-chatbot.js (dans le dossier backend)
import axios from 'axios';

const testChatbot = async () => {
  try {
    console.log('🧪 Test chatbot...');
    
    const response = await axios.post(
      'http://localhost:5000/api/chatbot/message',
      {
        message: 'Bonjour',
        language: 'fr'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Réponse:', response.data);
  } catch (error) {
    console.error('❌ Erreur:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
};

testChatbot();