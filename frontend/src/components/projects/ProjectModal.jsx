import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Calendar } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate } from '../../utils/helpers';

const ProjectModal = ({ project, isOpen, onClose }) => {
  const { t } = useLanguage();
  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-10 z-50 overflow-auto"
          >
            <div className="min-h-full flex items-center justify-center p-4">
              <div className="card max-w-4xl w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
                  <h2 className="text-2xl font-bold">{project.title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-64 md:h-96 object-cover rounded-xl mb-6"
                    />
                  )}

                  {project.images && project.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {project.images.map((img, index) => (
                        <img
                          key={index}
                          src={img.url || img}
                          alt={`${project.title} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {project.date && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                      <Calendar className="w-5 h-5" />
                      <span>{formatDate(project.date)}</span>
                    </div>
                  )}

                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                    {project.description}
                  </p>

                  {project.longDescription && (
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {project.longDescription}
                    </p>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Technologies utilisées</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.features && project.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Fonctionnalités</h3>
                      <ul className="space-y-2">
                        {project.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary-600">•</span>
                            <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Voir le projet
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                      >
                        <Github className="w-5 h-5 mr-2" />
                        Code source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
