import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../../utils/constants';
import { useLanguage } from '../../hooks/useLanguage';

const ProjectsList = ({ projects, onProjectClick }) => {
  const { t } = useLanguage();

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          {t('projects.noResults')}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={ANIMATION_VARIANTS.slideUp}>
          <ProjectCard project={project} onClick={onProjectClick} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProjectsList;
