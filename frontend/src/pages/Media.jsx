// src/pages/Media.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Download } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import mediaService from '../services/media.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../utils/constants';

const Media = () => {
  const { t } = useLanguage();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await mediaService.getAll();
      setMedia(response.data);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = filter === 'all' 
    ? media 
    : media.filter(m => m.type === filter);

  const handleDownload = (item) => {
    window.open(item.url, '_blank');
    toast.success('Téléchargement démarré !');
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
            {t('media.title')}
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            {t('media.subtitle')}
          </p>
        </motion.div>

        {/* Filtres */}
        <div className="flex justify-center gap-3 mb-8">
          {['all', 'image', 'video'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === type
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type === 'all' ? t('media.all') : type === 'image' ? t('media.images') : t('media.videos')}
            </button>
          ))}
        </div>

        {/* Grille de médias */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Aucun média disponible
            </p>
          </div>
        ) : (
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredMedia.map((item, index) => (
              <motion.div
                key={item.id}
                variants={ANIMATION_VARIANTS.slideUp}
                className="card overflow-hidden group"
              >
                <div className="relative h-64">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 text-xs font-medium flex items-center gap-1">
                      {item.type === 'image' ? (
                        <><Image className="w-3 h-3" /> Image</>
                      ) : (
                        <><Video className="w-3 h-3" /> Vidéo</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {item.description}
                    </p>
                  )}
                  <button
                    onClick={() => handleDownload(item)}
                    className="btn btn-primary w-full text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('common.download')}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Media;