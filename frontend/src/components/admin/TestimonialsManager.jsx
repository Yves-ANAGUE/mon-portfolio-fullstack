import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import testimonialsService from '../../services/testimonials.service';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const TestimonialsManager = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', position: '', company: '', message: '', rating: 5 });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await testimonialsService.getAll();
      setItems(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item = null) => {
    setEditing(item);
    setFormData(item ? { name: item.name || '', position: item.position || '', company: item.company || '', message: item.message || '', rating: item.rating || 5 } : { name: '', position: '', company: '', message: '', rating: 5 });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(k => data.append(k, formData[k]));
      if (imageFile) data.append('image', imageFile);
      if (editing) {
        await testimonialsService.update(editing.id, data);
        toast.success('Mis à jour !');
      } else {
        await testimonialsService.create(data);
        toast.success('Créé !');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await testimonialsService.delete(id);
      toast.success('Supprimé !');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Témoignages</h2>
        <button onClick={() => handleOpen()} className="btn btn-primary"><Plus className="w-5 h-5 mr-2" />Nouveau</button>
      </div>
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="card p-4 flex gap-4">
            {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-full object-cover" />}
            <div className="flex-1">
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.position}</p>
              <p className="text-sm line-clamp-2">{item.message}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpen(item)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Edit className="w-5 h-5" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 text-red-600 rounded"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full">
            <div className="border-b p-4 flex justify-between"><h3 className="text-xl font-bold">Témoignage</h3><button onClick={() => setIsModalOpen(false)}><X /></button></div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <input type="text" placeholder="Nom" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="input" required />
              <input type="text" placeholder="Poste" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="input" />
              <input type="text" placeholder="Entreprise" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="input" />
              <textarea placeholder="Message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="textarea" rows={4} required />
              <input type="number" min="1" max="5" placeholder="Note" value={formData.rating} onChange={(e) => setFormData({...formData, rating: e.target.value})} className="input" />
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="input" />
              <button type="submit" disabled={submitting} className="btn btn-primary w-full"><Save className="w-5 h-5 mr-2" />{submitting ? 'Enregistrement...' : 'Enregistrer'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
