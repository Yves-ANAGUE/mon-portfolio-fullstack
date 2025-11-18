import { motion } from 'framer-motion';
import { ExternalLink, Github, Calendar } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate } from '../../utils/helpers';
import analyticsService from '../../services/analytics.service';

const ProjectCard = ({ project, onClick }) => {
  const { t } = useLanguage();

  // ✅ FIX: s'assurer que technologies est bien un tableau
  const technologies = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
    ? project.technologies.split(',').map((t) => t.trim())
    : [];

  return (
    <motion.div
      whileHover={{ y: -10 }}
      onClick={() => {
  analyticsService.trackProjectView(project.title); // ✅ AJOUT
  onClick(project);
}}
      className="card overflow-hidden group cursor-pointer"
    >
      {project.image && (
        <div className="relative h-56 overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          {project.category && (
            <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-sm">
              {project.category}
            </span>
          )}
        </div>
      )}

      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
          {project.title}
        </h3>

        {project.date && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Calendar className="w-4 h-4" />
            {formatDate(project.date)}
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {project.description}
        </p>

        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {t('projects.demo')}
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              Code
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
