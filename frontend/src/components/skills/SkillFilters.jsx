// frontend/src/components/skills/SkillFilters.jsx
import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';

const SkillFilters = ({ selectedCategory, onCategoryChange }) => {
  const { t } = useLanguage();

  // ✅ Ajout de "Soft Skills" et "Autre"
  const categories = [
    { value: 'all', label: t('skills.all') },
    { value: 'frontend', label: t('skills.frontend') },
    { value: 'backend', label: t('skills.backend') },
    { value: 'database', label: t('skills.database') },
    { value: 'devops', label: t('skills.devops') },
    { value: 'tools', label: t('skills.tools') },
    { value: 'soft-skills', label: t('skills.softSkills') }, // ✅ AJOUT
    { value: 'other', label: t('skills.other') } // ✅ AJOUT
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

export default SkillFilters;
