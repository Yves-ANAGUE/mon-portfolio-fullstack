import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import projectsService from '../../services/projects.service';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const ProjectsManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web',
    url: '',
    github: '',
    technologies: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsService.getAll();
      setProjects(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        description: project.description || '',
        category: project.category || 'web',
        url: project.url || '',
        github: project.github || '',
        technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
        date: project.date || new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        category: 'web',
        url: '',
        github: '',
        technologies: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('url', formData.url);
      data.append('github', formData.github);
      data.append('date', formData.date);
      
      // Parser les technologies correctement
      const techArray = formData.technologies
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      data.append('technologies', JSON.stringify(techArray));

      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingProject) {
        await projectsService.update(editingProject.id, data);
        toast.success('Projet mis à jour !');
      } else {
        await projectsService.create(data);
        toast.success('Projet créé !');
      }

      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      await projectsService.delete(id);
      toast.success('Projet supprimé !');
      fetchProjects();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestion des Projets</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau projet
        </button>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.id} className="card p-4 flex items-center gap-4">
            {project.image && (
              <img src={project.image} alt={project.title} className="w-20 h-20 object-cover rounded" />
            )}
            <div className="flex-1">
              <h3 className="font-bold">{project.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{project.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpenModal(project)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => handleDelete(project.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingProject ? 'Modifier' : 'Nouveau'} Projet</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <input type="text" placeholder="Titre" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input" required />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="textarea" rows={4} required />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input">
                <option value="web">Web</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
                <option value="api">API</option>
              </select>
              <input type="url" placeholder="URL du projet" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="input" />
              <input type="url" placeholder="GitHub" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} className="input" />
              <input type="text" placeholder="Technologies (séparées par des virgules)" value={formData.technologies} onChange={(e) => setFormData({...formData, technologies: e.target.value})} className="input" />
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="input" />
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input" />
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

export default ProjectsManager;
