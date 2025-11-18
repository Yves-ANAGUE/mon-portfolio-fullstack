// frontend/src/components/admin/FormationsManager.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save, GraduationCap, MapPin, Calendar, Award } from 'lucide-react';
import formationsService from '../../services/formations.service';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const FormationsManager = () => {
  const [formations, setFormations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    diploma: '',
    diplomaEn: '',
    school: '',
    schoolEn: '',
    location: '',
    locationEn: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    descriptionEn: '',
    grade: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      const res = await formationsService.getAll();
      setFormations(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    }
  };

  const handleOpen = (formation = null) => {
    setEditing(formation);
    if (formation) {
      setFormData({
        diploma: formation.diploma || '',
        diplomaEn: formation.diplomaEn || '',
        school: formation.school || '',
        schoolEn: formation.schoolEn || '',
        location: formation.location || '',
        locationEn: formation.locationEn || '',
        startDate: formation.startDate || '',
        endDate: formation.endDate || '',
        current: formation.current || false,
        description: formation.description || '',
        descriptionEn: formation.descriptionEn || '',
        grade: formation.grade || ''
      });
    } else {
      setFormData({
        diploma: '',
        diplomaEn: '',
        school: '',
        schoolEn: '',
        location: '',
        locationEn: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        descriptionEn: '',
        grade: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        await formationsService.update(editing.id, formData);
        toast.success('✅ Formation mise à jour !');
      } else {
        await formationsService.create(formData);
        toast.success('✅ Formation créée !');
      }

      setIsModalOpen(false);
      fetchFormations();
    } catch (error) {
      toast.error('❌ Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette formation ?')) return;
    try {
      await formationsService.delete(id);
      toast.success('✅ Supprimée !');
      fetchFormations();
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
            <GraduationCap className="w-6 h-6 text-primary-600" />
            Formations & Diplômes
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formations.length} formation(s)
          </p>
        </div>
        <button onClick={() => handleOpen()} className="btn btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle formation
        </button>
      </div>

      <div className="space-y-4">
        {formations.map((formation) => (
          <motion.div
            key={formation.id}
            whileHover={{ scale: 1.01 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{formation.diploma}</h3>
                    <p className="text-purple-600 font-semibold">{formation.school}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {formation.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {formation.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(formation.startDate)} - {formation.current ? 'En cours' : formatDate(formation.endDate)}
                      </span>
                      {formation.grade && (
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {formation.grade}
                        </span>
                      )}
                    </div>

                    {formation.description && (
                      <p className="mt-3 text-gray-700 dark:text-gray-300">
                        {formation.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => handleOpen(formation)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(formation.id)} className="p-2 hover:bg-red-100 text-red-600 rounded">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {formations.length === 0 && (
          <div className="text-center py-12 card">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucune formation pour le moment
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
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Diplôme (FR) *
                  </label>
                  <input
                    type="text"
                    value={formData.diploma}
                    onChange={(e) => setFormData({...formData, diploma: e.target.value})}
                    className="input"
                    required
                    placeholder="Master en Informatique"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Diplôme (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.diplomaEn}
                    onChange={(e) => setFormData({...formData, diplomaEn: e.target.value})}
                    className="input"
                    placeholder="Master in Computer Science"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    École/Université (FR) *
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    className="input"
                    required
                    placeholder="Université de Paris"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    École/Université (EN)
                  </label>
                  <input
                    type="text"
                    value={formData.schoolEn}
                    onChange={(e) => setFormData({...formData, schoolEn: e.target.value})}
                    className="input"
                    placeholder="University of Paris"
                  />
                </div>
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

              <div className="grid md:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mention
                  </label>
                  <input
                    type="text"
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                    className="input"
                    placeholder="Mention Très Bien"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="current-formation"
                  checked={formData.current}
                  onChange={(e) => setFormData({...formData, current: e.target.checked})}
                  className="w-4 h-4"
                />
                <label htmlFor="current-formation" className="text-sm font-medium">
                  Formation en cours
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
                    placeholder="Matières principales, projets réalisés..."
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
                    placeholder="Main subjects, completed projects..."
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

export default FormationsManager;