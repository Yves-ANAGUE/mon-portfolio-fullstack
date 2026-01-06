// frontend/src/components/home/FeaturedProjects.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { ROUTES, ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../../utils/constants';
import projectsService from '../../services/projects.service';
import LoadingSpinner from '../common/LoadingSpinner';

const FeaturedProjects = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsService.getAll();
      // ✅ Les projets sont déjà triés par date décroissante depuis le backend
      // On prend seulement les 3 plus récents
      // ✅ Trier du plus RÉCENT au plus ancien
      const sorted = response.data.sort((a, b) => 
        new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      );
      // ✅ Prendre les 3 plus récents
      setProjects(sorted.slice(0, 3));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="section bg-gray-50 dark:bg-gray-800">
        <div className="container-custom flex justify-center">
          <LoadingSpinner size="lg" text={t('common.loading')} />
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-gray-50 dark:bg-gray-800">
      <div className="container-custom">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={STAGGER_CONTAINER}
        >
          <motion.h2
            variants={ANIMATION_VARIANTS.slideUp}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            {t('home.featured')}
          </motion.h2>

          <motion.p
            variants={ANIMATION_VARIANTS.slideUp}
            className="text-xl text-center text-gray-600 dark:text-gray-400 mb-16"
          >
            {t('home.featuredSubtitle')}
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {projects.map((project) => {
              // ✅ Sécurisation du champ technologies
              const technologies = Array.isArray(project.technologies)
                ? project.technologies
                : typeof project.technologies === 'object'
                ? Object.values(project.technologies)
                : typeof project.technologies === 'string'
                ? project.technologies.split(',').map((t) => t.trim())
                : [];

              return (
                <motion.div
                  key={project.id}
                  variants={ANIMATION_VARIANTS.slideUp}
                  whileHover={{ y: -10 }}
                  className="card overflow-hidden group"
                >
                  {(project.coverImage || project.image) && (
                    <div className="relative h-48 overflow-hidden">
                      {project.coverImageType === 'video' ? (
                        <video
                          src={project.coverImage}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          muted
                          loop
                          autoPlay
                        />
                      ) : (
                        <img
                          src={project.coverImage || project.image}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">
                      {project.title}
                    </h3>
                    {/* ✅ Préservation des sauts de ligne */}
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 whitespace-pre-wrap">
                      {project.description}
                    </p>

                    {technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {technologies.slice(0, 3).map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                          >
                            {tech}
                          </span>
                        ))}
                        {technologies.length > 3 && (
                          <span className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            +{technologies.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir
                        </a>
                      )}

                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        >
                          <Github className="w-4 h-4" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            variants={ANIMATION_VARIANTS.slideUp}
            className="text-center"
          >
            <Link to={ROUTES.PROJECTS} className="btn btn-primary group">
              {t('home.viewAll')}
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
