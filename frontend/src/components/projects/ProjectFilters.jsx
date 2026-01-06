// frontend/src/components/projects/ProjectFilters.jsx
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';

const ProjectFilters = ({ selectedCategory, onCategoryChange }) => {
  const { t } = useLanguage();

  // ✅ Ajout du type "Autre"
  const categories = [
    { value: 'all', label: t('projects.all') },
    { value: 'web', label: t('projects.web') },
    { value: 'mobile', label: t('projects.mobile') },
    { value: 'desktop', label: t('projects.desktop') },
    { value: 'api', label: t('projects.api') },
    { value: 'other', label: t('projects.other') } // ✅ AJOUT
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {categories.map((category) => (
        <motion.button
          key={category.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(category.value)}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            selectedCategory === category.value
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {category.label}
        </motion.button>
      ))}
    </div>
  );
};

export default ProjectFilters;
