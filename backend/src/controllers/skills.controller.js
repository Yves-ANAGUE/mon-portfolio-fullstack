import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

export const getAllSkills = async (req, res) => {
  try {
    const skillsRef = db.ref('skills');
    const snapshot = await skillsRef.once('value');
    const skills = snapshot.val();

    if (!skills) {
      return res.json({
        success: true,
        data: []
      });
    }

    const skillsArray = Object.keys(skills).map(key => ({
      id: key,
      ...skills[key]
    }));

    res.json({
      success: true,
      data: skillsArray
    });
  } catch (error) {
    console.error('Erreur récupération compétences:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des compétences'
    });
  }
};

export const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const skillRef = db.ref(`skills/${id}`);
    const snapshot = await skillRef.once('value');
    const skill = snapshot.val();

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Compétence non trouvée'
      });
    }

    res.json({
      success: true,
      data: { id, ...skill }
    });
  } catch (error) {
    console.error('Erreur récupération compétence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la compétence'
    });
  }
};

export const createSkill = async (req, res) => {
  try {
    const skillData = { ...req.body };
    
    // Upload icône si présente
    if (req.files && req.files.image) {
      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/skills');
      skillData.icon = result.secure_url;
      skillData.iconPublicId = result.public_id;
    }

    // Convertir level en nombre
    if (skillData.level) {
      skillData.level = Number(skillData.level);
    }

    skillData.createdAt = new Date().toISOString();
    skillData.updatedAt = new Date().toISOString();

    const skillsRef = db.ref('skills');
    const newSkillRef = skillsRef.push();
    await newSkillRef.set(skillData);

    res.status(201).json({
      success: true,
      message: 'Compétence créée avec succès',
      data: {
        id: newSkillRef.key,
        ...skillData
      }
    });
  } catch (error) {
    console.error('Erreur création compétence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la compétence'
    });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skillData = req.body;

    const skillRef = db.ref(`skills/${id}`);
    const snapshot = await skillRef.once('value');
    const existingSkill = snapshot.val();

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: 'Compétence non trouvée'
      });
    }

    // Upload nouvelle icône si présente
    if (req.files && req.files.image) {
      // Supprimer l'ancienne icône
      if (existingSkill.iconPublicId) {
        await deleteFromCloudinary(existingSkill.iconPublicId);
      }
      
      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/skills');
      skillData.icon = result.secure_url;
      skillData.iconPublicId = result.public_id;
    }

    skillData.updatedAt = new Date().toISOString();

    const updatedSkill = {
      ...existingSkill,
      ...skillData
    };

    await skillRef.set(updatedSkill);

    res.json({
      success: true,
      message: 'Compétence mise à jour avec succès',
      data: {
        id,
        ...updatedSkill
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour compétence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la compétence'
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skillRef = db.ref(`skills/${id}`);
    const snapshot = await skillRef.once('value');
    const skill = snapshot.val();

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Compétence non trouvée'
      });
    }

    // Supprimer l'icône de Cloudinary
    if (skill.iconPublicId) {
      await deleteFromCloudinary(skill.iconPublicId);
    }

    await skillRef.remove();

    res.json({
      success: true,
      message: 'Compétence supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression compétence:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la compétence'
    });
  }
};
