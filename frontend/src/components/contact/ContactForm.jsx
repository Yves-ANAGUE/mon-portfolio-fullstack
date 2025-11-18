import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Mail, User, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import contactService from '../../services/contact.service';
import toast from 'react-hot-toast';
import { validateEmail } from '../../utils/helpers';
import { ANIMATION_VARIANTS } from '../../utils/constants';
import analyticsService from '../../services/analytics.service';

const ContactForm = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    try {
      setLoading(true);
      await contactService.send(formData);
      analyticsService.trackContactFormSubmit(); // ✅ AJOUT
      toast.success(t('contact.success'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('contact.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.slideUp}
      initial="hidden"
      animate="visible"
      className="card p-8 max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="inline-block w-4 h-4 mr-2" />
            {t('contact.name')} *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Votre nom"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <Mail className="inline-block w-4 h-4 mr-2" />
            {t('contact.email')} *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`input ${errors.email ? 'border-red-500' : ''}`}
            placeholder="votre.email@exemple.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <MessageSquare className="inline-block w-4 h-4 mr-2" />
            {t('contact.subject')} *
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className={`input ${errors.subject ? 'border-red-500' : ''}`}
            placeholder="Sujet de votre message"
          />
          {errors.subject && (
            <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('contact.message')} *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className={`textarea ${errors.message ? 'border-red-500' : ''}`}
            placeholder="Votre message..."
          />
          {errors.message && (
            <p className="text-sm text-red-500 mt-1">{errors.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {t('contact.sending')}
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              {t('contact.send')}
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ContactForm;
