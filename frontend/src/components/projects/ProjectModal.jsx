// frontend/src/components/projects/ProjectModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, Calendar, Play } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate } from '../../utils/helpers';

const ProjectModal = ({ project, isOpen, onClose }) => {
  const { t } = useLanguage();
  if (!project) return null;

  // ✅ Récupérer technologies
  const technologies = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'object'
    ? Object.values(project.technologies)
    : typeof project.technologies === 'string'
    ? project.technologies.split(',').map(t => t.trim())
    : [];

  // ✅ Récupérer fichiers médias
  const mediaFiles = project.mediaFiles 
    ? typeof project.mediaFiles === 'object'
      ? Object.values(project.mediaFiles)
      : []
    : [];

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
                  {/* ✅ Image/Vidéo de couverture */}
                  {(project.coverImage || project.image) && (
                    <div className="mb-6">
                      {project.coverImageType === 'video' ? (
                        <div className="relative rounded-xl overflow-hidden">
                          <video
                            src={project.coverImage}
                            className="w-full h-64 md:h-96 object-cover"
                            controls
                            autoPlay
                            loop
                          >
                            <source src={project.coverImage} type="video/mp4" />
                          </video>
                          <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 text-white text-sm rounded-full backdrop-blur-sm flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Vidéo
                          </div>
                        </div>
                      ) : (
                        <img
                          src={project.coverImage || project.image}
                          alt={project.title}
                          className="w-full h-64 md:h-96 object-cover rounded-xl"
                        />
                      )}
                    </div>
                  )}

                  {/* ✅ Galerie médias */}
                  {mediaFiles.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">📁 Médias du projet</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {mediaFiles.map((media, index) => (
                          <div key={index} className="relative group rounded-lg overflow-hidden">
                            {media.type === 'video' ? (
                              <video
                                src={media.url}
                                className="w-full h-32 object-cover"
                                controls
                              />
                            ) : media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt={`Média ${index + 1}`}
                                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <a
                                href={media.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-32 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                <div className="text-center">
                                  <div className="text-2xl mb-1">📄</div>
                                  <div className="text-xs px-2">{media.originalName || 'Fichier'}</div>
                                </div>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  {project.date && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                      <Calendar className="w-5 h-5" />
                      <span>{formatDate(project.date)}</span>
                    </div>
                  )}

                  {/* ✅ Description avec préservation des sauts de ligne */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">📝 Description</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </div>

                  {/* Description longue si disponible */}
                  {project.longDescription && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">📄 Détails complets</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {project.longDescription}
                      </p>
                    </div>
                  )}

                  {/* Technologies */}
                  {technologies.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">🔧 Technologies utilisées</h3>
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech, index) => (
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

                  {/* Fonctionnalités */}
                  {project.features && project.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">✨ Fonctionnalités</h3>
                      <ul className="space-y-2">
                        {project.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary-600 mt-1">•</span>
                            <span className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Liens */}
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
