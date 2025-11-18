import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchTerm, selectedCategory, projects]);

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
