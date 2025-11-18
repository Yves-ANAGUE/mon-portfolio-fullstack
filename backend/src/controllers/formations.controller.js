// backend/src/controllers/formations.controller.js
import { db } from '../config/firebase.js';

export const getAllFormations = async (req, res) => {
  try {
    const formationsRef = db.ref('formations');
    const snapshot = await formationsRef.once('value');
    const formations = snapshot.val();

    if (!formations) {
      return res.json({ success: true, data: [] });
    }

    const formationsArray = Object.keys(formations).map(key => ({
      id: key,
      ...formations[key]
    })).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    res.json({ success: true, data: formationsArray });
  } catch (error) {
    console.error('Erreur récupération formations:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const createFormation = async (req, res) => {
  try {
    const { diploma, diplomaEn, school, schoolEn, location, locationEn, startDate, endDate, current, description, descriptionEn, grade } = req.body;

    if (!diploma || !school || !startDate) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }

    const formationData = {
      diploma,
      diplomaEn: diplomaEn || diploma,
      school,
      schoolEn: schoolEn || school,
      location: location || '',
      locationEn: locationEn || location || '',
      startDate,
      endDate: current ? null : endDate,
      current: current || false,
      description: description || '',
      descriptionEn: descriptionEn || description || '',
      grade: grade || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const formationsRef = db.ref('formations');
    const newFormationRef = formationsRef.push();
    await newFormationRef.set(formationData);

    res.status(201).json({
      success: true,
      message: 'Formation créée',
      data: { id: newFormationRef.key, ...formationData }
    });
  } catch (error) {
    console.error('Erreur création formation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const formationRef = db.ref(`formations/${id}`);
    const snapshot = await formationRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Formation non trouvée' });
    }

    const existingData = snapshot.val();
    const updatedFormation = { ...existingData, ...updateData };
    await formationRef.set(updatedFormation);

    res.json({
      success: true,
      message: 'Formation mise à jour',
      data: { id, ...updatedFormation }
    });
  } catch (error) {
    console.error('Erreur mise à jour formation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteFormation = async (req, res) => {
  try {
    const { id } = req.params;
    const formationRef = db.ref(`formations/${id}`);
    const snapshot = await formationRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Formation non trouvée' });
    }

    await formationRef.remove();
    res.json({ success: true, message: 'Formation supprimée' });
  } catch (error) {
    console.error('Erreur suppression formation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};