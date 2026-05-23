// frontend/src/components/admin/SkillsManager.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import skillsService from '../../services/skills.service';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const SkillsManager = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 50,
    category: 'frontend',
    description: ''
  });
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillsService.getAll();
      setSkills(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (skill = null) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name || '',
        level: skill.level || 50,
        category: skill.category || 'frontend',
        description: skill.description || ''
      });
      // ✅ Afficher l'icône existante
      setIconPreview(skill.icon || skill.coverImage || null);
    } else {
      setEditingSkill(null);
      setFormData({ name: '', level: 50, category: 'frontend', description: '' });
      setIconPreview(null);
    }
    setIconFile(null);
    setIsModalOpen(true);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      // ✅ Preview immédiat
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('level', formData.level);
      data.append('category', formData.category);
      data.append('description', formData.description);

      if (iconFile) {
        // ✅ Envoyer sous le champ "image"
        data.append('image', iconFile);
      }

      let response;
      if (editingSkill) {
        response = await skillsService.update(editingSkill.id, data);
        toast.success('✅ Compétence mise à jour !');
      } else {
        response = await skillsService.create(data);
        toast.success('✅ Compétence créée !');
      }

      setIsModalOpen(false);
      setIconFile(null);
      setIconPreview(null);
      // ✅ Recharger pour afficher la nouvelle image
      fetchSkills();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette compétence ?')) return;
    try {
      await skillsService.delete(id);
      toast.success('Compétence supprimée !');
      fetchSkills();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Compétences</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle compétence
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => {
          const imgSrc = skill.icon || skill.coverImage;
          return (
            <div key={skill.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={skill.name}
                    className="w-12 h-12 object-contain rounded"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                )}
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(skill)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(skill.id)} className="p-1 hover:bg-red-100 text-red-600 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold">{skill.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {skill.category} • Niveau: {skill.level}%
              </p>
              {skill.level !== undefined && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-primary-600 h-1.5 rounded-full"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {skills.length === 0 && (
          <div className="col-span-full text-center py-12 card">
            <p className="text-gray-600 dark:text-gray-400">Aucune compétence pour le moment</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold">{editingSkill ? 'Modifier' : 'Nouvelle'} Compétence</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <input
                type="text"
                placeholder="Nom de la compétence *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />

              <div>
                <label className="block text-sm font-medium mb-1">Niveau: {formData.level}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Base de données</option>
                <option value="devops">DevOps</option>
                <option value="tools">Outils</option>
                <option value="soft-skills">Soft Skills</option>
                <option value="other">Autre</option>
              </select>

              <textarea
                placeholder="Description (optionnel)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="textarea"
                rows={3}
              />

              {/* ✅ Upload icône avec preview */}
              <div>
                <label className="block text-sm font-medium mb-2">Icône / Logo</label>
                {iconPreview && (
                  <div className="mb-3 relative inline-block">
                    <img
                      src={iconPreview}
                      alt="Preview"
                      className="w-20 h-20 object-contain rounded-lg border-2 border-primary-300 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => { setIconFile(null); setIconPreview(null); }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  className="input"
                />
                {iconFile && (
                  <p className="text-xs text-green-600 mt-1">✅ Nouveau fichier: {iconFile.name}</p>
                )}
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                <Save className="w-5 h-5 mr-2" />
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsManager;
