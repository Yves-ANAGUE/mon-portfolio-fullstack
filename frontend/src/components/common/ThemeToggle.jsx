import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import analyticsService from '../../services/analytics.service';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  // ✅ Nouvelle fonction pour gérer le clic et le suivi
  const handleToggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'; // Déterminer le prochain thème
    toggleTheme(); // Changement réel du thème
    analyticsService.trackThemeChange(newTheme); // ✅ Envoi à Google Analytics
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleToggleTheme} // 👈 on appelle notre nouvelle fonction
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
