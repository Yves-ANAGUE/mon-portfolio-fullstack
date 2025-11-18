// frontend/src/components/admin/LanguagesManager.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Globe } from 'lucide-react';
import languagesService from '../../services/languages.service';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LanguagesManager = () => {
  const [languages, setLanguages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    level: '',
    levelEn: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const levels = [
    { value: 'Langue maternelle', valueEn: 'Native' },
    { value: 'Courant', valueEn: 'Fluent' },
    { value: 'Avancé', valueEn: 'Advanced' },
    { value: 'Intermédiaire', valueEn: 'Intermediate' },
    { value: 'Débutant', valueEn: 'Beginner' }
  ];

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const res = await languagesService.getAll();
      setLanguages(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    }
  };

  const handleOpen = (lang = null) => {
    setEditing(lang);
    if (lang) {
      setFormData({
        name: lang.name || '',
        nameEn: lang.nameEn || '',
        level: lang.level || '',
        levelEn: lang.levelEn || ''
      });
    } else {
      setFormData({
        name: '',
        nameEn: '',
        level: '',
        levelEn: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        await languagesService.update(editing.id, formData);
        toast.success('✅ Langue mise à jour !');
      } else {
        await languagesService.create(formData);
        toast.success('✅ Langue créée !');
      }

      setIsModalOpen(false);
      fetchLanguages();
    } catch (error) {
      toast.error('❌ Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette langue ?')) return;
    try {
      await languagesService.delete(id);
      toast.success('✅ Supprimée !');
      fetchLanguages();
    } catch (error) {
      toast.error('❌ Erreur');
    }
  };

  const getLevelColor = (level) => {
    if (level.includes('maternelle') || level.includes('Native')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (level.includes('Courant') || level.includes('Fluent')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (level.includes('Avancé') || level.includes('Advanced')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    if (level.includes('Intermédiaire') || level.includes('Intermediate')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary-600" />
            Langues Parlées
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {languages.length} langue(s)
          </p>
        </div>
        <button onClick={() => handleOpen()} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle langue
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <motion.div
            key={lang.id}
            whileHover={{ scale: 1.03, y: -5 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{lang.name}</h3>
                  <span className={`inline-block px-3 py-1 text-xs rounded-full ${getLevelColor(lang.level)}`}>
                    {lang.level}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-1">
                <button onClick={() => handleOpen(lang)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(lang.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {languages.length === 0 && (
          <div className="col-span-full text-center py-12 card">
            <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucune langue pour le moment
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-lg w-full"
          >
            <div className="border-b p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {editing ? 'Modifier' : 'Nouvelle'} Langue
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Langue (FR) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                    required
                    placeholder="Français"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Langue (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    className="input"
                    placeholder="French"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Niveau (FR) *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => {
                      const selectedLevel = levels.find(l => l.value === e.target.value);
                      setFormData({
                        ...formData, 
                        level: e.target.value,
                        levelEn: selectedLevel?.valueEn || ''
                      });
                    }}
                    className="input"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Niveau (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.levelEn}
                    onChange={(e) => setFormData({...formData, levelEn: e.target.value})}
                    className="input"
                    placeholder="Native"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {submitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LanguagesManager;