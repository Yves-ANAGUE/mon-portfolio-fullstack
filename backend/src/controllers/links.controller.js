import { db } from '../config/firebase.js';

export const getAllLinks = async (req, res) => {
  try {
    const linksRef = db.ref('links');
    const snapshot = await linksRef.once('value');
    const links = snapshot.val();

    if (!links) {
      return res.json({
        success: true,
        data: []
      });
    }

    const linksArray = Object.keys(links).map(key => ({
      id: key,
      ...links[key]
    }));

    res.json({
      success: true,
      data: linksArray
    });
  } catch (error) {
    console.error('Erreur récupération liens:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des liens'
    });
  }
};

export const getLinkById = async (req, res) => {
  try {
    const { id } = req.params;
    const linkRef = db.ref(`links/${id}`);
    const snapshot = await linkRef.once('value');
    const link = snapshot.val();

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Lien non trouvé'
      });
    }

    res.json({
      success: true,
      data: { id, ...link }
    });
  } catch (error) {
    console.error('Erreur récupération lien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du lien'
    });
  }
};

export const createLink = async (req, res) => {
  try {
    const { title, url, category, icon } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Titre et URL requis'
      });
    }

    const linkData = {
      title,
      url,
      category: category || 'other',
      icon: icon || 'link',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const linksRef = db.ref('links');
    const newLinkRef = linksRef.push();
    await newLinkRef.set(linkData);

    res.status(201).json({
      success: true,
      message: 'Lien créé avec succès',
      data: {
        id: newLinkRef.key,
        ...linkData
      }
    });
  } catch (error) {
    console.error('Erreur création lien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du lien'
    });
  }
};

export const updateLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, category, icon } = req.body;

    const linkRef = db.ref(`links/${id}`);
    const snapshot = await linkRef.once('value');
    const existingLink = snapshot.val();

    if (!existingLink) {
      return res.status(404).json({
        success: false,
        message: 'Lien non trouvé'
      });
    }

    const updatedLink = {
      ...existingLink,
      title: title || existingLink.title,
      url: url || existingLink.url,
      category: category || existingLink.category,
      icon: icon || existingLink.icon,
      updatedAt: new Date().toISOString()
    };

    await linkRef.set(updatedLink);

    res.json({
      success: true,
      message: 'Lien mis à jour avec succès',
      data: {
        id,
        ...updatedLink
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour lien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du lien'
    });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;

    const linkRef = db.ref(`links/${id}`);
    const snapshot = await linkRef.once('value');
    const link = snapshot.val();

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Lien non trouvé'
      });
    }

    await linkRef.remove();

    res.json({
      success: true,
      message: 'Lien supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression lien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du lien'
    });
  }
};
