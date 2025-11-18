import { sendContactEmail } from '../services/email.service.js';
import { db } from '../config/firebase.js';

export const sendContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Envoyer l'email
    await sendContactEmail({ name, email, subject, message });

    // Sauvegarder le message dans Firebase
    const contactData = {
      name,
      email,
      subject,
      message,
      status: 'sent',
      createdAt: new Date().toISOString()
    };

    const contactsRef = db.ref('contacts');
    const newContactRef = contactsRef.push();
    await newContactRef.set(contactData);

    res.json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contactsRef = db.ref('contacts');
    const snapshot = await contactsRef.once('value');
    const contacts = snapshot.val();

    if (!contacts) {
      return res.json({
        success: true,
        data: []
      });
    }

    const contactsArray = Object.keys(contacts).map(key => ({
      id: key,
      ...contacts[key]
    }));

    // Trier par date décroissante
    contactsArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: contactsArray
    });
  } catch (error) {
    console.error('Erreur récupération contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contacts'
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contactRef = db.ref(`contacts/${id}`);
    const snapshot = await contactRef.once('value');
    const contact = snapshot.val();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact non trouvé'
      });
    }

    await contactRef.remove();

    res.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression contact:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du contact'
    });
  }
};
