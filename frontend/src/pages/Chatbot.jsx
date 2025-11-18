// frontend/src/pages/Chatbot.jsx
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Send, Loader2, Sparkles, Code, Briefcase, 
  Mail, HelpCircle, Bot, User, Copy, Download, Share2, 
  Zap, Brain, Cpu, TrendingUp
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import chatbotService from '../services/chatbot.service';
import { ANIMATION_VARIANTS } from '../utils/constants';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: t('chatbot.welcome')
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [stats, setStats] = useState({ messages: 1, responseTime: 0 });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const quickQuestions = language === 'fr' 
    ? [
        { icon: '💼', text: 'Quelles sont tes compétences ?', color: 'from-blue-500 to-cyan-500' },
        { icon: '🚀', text: 'Montre-moi tes projets', color: 'from-purple-500 to-pink-500' },
        { icon: '📧', text: 'Comment te contacter ?', color: 'from-green-500 to-emerald-500' },
        { icon: '📄', text: 'Où trouver ton CV ?', color: 'from-orange-500 to-red-500' },
        { icon: '🎓', text: 'Parle-moi de ta formation', color: 'from-indigo-500 to-purple-500' },
        { icon: '💡', text: 'Décris ton expérience', color: 'from-yellow-500 to-orange-500' },
        { icon: '🌍', text: 'Quelles langues parles-tu ?', color: 'from-pink-500 to-rose-500' },
        { icon: '🤖', text: 'Pourquoi ce chatbot ?', color: 'from-teal-500 to-cyan-500' }
      ]
    : [
        { icon: '💼', text: 'What are your skills?', color: 'from-blue-500 to-cyan-500' },
        { icon: '🚀', text: 'Show me your projects', color: 'from-purple-500 to-pink-500' },
        { icon: '📧', text: 'How to contact you?', color: 'from-green-500 to-emerald-500' },
        { icon: '📄', text: 'Where is your resume?', color: 'from-orange-500 to-red-500' },
        { icon: '🎓', text: 'Tell me about your education', color: 'from-indigo-500 to-purple-500' },
        { icon: '💡', text: 'Describe your experience', color: 'from-yellow-500 to-orange-500' },
        { icon: '🌍', text: 'What languages do you speak?', color: 'from-pink-500 to-rose-500' },
        { icon: '🤖', text: 'Why this chatbot?', color: 'from-teal-500 to-cyan-500' }
      ];

  const handleSend = async (customMessage = null) => {
    const trimmedInput = customMessage || input.trim();
    if (!trimmedInput || loading) return;

    if (!customMessage) setInput('');
    const startTime = Date.now();
    
    const userMessage = { role: 'user', content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(
        trimmedInput, 
        conversationId,
        language
      );
      
      if (response.success && response.response) {
        if (!conversationId && response.conversationId) {
          setConversationId(response.conversationId);
        }

        const responseTime = Date.now() - startTime;
        
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response.response 
          }]);
          setStats(prev => ({
            messages: prev.messages + 2,
            responseTime
          }));
        }, 500);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('❌ Send error:', error);
      
      setIsTyping(false);
      const errorMsg = language === 'fr'
        ? `Désolé, une erreur est survenue. Veuillez réessayer.`
        : `Sorry, an error occurred. Please try again.`;
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg
      }]);
      
      toast.error(t('chatbot.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(language === 'fr' ? '✅ Copié !' : '✅ Copied!');
  };

  const handleExport = () => {
    const text = messages
      .map(m => `${m.role === 'user' ? 'Vous' : 'Assistant'}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.txt`;
    a.click();
    
    toast.success(language === 'fr' ? '✅ Conversation exportée' : '✅ Conversation exported');
  };

  const handleShare = () => {
    const lastMessage = messages[messages.length - 1];
    if (navigator.share && lastMessage.role === 'assistant') {
      navigator.share({
        title: 'Chatbot Portfolio',
        text: lastMessage.content
      }).catch(() => {});
    } else {
      handleCopy(lastMessage.content);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container-custom max-w-7xl">
        {/* Header avec animations */}
        <motion.div
          variants={ANIMATION_VARIANTS.slideDown}
          initial="hidden"
          animate="visible"
          className="text-center mb-8"
        >
          <motion.div 
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3,
              ease: "easeInOut"
            }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl"
          >
            <Bot className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('chatbot.title')} 
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {t('chatbot.subtitle')}
          </p>
          
          {/* Statistiques en temps réel */}
          <div className="flex justify-center gap-6 mt-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-primary-200 dark:border-primary-800"
            >
              <MessageCircle className="w-5 h-5 text-primary-600" />
              <span className="font-bold">{stats.messages}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'fr' ? 'messages' : 'messages'}
              </span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-green-200 dark:border-green-800"
            >
              <Zap className="w-5 h-5 text-green-600" />
              <span className="font-bold">{stats.responseTime}ms</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {language === 'fr' ? 'réponse' : 'response'}
              </span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border-2 border-purple-200 dark:border-purple-800"
            >
              <Brain className="w-5 h-5 text-purple-600" />
              <span className="font-bold">GPT-4</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">powered</span>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar avec fonctionnalités */}
          <motion.div
            variants={ANIMATION_VARIANTS.slideRight}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-4"
          >
            {/* Capacités du chatbot */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary-600" />
                {language === 'fr' ? 'Capacités IA' : 'AI Capabilities'}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      {language === 'fr' ? 'Compréhension naturelle' : 'Natural understanding'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {language === 'fr' ? 'Répond à vos questions naturellement' : 'Answers naturally'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      {language === 'fr' ? 'Contexte intelligent' : 'Smart context'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {language === 'fr' ? 'Se souvient de la conversation' : 'Remembers conversation'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      {language === 'fr' ? 'Réponses rapides' : 'Fast responses'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {language === 'fr' ? 'Temps de réponse < 1s' : 'Response time < 1s'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">
                {language === 'fr' ? 'Actions' : 'Actions'}
              </h3>
              <div className="space-y-2">
                <button
                  onClick={handleExport}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {language === 'fr' ? 'Exporter' : 'Export'}
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  {language === 'fr' ? 'Partager' : 'Share'}
                </button>
              </div>
            </div>

            {/* Aide */}
            <div className="card p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-2 border-primary-200 dark:border-primary-800">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                {t('chatbot.help')}
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Code className="w-4 h-4 text-primary-600 mt-0.5" />
                  <span>{t('chatbot.helpItems.skills')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-primary-600 mt-0.5" />
                  <span>{t('chatbot.helpItems.projects')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-primary-600 mt-0.5" />
                  <span>{t('chatbot.helpItems.contact')}</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Zone de chat principale */}
          <motion.div
            variants={ANIMATION_VARIANTS.scaleIn}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3"
          >
            <div className="card overflow-hidden h-[700px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar avec effet 3D */}
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                          msg.role === 'user' 
                            ? 'bg-gradient-to-br from-primary-600 to-primary-700' 
                            : 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600'
                        }`}
                      >
                        {msg.role === 'user' ? 
                          <User className="w-5 h-5 text-white" /> : 
                          <Bot className="w-5 h-5 text-white" />
                        }
                      </motion.div>
                      
                      {/* Message bubble avec shadow */}
                      <div className="flex flex-col gap-2">
                        <div
                          className={`px-6 py-4 rounded-3xl shadow-xl ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                        
                        {/* Actions */}
                        {msg.role === 'assistant' && (
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() => handleCopy(msg.content)}
                              className="text-xs text-gray-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              {language === 'fr' ? 'Copier' : 'Copy'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Animation de saisie améliorée */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center shadow-lg"
                      >
                        <Bot className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-3xl rounded-bl-md border-2 border-gray-200 dark:border-gray-700 shadow-xl flex gap-2">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                          className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary-600 to-purple-600"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                          className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                        />
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                          className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-600 to-red-600"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Questions rapides avec grid responsive */}
              <div className="px-6 py-4 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  {language === 'fr' ? '⚡ Questions rapides' : '⚡ Quick questions'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {quickQuestions.map((q, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSend(q.text)}
                      disabled={loading}
                      className={`px-3 py-2 text-xs rounded-xl bg-gradient-to-r ${q.color} text-white font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                      <span className="text-base">{q.icon}</span>
                      <span className="hidden md:inline">{q.text.split(' ')[0]}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Input moderne avec effet glassmorphism */}
              <div className="p-6 border-t-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chatbot.placeholder')}
                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-400 shadow-inner"
                    disabled={loading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    className="px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white font-semibold hover:from-primary-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-6 h-6" />
                        <span className="hidden md:inline">{t('chatbot.send')}</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;