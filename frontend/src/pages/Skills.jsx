import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchBar from '../components/common/SearchBar';
import SkillFilters from '../components/skills/SkillFilters';
import SkillsGrid from '../components/skills/SkillsGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';
import skillsService from '../services/skills.service';
import { searchInArray, filterByCategory } from '../utils/helpers';
import { ANIMATION_VARIANTS } from '../utils/constants';

const Skills = () => {
  const { t } = useLanguage();
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [searchTerm, selectedCategory, skills]);

  const fetchSkills = async () => {
    try {
      const response = await skillsService.getAll();
      setSkills(response.data);
      setFilteredSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = [...skills];

    // Filter by category
    filtered = filterByCategory(filtered, selectedCategory);

    // Search
    if (searchTerm) {
      filtered = searchInArray(filtered, searchTerm, ['name', 'description']);
    }

    setFilteredSkills(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          variants={ANIMATION_VARIANTS.slideDown}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {t('skills.title')}
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            {t('skills.subtitle')}
          </p>
        </motion.div>

        <div className="mb-8">
          <SearchBar
            placeholder={t('skills.search')}
            onSearch={setSearchTerm}
            className="max-w-xl mx-auto mb-6"
          />
          <SkillFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <SkillsGrid skills={filteredSkills} />
      </div>
    </div>
  );
};

export default Skills;
