// backend/src/controllers/languages.controller.js
import { db } from '../config/firebase.js';

export const getAllLanguages = async (req, res) => {
  try {
    const languagesRef = db.ref('languages');
    const snapshot = await languagesRef.once('value');
    const languages = snapshot.val();

    if (!languages) {
      return res.json({ success: true, data: [] });
    }

    const languagesArray = Object.keys(languages).map(key => ({
      id: key,
      ...languages[key]
    }));

    res.json({ success: true, data: languagesArray });
  } catch (error) {
    console.error('Erreur récupération langues:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const createLanguage = async (req, res) => {
  try {
    const { name, nameEn, level, levelEn } = req.body;

    if (!name || !level) {
      return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }

    const languageData = {
      name,
      nameEn: nameEn || name,
      level,
      levelEn: levelEn || level,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const languagesRef = db.ref('languages');
    const newLanguageRef = languagesRef.push();
    await newLanguageRef.set(languageData);

    res.status(201).json({
      success: true,
      message: 'Langue créée',
      data: { id: newLanguageRef.key, ...languageData }
    });
  } catch (error) {
    console.error('Erreur création langue:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const languageRef = db.ref(`languages/${id}`);
    const snapshot = await languageRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Langue non trouvée' });
    }

    const existingData = snapshot.val();
    const updatedLanguage = { ...existingData, ...updateData };
    await languageRef.set(updatedLanguage);

    res.json({
      success: true,
      message: 'Langue mise à jour',
      data: { id, ...updatedLanguage }
    });
  } catch (error) {
    console.error('Erreur mise à jour langue:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const languageRef = db.ref(`languages/${id}`);
    const snapshot = await languageRef.once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ success: false, message: 'Langue non trouvée' });
    }

    await languageRef.remove();
    res.json({ success: true, message: 'Langue supprimée' });
  } catch (error) {
    console.error('Erreur suppression langue:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};