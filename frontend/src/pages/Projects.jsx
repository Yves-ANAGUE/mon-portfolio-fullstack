// frontend/src/pages/Projects.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import SearchBar from '../components/common/SearchBar';
import ProjectFilters from '../components/projects/ProjectFilters';
import ProjectsList from '../components/projects/ProjectsList';
import ProjectModal from '../components/projects/ProjectModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLanguage } from '../hooks/useLanguage';
import projectsService from '../services/projects.service';
import { searchInArray, filterByCategory } from '../utils/helpers';
import { ANIMATION_VARIANTS } from '../utils/constants';

const Projects = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ✅ État pour le tri
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'oldest', 'alpha'

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, selectedCategory, sortOrder, projects]);

  const fetchProjects = async () => {
    try {
      const response = await projectsService.getAll();
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by category
    filtered = filterByCategory(filtered, selectedCategory);

    // Search
    if (searchTerm) {
      filtered = searchInArray(filtered, searchTerm, ['title', 'description', 'technologies']);
    }

    // ✅ Tri
    if (sortOrder === 'recent') {
      // Plus récents d'abord
      filtered.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    } else if (sortOrder === 'oldest') {
      // Plus anciens d'abord
      filtered.sort((a, b) => new Date(a.date || a.createdAt || 0) - new Date(b.date || b.createdAt || 0));
    } else if (sortOrder === 'alpha') {
      // Ordre alphabétique
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredProjects(filtered);
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          variants={ANIMATION_VARIANTS.slideDown}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {t('projects.title')}
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            {t('projects.subtitle')}
          </p>
        </motion.div>

        <div className="mb-8">
          <SearchBar
            placeholder={t('projects.search')}
            onSearch={setSearchTerm}
            className="max-w-xl mx-auto mb-6"
          />
          <ProjectFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {/* ✅ Boutons de tri */}
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortOrder('recent')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                sortOrder === 'recent'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              {t('projects.sortRecent')}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortOrder('oldest')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                sortOrder === 'oldest'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              {t('projects.sortOldest')}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSortOrder('alpha')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                sortOrder === 'alpha'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ArrowUpDown className="w-4 h-4" />
              {t('projects.sortAlpha')}
            </motion.button>
          </div>
        </div>

        <ProjectsList
          projects={filteredProjects}
          onProjectClick={handleProjectClick}
        />
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Projects;
