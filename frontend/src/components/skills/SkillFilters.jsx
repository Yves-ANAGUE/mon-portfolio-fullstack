import { motion } from 'framer-motion';
import { useLanguage } from '../../hooks/useLanguage';
import { CATEGORIES } from '../../utils/constants';

const SkillFilters = ({ selectedCategory, onCategoryChange }) => {
  const { t } = useLanguage();

  const categories = [
    { value: 'all', label: t('skills.all') },
    ...CATEGORIES.SKILLS.map(cat => ({ 
      value: cat, 
      label: t(`skills.${cat.replace('-', '')}`) 
    }))
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
