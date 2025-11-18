import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/firebase.js';

// ✅ Connexion admin
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Récupérer l'admin depuis Firebase
    const adminRef = db.ref('admin');
    const snapshot = await adminRef.once('value');
    const adminData = snapshot.val();

    // Si pas d'admin, créer l'admin par défaut
    if (!adminData) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123456!', 10);
      await adminRef.set({
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      
      // Recharger les données
      const newSnapshot = await adminRef.once('value');
      const newAdminData = newSnapshot.val();
      
      if (email !== newAdminData.email) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      const isValidPassword = await bcrypt.compare(password, newAdminData.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }

      const token = jwt.sign(
        { email: newAdminData.email, role: newAdminData.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          email: newAdminData.email,
          role: newAdminData.role
        }
      });
    }

    // Vérifier l'email
    if (email !== adminData.email) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, adminData.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { email: adminData.email, role: adminData.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        email: adminData.email,
        role: adminData.role
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
};

// ✅ Vérifier le token
export const verifyToken = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// ✅ Changer le mot de passe
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mots de passe requis'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères'
      });
    }

    const adminRef = db.ref('admin');
    const snapshot = await adminRef.once('value');
    const adminData = snapshot.val();

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, adminData.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await adminRef.update({
      password: hashedPassword,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de mot de passe'
    });
  }
};

// ✅ Changer l'email d'administration
export const changeEmail = async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;

    if (!currentPassword || !newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe et nouvel email requis'
      });
    }

    const adminRef = db.ref('admin');
    const snapshot = await adminRef.once('value');
    const adminData = snapshot.val();

    // Vérifier le mot de passe actuel
    const isValidPassword = await bcrypt.compare(currentPassword, adminData.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }

    // Mettre à jour l'email
    await adminRef.update({
      email: newEmail,
      updatedAt: new Date().toISOString()
    });

    // Générer un nouveau token avec le nouvel email
    const token = jwt.sign(
      { email: newEmail, role: adminData.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Email modifié avec succès',
      token,
      user: {
        email: newEmail,
        role: adminData.role
      }
    });
  } catch (error) {
    console.error('Erreur changement email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de l’email'
    });
  }
};
