import { Globe } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { motion } from 'framer-motion';
import { LANGUAGES } from '../../utils/constants';
import analyticsService from '../../services/analytics.service';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const handleToggle = () => {
    const newLang = language === LANGUAGES.FR ? LANGUAGES.EN : LANGUAGES.FR;
    changeLanguage(newLang);
    analyticsService.trackLanguageChange(newLang); // ✅ AJOUT
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className="flex items-center gap-2 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Change language"
    >
      <Globe className="w-5 h-5" />
      <span className="text-sm font-medium uppercase">{language}</span>
    </motion.button>
  );
};

export default LanguageSwitcher;
