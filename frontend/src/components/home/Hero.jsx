import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import settingsService from '../../services/settings.service';
import filesService from '../../services/files.service';
import toast from 'react-hot-toast';
import { ROUTES, ANIMATION_VARIANTS, TRANSITION } from '../../utils/constants';

const Hero = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchCV();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.get();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchCV = async () => {
    try {
      const response = await filesService.getAll();
      const cv = response.data.find(file => file.category === 'cv');
      setCvFile(cv);
    } catch (error) {
      console.error('Error fetching CV:', error);
    }
  };

  const handleDownloadCV = async () => {
    if (cvFile) {
      try {
        window.open(`${import.meta.env.VITE_API_URL}/files/${cvFile.id}/download`, '_blank');
        toast.success(t('downloads.success'));
      } catch (error) {
        toast.error(t('downloads.error'));
      }
    } else {
      navigate(ROUTES.DOWNLOADS);
    }
  };

  const isFrench = language === 'fr';
  const title = isFrench ? settings?.profile?.title : settings?.profile?.titleEn;
  const description = isFrench ? settings?.profile?.description : settings?.profile?.descriptionEn;

  return (
    <section className="min-h-screen flex items-center justify-center pt-16 bg-gradient-to-br from-white via-primary-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={ANIMATION_VARIANTS.fadeIn}
            transition={TRANSITION}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  {settings?.profile?.photo ? (
                    <img 
                      src={settings.profile.photo} 
                      alt={settings.profile.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">👨‍💻</span>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.h1
              variants={ANIMATION_VARIANTS.slideUp}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="gradient-text">{title || t('home.title')}</span>
            </motion.h1>

            <motion.p
              variants={ANIMATION_VARIANTS.slideUp}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8"
            >
              {description || t('home.subtitle')}
            </motion.p>

            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={ROUTES.PROJECTS} className="btn btn-primary group">
                {t('home.cta')}
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to={ROUTES.DOWNLOADS} className="btn btn-outline group">
                <Download className="inline-block mr-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
                {t('downloads.cv')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 dark:bg-primary-900 rounded-full opacity-20 blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 dark:bg-purple-900 rounded-full opacity-20 blur-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
