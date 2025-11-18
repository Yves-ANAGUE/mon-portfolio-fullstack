// frontend/src/components/downloads/DownloadSection.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import filesService from '../../services/files.service';
import toast from 'react-hot-toast';
import { formatFileSize } from '../../utils/helpers';
import { ANIMATION_VARIANTS } from '../../utils/constants';
import analyticsService from '../../services/analytics.service';

const DownloadSection = () => {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await filesService.getAll();
      const publicFiles = response.data.filter(file => 
        file.category === 'cv' || file.category === 'document'
      );
      setFiles(publicFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error(t('downloads.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      // ✅ FIX: Télécharger depuis l'endpoint dédié
      const downloadUrl = `${import.meta.env.VITE_API_URL}/files/${file.id}/download`;
      
      // Créer un lien temporaire pour forcer le téléchargement
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.originalName || file.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      analyticsService.trackDownload(file.title); // ✅ AJOUT
      toast.success(t('downloads.success'));
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(t('downloads.error'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {files.map((file, index) => (
        <motion.div
          key={file.id}
          variants={ANIMATION_VARIANTS.slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
          className="card p-6 flex items-start gap-4 group hover:shadow-xl"
        >
          <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-primary-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1 truncate">
              {file.title}
            </h3>
            {file.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {file.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
              <span>{formatFileSize(file.size)}</span>
              {file.mimeType && (
                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                  {file.mimeType.split('/')[1]?.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDownload(file)}
            className="p-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            aria-label={`${t('common.download')} ${file.title}`}
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </motion.div>
      ))}

      {files.length === 0 && (
        <div className="col-span-2 text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('downloads.noFiles')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DownloadSection;