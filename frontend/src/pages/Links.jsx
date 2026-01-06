import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Linkedin, Twitter, Link as LinkIcon, Search } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import linksService from '../services/links.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../utils/constants';

const Links = () => {
  const { t } = useLanguage();
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    filterAndSortLinks();
  }, [links, searchTerm, sortBy]);

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

  const filterAndSortLinks = () => {
    let filtered = [...links];

    // Recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(l => 
        (l.title && l.title.toLowerCase().includes(term)) ||
        (l.url && l.url.toLowerCase().includes(term)) ||
        (l.category && l.category.toLowerCase().includes(term))
      );
    }

    // Tri
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'category':
        filtered.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        break;
      default:
        break;
    }

    setFilteredLinks(filtered);
  };

  const getIcon = (category) => {
    switch (category) {
      case 'github': return Github;
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      case 'project': return ExternalLink;
      default: return LinkIcon;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'github': return 'bg-gray-800 text-white';
      case 'linkedin': return 'bg-blue-600 text-white';
      case 'twitter': return 'bg-sky-500 text-white';
      case 'project': return 'bg-purple-600 text-white';
      default: return 'bg-primary-600 text-white';
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

        {/* ✅ Recherche et tri */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('links.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          <div className="flex justify-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-medium"
            >
              <option value="newest">{t('links.sortRecent')}</option>
              <option value="oldest">{t('links.sortOldest')}</option>
              <option value="alphabetical">{t('links.sortAlpha')}</option>
              <option value="category">Par catégorie</option>
            </select>
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="text-center py-16">
            <LinkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Aucun lien trouvé' : t('links.noLinks')}
            </p>
          </div>
        ) : (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredLinks.map((link, index) => {
              const Icon = getIcon(link.category);
              const colorClass = getCategoryColor(link.category);
              
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
                    <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 group-hover:text-primary-600 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                        {link.url}
                      </p>
                      {link.category && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {link.category}
                        </span>
                      )}
                      {link.projectName && (
                        <p className="text-xs text-gray-500 mt-1">
                          📁 {link.projectName}
                        </p>
                      )}
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
