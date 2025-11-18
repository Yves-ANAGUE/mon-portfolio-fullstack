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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

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
    } else {
      setEditingSkill(null);
      setFormData({ name: '', level: 50, category: 'frontend', description: '' });
    }
    setIconFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (iconFile) data.append('image', iconFile);

      if (editingSkill) {
        await skillsService.update(editingSkill.id, data);
        toast.success('Compétence mise à jour !');
      } else {
        await skillsService.create(data);
        toast.success('Compétence créée !');
      }

      setIsModalOpen(false);
      fetchSkills();
    } catch (error) {
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
        {skills.map((skill) => (
          <div key={skill.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              {skill.icon && <img src={skill.icon} alt={skill.name} className="w-10 h-10 object-contain" />}
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(skill)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(skill.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold">{skill.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Niveau: {skill.level}%</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full">
            <div className="border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingSkill ? 'Modifier' : 'Nouvelle'} Compétence</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <input type="text" placeholder="Nom" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required />
              <input type="number" min="0" max="100" placeholder="Niveau (%)" value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="input" />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input">
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Base de données</option>
                <option value="devops">DevOps</option>
                <option value="tools">Outils</option>
              </select>
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="textarea" rows={3} />
              <input type="file" accept="image/*" onChange={(e) => setIconFile(e.target.files[0])} className="input" />
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
