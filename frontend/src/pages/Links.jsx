// src/pages/Links.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Linkedin, Twitter, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import linksService from '../services/links.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../utils/constants';

const Links = () => {
  const { t } = useLanguage();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await linksService.getAll();
      setLinks(response.data);
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Erreur lors du chargement des liens');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'github': return Github;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      default: return LinkIcon;
    }
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
            {t('links.title')}
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            {t('links.subtitle')}
          </p>
        </motion.div>

        {links.length === 0 ? (
          <div className="text-center py-16">
            <LinkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Aucun lien disponible
            </p>
          </div>
        ) : (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {links.map((link, index) => {
              const Icon = getIcon(link.category);
              return (
                <motion.a
                  key={link.id}
                  variants={ANIMATION_VARIANTS.slideUp}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card p-6 hover:shadow-xl transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 group-hover:text-primary-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {link.url}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
                  </div>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Links;