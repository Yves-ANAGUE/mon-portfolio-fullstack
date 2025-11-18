import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Heart, Code2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import settingsService from '../../services/settings.service';
import { ROUTES } from '../../utils/constants';

const Footer = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(null);
  const currentYear = new Date().getFullYear();

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
  const footerDescription = isFrench ? settings?.footer?.descriptionFr : settings?.footer?.descriptionEn;
  const copyright = isFrench ? settings?.footer?.copyright : settings?.footer?.copyrightEn;

  const socialLinks = [
    { 
      icon: Github, 
      href: settings?.socials?.github || 'https://github.com', 
      label: 'GitHub' 
    },
    { 
      icon: Linkedin, 
      href: settings?.socials?.linkedin || 'https://linkedin.com', 
      label: 'LinkedIn' 
    },
    { 
      icon: Twitter, 
      href: settings?.socials?.twitter || 'https://twitter.com', 
      label: 'Twitter' 
    },
    { 
      icon: Mail, 
      href: `mailto:${settings?.profile?.email || 'contact@example.com'}`, 
      label: 'Email' 
    },
  ];

  const footerLinks = [
    { path: ROUTES.HOME, label: t('nav.home') },
    { path: ROUTES.PROJECTS, label: t('nav.projects') },
    { path: ROUTES.SKILLS, label: t('nav.skills') },
    { path: ROUTES.CONTACT, label: t('nav.contact') },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold gradient-text">Portfolio</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {footerDescription || t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.followMe')}</h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-primary-600 hover:text-white transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <p>{copyright || `© ${currentYear} Portfolio. ${t('footer.allRights')}`}</p>
            <p className="flex items-center gap-1">
              {t('footer.madeWith')} <Heart className="w-4 h-4 text-red-500 fill-current" /> {t('footer.and')} React
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
