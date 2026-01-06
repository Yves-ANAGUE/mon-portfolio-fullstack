// frontend/src/pages/Media.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Download, Search, Filter } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import mediaService from '../services/media.service';
import projectsService from '../services/projects.service';
import skillsService from '../services/skills.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SearchBar from '../components/common/SearchBar';
import toast from 'react-hot-toast';
import { ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../utils/constants';

const Media = () => {
  const { t } = useLanguage();
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'image', 'video'
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ États pour tri par projet/compétence
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'oldest', 'alpha', 'project', 'skill'
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [showProjectList, setShowProjectList] = useState(false);
  const [showSkillList, setShowSkillList] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterMedia();
  }, [filter, searchTerm, sortBy, selectedProjectId, selectedSkillId, media]);

  const fetchData = async () => {
    try {
      const [mediaRes, projectsRes, skillsRes] = await Promise.all([
        mediaService.getAll(),
        projectsService.getAll(),
        skillsService.getAll()
      ]);
      
      setMedia(mediaRes.data);
      setProjects(projectsRes.data);
      setSkills(skillsRes.data);
      setFilteredMedia(mediaRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  const filterMedia = () => {
    let filtered = [...media];

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(m => m.type === filter);
    }

    // ✅ Filter by project
    if (selectedProjectId) {
      filtered = filtered.filter(m => m.projectId === selectedProjectId);
    }

    // ✅ Filter by skill
    if (selectedSkillId) {
      filtered = filtered.filter(m => m.skillId === selectedSkillId);
    }

    // Search
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.skillName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ✅ Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'alpha') {
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    setFilteredMedia(filtered);
  };

  const handleDownload = (item) => {
    window.open(item.url, '_blank');
    toast.success('Téléchargement démarré !');
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setSelectedSkillId(null);
    setShowProjectList(false);
    setSortBy('project');
  };

  const handleSkillSelect = (skillId) => {
    setSelectedSkillId(skillId);
    setSelectedProjectId(null);
    setShowSkillList(false);
    setSortBy('skill');
  };

  const resetFilters = () => {
    setSelectedProjectId(null);
    setSelectedSkillId(null);
    setSortBy('recent');
    setFilter('all');
    setSearchTerm('');
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

        {/* ✅ Barre de recherche */}
        <div className="mb-6">
          <SearchBar
            placeholder={t('media.search')}
            onSearch={setSearchTerm}
            className="max-w-xl mx-auto"
          />
        </div>

        {/* Filtres par type */}
        <div className="flex justify-center gap-3 mb-6">
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

        {/* ✅ Options de tri avancées */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t('media.sortOptions')}
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Tri chronologique */}
            <button
              onClick={() => { setSortBy('recent'); setSelectedProjectId(null); setSelectedSkillId(null); }}
              className={`p-3 rounded-lg border-2 transition-all ${
                sortBy === 'recent' && !selectedProjectId && !selectedSkillId
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <div className="text-sm font-medium">{t('media.sortRecent')}</div>
            </button>

            <button
              onClick={() => { setSortBy('oldest'); setSelectedProjectId(null); setSelectedSkillId(null); }}
              className={`p-3 rounded-lg border-2 transition-all ${
                sortBy === 'oldest' && !selectedProjectId && !selectedSkillId
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <div className="text-sm font-medium">{t('media.sortOldest')}</div>
            </button>

            <button
              onClick={() => { setSortBy('alpha'); setSelectedProjectId(null); setSelectedSkillId(null); }}
              className={`p-3 rounded-lg border-2 transition-all ${
                sortBy === 'alpha' && !selectedProjectId && !selectedSkillId
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <div className="text-sm font-medium">{t('media.sortAlpha')}</div>
            </button>

            {/* Bouton Reset */}
            <button
              onClick={resetFilters}
              className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <div className="text-sm font-medium text-red-600">{t('media.reset')}</div>
            </button>
          </div>

          {/* ✅ Tri par projet */}
          <div className="mt-4">
            <button
              onClick={() => setShowProjectList(!showProjectList)}
              className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-all flex items-center justify-between"
            >
              <span className="font-medium">
                {selectedProjectId 
                  ? `📁 ${projects.find(p => p.id === selectedProjectId)?.title}`
                  : t('media.sortByProject')}
              </span>
              <span className="text-xl">{showProjectList ? '▲' : '▼'}</span>
            </button>
            
            {showProjectList && (
              <div className="mt-2 max-h-60 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className="w-full p-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Tri par compétence */}
          <div className="mt-4">
            <button
              onClick={() => setShowSkillList(!showSkillList)}
              className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-all flex items-center justify-between"
            >
              <span className="font-medium">
                {selectedSkillId 
                  ? `🛠️ ${skills.find(s => s.id === selectedSkillId)?.name}`
                  : t('media.sortBySkill')}
              </span>
              <span className="text-xl">{showSkillList ? '▲' : '▼'}</span>
            </button>
            
            {showSkillList && (
              <div className="mt-2 max-h-60 overflow-y-auto border-2 border-gray-200 dark:border-gray-700 rounded-lg">
                {skills.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillSelect(skill.id)}
                    className="w-full p-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    {skill.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grille de médias */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('media.noMedia')}
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
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-gray-900/90 text-xs font-medium flex items-center gap-1">
                      {item.type === 'image' ? (
                        <><Image className="w-3 h-3" /> Image</>
                      ) : (
                        <><Video className="w-3 h-3" /> Vidéo</>
                      )}
                    </span>
                  </div>
                  {(item.projectTitle || item.skillName) && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="px-3 py-1 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm inline-block">
                        {item.projectTitle ? `📁 ${item.projectTitle}` : `🛠️ ${item.skillName}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{item.title || item.originalName || 'Média'}</h3>
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