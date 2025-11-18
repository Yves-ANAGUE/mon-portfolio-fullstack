// frontend/src/components/admin/InterestsManager.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Heart, Smile } from 'lucide-react';
import interestsService from '../../services/interests.service';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const InterestsManager = () => {
  const [interests, setInterests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    icon: '🎨'
  });
  const [submitting, setSubmitting] = useState(false);

  const popularIcons = ['🎨', '🎵', '📚', '🎬', '🏃', '🎮', '✈️', '📷', '🍳', '💻', '⚽', '🎯', '🎸', '🎭', '🌍'];

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const res = await interestsService.getAll();
      setInterests(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    }
  };

  const handleOpen = (interest = null) => {
    setEditing(interest);
    if (interest) {
      setFormData({
        name: interest.name || '',
        nameEn: interest.nameEn || '',
        icon: interest.icon || '🎨'
      });
    } else {
      setFormData({
        name: '',
        nameEn: '',
        icon: '🎨'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        await interestsService.update(editing.id, formData);
        toast.success('✅ Centre d\'intérêt mis à jour !');
      } else {
        await interestsService.create(formData);
        toast.success('✅ Centre d\'intérêt créé !');
      }

      setIsModalOpen(false);
      fetchInterests();
    } catch (error) {
      toast.error('❌ Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce centre d\'intérêt ?')) return;
    try {
      await interestsService.delete(id);
      toast.success('✅ Supprimé !');
      fetchInterests();
    } catch (error) {
      toast.error('❌ Erreur');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-600" />
            Centres d'Intérêt
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {interests.length} centre(s) d'intérêt
          </p>
        </div>
        <button onClick={() => handleOpen()} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau centre d'intérêt
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {interests.map((interest) => (
          <motion.div
            key={interest.id}
            whileHover={{ scale: 1.05, y: -5 }}
            className="card p-4 text-center"
          >
            <div className="text-4xl mb-3">{interest.icon}</div>
            <h3 className="font-semibold text-sm mb-3">{interest.name}</h3>
            <div className="flex justify-center gap-1">
              <button onClick={() => handleOpen(interest)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(interest.id)} className="p-1.5 hover:bg-red-100 text-red-600 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}

        {interests.length === 0 && (
          <div className="col-span-full text-center py-12 card">
            <Smile className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun centre d'intérêt pour le moment
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
                {editing ? 'Modifier' : 'Nouveau'} Centre d'Intérêt
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Icône
                </label>
                <div className="grid grid-cols-8 gap-2 mb-3">
                  {popularIcons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({...formData, icon})}
                      className={`text-3xl p-2 rounded-lg transition-all ${
                        formData.icon === icon 
                          ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-600' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                  className="input"
                  placeholder="Ou tapez un emoji"
                  maxLength={2}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom (FR) *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                    required
                    placeholder="Photographie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    className="input"
                    placeholder="Photography"
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

export default InterestsManager;