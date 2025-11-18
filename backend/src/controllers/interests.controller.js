// backend/src/controllers/interests.controller.js
import { db } from '../config/firebase.js';

export const getAllInterests = async (req, res) => {
  try {
    const interestsRef = db.ref('interests');
    const snapshot = await interestsRef.once('value');
    const interests = snapshot.val();

    if (!interests) {
      return res.json({ success: true, data: [] });
    }

    const interestsArray = Object.keys(interests).map(key => ({
      id: key,
      ...interests[key]
    }));

    res.json({ success: true, data: interestsArray });
  } catch (error) {
    console.error('Erreur récupération centres d\'intérêt:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const createInterest = async (req, res) => {
  try {
    const { name, nameEn, icon } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nom requis' });
    }

    const interestData = {
      name,
      nameEn: nameEn || name,
      icon: icon || '🎨',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const interestsRef = db.ref('interests');
    const newInterestRef = interestsRef.push();
    await newInterestRef.set(interestData);

    res.status(201).json({
      success: true,
      message: 'Centre d\'intérêt créé',
      data: { id: newInterestRef.key, ...interestData }
    });
  } catch (error) {
    console.error('Erreur création centre d\'intérêt:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const interestRef = db.ref(`interests/${id}`);
    const snapshot = await interestRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Centre d\'intérêt non trouvé' });
    }

    const existingData = snapshot.val();
    const updatedInterest = { ...existingData, ...updateData };
    await interestRef.set(updatedInterest);

    res.json({
      success: true,
      message: 'Centre d\'intérêt mis à jour',
      data: { id, ...updatedInterest }
    });
  } catch (error) {
    console.error('Erreur mise à jour centre d\'intérêt:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const interestRef = db.ref(`interests/${id}`);
    const snapshot = await interestRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Centre d\'intérêt non trouvé' });
    }

    await interestRef.remove();
    res.json({ success: true, message: 'Centre d\'intérêt supprimé' });
  } catch (error) {
    console.error('Erreur suppression centre d\'intérêt:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};