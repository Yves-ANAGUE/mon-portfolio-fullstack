import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, ExternalLink } from 'lucide-react';
import linksService from '../../services/links.service';
import toast from 'react-hot-toast';

const LinksManager = () => {
  const [links, setLinks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', url: '', category: 'other', icon: 'link' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
    try {
      const res = await linksService.getAll();
      setLinks(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    }
  };

  const handleOpen = (link = null) => {
    setEditing(link);
    setFormData(link ? { title: link.title || '', url: link.url || '', category: link.category || 'other', icon: link.icon || 'link' } : { title: '', url: '', category: 'other', icon: 'link' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await linksService.update(editing.id, formData);
        toast.success('Mis à jour !');
      } else {
        await linksService.create(formData);
        toast.success('Créé !');
      }
      setIsModalOpen(false);
      fetchLinks();
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await linksService.delete(id);
      toast.success('Supprimé !');
      fetchLinks();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Liens</h2>
        <button onClick={() => handleOpen()} className="btn btn-primary"><Plus className="w-5 h-5 mr-2" />Nouveau lien</button>
      </div>
      <div className="grid gap-4">
        {links.map((link) => (
          <div key={link.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-primary-600" />
              <div>
                <h3 className="font-bold">{link.title}</h3>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">{link.url}</a>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpen(link)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Edit className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(link.id)} className="p-2 hover:bg-red-100 text-red-600 rounded"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full">
            <div className="border-b p-4 flex justify-between"><h3 className="text-xl font-bold">Lien</h3><button onClick={() => setIsModalOpen(false)}><X /></button></div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <input type="text" placeholder="Titre" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="input" required />
              <input type="url" placeholder="URL" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="input" required />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="input">
                <option value="github">GitHub</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter</option>
                <option value="portfolio">Portfolio</option>
                <option value="other">Autre</option>
              </select>
              <button type="submit" disabled={submitting} className="btn btn-primary w-full"><Save className="w-5 h-5 mr-2" />{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinksManager;
