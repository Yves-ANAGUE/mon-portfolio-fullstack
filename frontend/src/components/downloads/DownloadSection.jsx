// frontend/src/components/downloads/DownloadSection.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Loader2, Search } from 'lucide-react';
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

  // 🔎 Recherche & tri
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await filesService.getAll();
      const publicFiles = response.data.filter(
        (file) => file.category === 'cv' || file.category === 'document'
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
      const downloadUrl = `${import.meta.env.VITE_API_URL}/files/${file.id}/download`;

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.originalName || file.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      analyticsService.trackDownload(file.title);
      toast.success(t('downloads.success'));
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(t('downloads.error'));
    }
  };

  // 🔎 Filtrage + tri
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Recherche
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (file) =>
          file.title?.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query)
      );
    }

    // Tri
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'size-asc':
        result.sort((a, b) => a.size - b.size);
        break;
      case 'size-desc':
        result.sort((a, b) => b.size - a.size);
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'date-desc':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [files, search, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      {/* 🔎 Recherche & tri */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <option value="date-desc">{t('common.sortNewest')}</option>
          <option value="date-asc">{t('common.sortOldest')}</option>
          <option value="name-asc">{t('common.sortNameAsc')}</option>
          <option value="name-desc">{t('common.sortNameDesc')}</option>
          <option value="size-asc">{t('common.sortSizeAsc')}</option>
          <option value="size-desc">{t('common.sortSizeDesc')}</option>
        </select>
      </div>

      {/* 📄 Liste des fichiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFiles.map((file, index) => (
          <motion.div
            key={file.id}
            variants={ANIMATION_VARIANTS.slideUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }}
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

              <div className="flex items-center gap-3 text-xs text-gray-500">
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
              className="p-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              aria-label={`${t('common.download')} ${file.title}`}
            >
              <Download className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ))}

        {filteredFiles.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('downloads.noFiles')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default DownloadSection;
