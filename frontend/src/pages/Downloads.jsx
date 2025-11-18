import { motion } from 'framer-motion';
import DownloadSection from '../components/downloads/DownloadSection';
import PortfolioGenerator from '../components/downloads/PortfolioGenerator';
import { useLanguage } from '../hooks/useLanguage';
import { ANIMATION_VARIANTS } from '../utils/constants';

const Downloads = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          variants={ANIMATION_VARIANTS.slideDown}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {t('downloads.title')}
          </h1>
          <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
            {t('downloads.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Portfolio Generator */}
          <PortfolioGenerator />

          {/* Files Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t('downloads.files')}
            </h2>
            <DownloadSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
