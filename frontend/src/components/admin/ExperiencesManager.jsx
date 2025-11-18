// frontend/src/components/admin/ExperiencesManager.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, Briefcase, MapPin, Calendar } from 'lucide-react';
import experiencesService from '../../services/experiences.service';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ExperiencesManager = () => {
  const [experiences, setExperiences] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    position: '',
    positionEn: '',
    company: '',
    location: '',
    locationEn: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    descriptionEn: '',
    technologies: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await experiencesService.getAll();
      setExperiences(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    }
  };

  const handleOpen = (exp = null) => {
    setEditing(exp);
    if (exp) {
      setFormData({
        position: exp.position || '',
        positionEn: exp.positionEn || '',
        company: exp.company || '',
        location: exp.location || '',
        locationEn: exp.locationEn || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: exp.current || false,
        description: exp.description || '',
        descriptionEn: exp.descriptionEn || '',
        technologies: Array.isArray(exp.technologies) ? exp.technologies.join(', ') : ''
      });
    } else {
      setFormData({
        position: '',
        positionEn: '',
        company: '',
        location: '',
        locationEn: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        descriptionEn: '',
        technologies: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        technologies: formData.technologies ? formData.technologies.split(',').map(t => t.trim()) : []
      };

      if (editing) {
        await experiencesService.update(editing.id, data);
        toast.success('✅ Expérience mise à jour !');
      } else {
        await experiencesService.create(data);
        toast.success('✅ Expérience créée !');
      }

      setIsModalOpen(false);
      fetchExperiences();
    } catch (error) {
      toast.error('❌ Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette expérience ?')) return;
    try {
      await experiencesService.delete(id);
      toast.success('✅ Supprimée !');
      fetchExperiences();
    } catch (error) {
      toast.error('❌ Erreur');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-600" />
            Expériences Professionnelles
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {experiences.length} expérience(s)
          </p>
        </div>
        <button onClick={() => handleOpen()} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle expérience
        </button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp) => (
          <motion.div
            key={exp.id}
            whileHover={{ scale: 1.01 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{exp.position}</h3>
                    <p className="text-primary-600 font-semibold">{exp.company}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {exp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {exp.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)}
                      </span>
                    </div>

                    {exp.description && (
                      <p className="mt-3 text-gray-700 dark:text-gray-300">
                        {exp.description}
                      </p>
                    )}

                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {exp.technologies.map((tech, i) => (
                          <span key={i} className="px-3 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => handleOpen(exp)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(exp.id)} className="p-2 hover:bg-red-100 text-red-600 rounded">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {experiences.length === 0 && (
          <div className="text-center py-12 card">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucune expérience pour le moment
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-3xl w-full my-8"
          >
            

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Français / Anglais */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  
                  
                  
                  
                  
                  <label className="block text-sm font-medium mb-2">
                    Poste (FR) *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="input"
                    required
                    placeholder="Développeur Full Stack"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Poste (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.positionEn}
                    onChange={(e) => setFormData({...formData, positionEn: e.target.value})}
                    className="input"
                    placeholder="Full Stack Developer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Entreprise *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="input"
                  required
                  placeholder="Tech Company Inc."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lieu (FR)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="input"
                    placeholder="Paris, France"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Lieu (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.locationEn}
                    onChange={(e) => setFormData({...formData, locationEn: e.target.value})}
                    className="input"
                    placeholder="Paris, France"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input"
                    disabled={formData.current}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="current"
                  checked={formData.current}
                  onChange={(e) => setFormData({...formData, current: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="current" className="text-sm font-medium">
                  Poste actuel
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description (FR)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="textarea"
                    rows={4}
                    placeholder="Décrivez vos missions et réalisations..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description (EN)
                  </label>
                  <textarea
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({...formData, descriptionEn: e.target.value})}
                    className="textarea"
                    rows={4}
                    placeholder="Describe your missions and achievements..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Technologies utilisées
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                  className="input"
                  placeholder="React, Node.js, MongoDB, Docker (séparées par des virgules)"
                />
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

export default ExperiencesManager;