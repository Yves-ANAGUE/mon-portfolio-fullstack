// backend/src/controllers/experiences.controller.js
import { db } from '../config/firebase.js';

export const getAllExperiences = async (req, res) => {
  try {
    const experiencesRef = db.ref('experiences');
    const snapshot = await experiencesRef.once('value');
    const experiences = snapshot.val();

    if (!experiences) {
      return res.json({ success: true, data: [] });
    }

    const experiencesArray = Object.keys(experiences).map(key => ({
      id: key,
      ...experiences[key]
    })).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    res.json({ success: true, data: experiencesArray });
  } catch (error) {
    console.error('Erreur récupération expériences:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const createExperience = async (req, res) => {
  try {
    const { position, positionEn, company, location, locationEn, startDate, endDate, current, description, descriptionEn, technologies } = req.body;

    if (!position || !company || !startDate) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }

    const experienceData = {
      position,
      positionEn: positionEn || position,
      company,
      location: location || '',
      locationEn: locationEn || location || '',
      startDate,
      endDate: current ? null : endDate,
      current: current || false,
      description: description || '',
      descriptionEn: descriptionEn || description || '',
      technologies: technologies || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const experiencesRef = db.ref('experiences');
    const newExperienceRef = experiencesRef.push();
    await newExperienceRef.set(experienceData);

    res.status(201).json({
      success: true,
      message: 'Expérience créée',
      data: { id: newExperienceRef.key, ...experienceData }
    });
  } catch (error) {
    console.error('Erreur création expérience:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const experienceRef = db.ref(`experiences/${id}`);
    const snapshot = await experienceRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Expérience non trouvée' });
    }

    const existingData = snapshot.val();
    const updatedExperience = { ...existingData, ...updateData };
    await experienceRef.set(updatedExperience);

    res.json({
      success: true,
      message: 'Expérience mise à jour',
      data: { id, ...updatedExperience }
    });
  } catch (error) {
    console.error('Erreur mise à jour expérience:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const experienceRef = db.ref(`experiences/${id}`);
    const snapshot = await experienceRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Expérience non trouvée' });
    }

    await experienceRef.remove();
    res.json({ success: true, message: 'Expérience supprimée' });
  } catch (error) {
    console.error('Erreur suppression expérience:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};