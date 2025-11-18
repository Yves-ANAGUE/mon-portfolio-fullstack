// frontend/src/pages/Contact.jsx - MISE À JOUR
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import ContactForm from '../components/contact/ContactForm';
import { useLanguage } from '../hooks/useLanguage';
import settingsService from '../services/settings.service';
import { ANIMATION_VARIANTS } from '../utils/constants';

const Contact = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.get();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const isFrench = language === 'fr';

  // ✅ Valeurs sûres / par défaut pour éviter crash si settings est null
  const profile = settings?.profile || {};

  const emails = Array.isArray(profile.emails)
    ? profile.emails.filter(Boolean)
    : profile.email
      ? [profile.email]
      : [];

  const phones = Array.isArray(profile.phones)
    ? profile.phones.filter(Boolean)
    : profile.phone
      ? [profile.phone]
      : [];

  const locations = isFrench
    ? (Array.isArray(profile.locations) ? profile.locations : (profile.location ? [profile.location] : []))
    : (Array.isArray(profile.locationsEn) ? profile.locationsEn : (profile.locationEn ? [profile.locationEn] : []));

  // ✅ Fonction pour ouvrir Google Maps
  const openGoogleMaps = (location) => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

  const socialLinks = [
    {
      icon: Github,
      label: 'GitHub',
      href: settings?.socials?.github || 'https://github.com'
    },
    {
      icon: Linkedin,
      label: 'LinkedIn',
      href: settings?.socials?.linkedin || 'https://linkedin.com'
    },
    {
      icon: Twitter,
      label: 'Twitter',
      href: settings?.socials?.twitter || 'https://twitter.com'
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          variants={ANIMATION_VARIANTS.slideDown}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        {/* ✅ Cartes de contact avec données multiples */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Emails */}
          {emails.length > 0 && (
            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
              initial="hidden"
              animate="visible"
              className="card p-6"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-3 text-center">{t('contact.email')}</h3>
              <div className="space-y-2">
                {emails.map((email, index) => (
                  <a
                    key={index}
                    href={`mailto:${String(email).trim()}`}
                    className="block text-center text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    {email}
                  </a>
                ))}
              </div>
            </motion.div>
          )}

          {/* Téléphones */}
          {phones.length > 0 && (
            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-3 text-center">{t('contact.phone')}</h3>
              <div className="space-y-2">
                {phones.map((phone, index) => {
                  const tel = String(phone).replace(/\s+/g, '');
                  return (
                    <a
                      key={index}
                      href={`tel:${tel}`}
                      className="block text-center text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {phone}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Localisations avec Google Maps */}
          {locations.length > 0 && (
            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-3 text-center">{t('contact.location')}</h3>
              <div className="space-y-2">
                {locations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => openGoogleMaps(location)}
                    className="w-full flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors group"
                  >
                    <span>{location}</span>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Contact Form */}
        <ContactForm />

        {/* Social Links */}
        <motion.div
          variants={ANIMATION_VARIANTS.slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <h3 className="text-lg font-semibold mb-4">{t('contact.followMe')}</h3>
          <div className="flex justify-center gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary-600 hover:text-white transition-colors"
                aria-label={social.label}
              >
                <social.icon className="w-6 h-6" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
