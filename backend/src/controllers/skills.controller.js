// backend/src/controllers/skills.controller.js
import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

export const getAllSkills = async (req, res) => {
  try {
    const snapshot = await db.ref('skills').once('value');
    const skills = snapshot.val();
    if (!skills) return res.json({ success: true, data: [] });
    const skillsArray = Object.keys(skills).map(key => ({ id: key, ...skills[key] }));
    res.json({ success: true, data: skillsArray });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération compétences' });
  }
};

export const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.ref(`skills/${id}`).once('value');
    const skill = snapshot.val();
    if (!skill) return res.status(404).json({ success: false, message: 'Compétence non trouvée' });
    res.json({ success: true, data: { id, ...skill } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération compétence' });
  }
};

export const createSkill = async (req, res) => {
  try {
    const skillData = { ...req.body };

    // ✅ Upload image (champ "image" ou "coverImage")
    const imageFile = (req.files && req.files.image && req.files.image[0]) ||
                      (req.files && req.files.coverImage && req.files.coverImage[0]);

    if (imageFile) {
      console.log('📸 Upload image compétence:', imageFile.originalname);
      const result = await uploadToCloudinary(imageFile, 'portfolio/skills/covers');
      skillData.icon = result.secure_url;
      skillData.coverImage = result.secure_url;
      skillData.coverImagePublicId = result.public_id;
      skillData.coverImageType = imageFile.mimetype.startsWith('video') ? 'video' : 'image';
      console.log('✅ Image compétence uploadée:', result.secure_url);
    }

    // ✅ Upload fichiers médias multiples
    if (req.files && req.files.mediaFiles && req.files.mediaFiles.length > 0) {
      const mediaUploads = await Promise.all(
        req.files.mediaFiles.map(file => uploadToCloudinary(file, 'portfolio/skills/media'))
      );
      const mediaObj = {};
      mediaUploads.forEach((result, index) => {
        const file = req.files.mediaFiles[index];
        mediaObj[`media_${index}`] = {
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype.startsWith('video') ? 'video' : 'image',
          mimeType: file.mimetype,
          originalName: file.originalname
        };
      });
      skillData.mediaFiles = mediaObj;
    }

    if (skillData.level) skillData.level = Number(skillData.level);

    skillData.createdAt = new Date().toISOString();
    skillData.updatedAt = new Date().toISOString();

    const skillsRef = db.ref('skills');
    const newSkillRef = skillsRef.push();
    await newSkillRef.set(skillData);

    console.log('✅ Compétence créée:', newSkillRef.key);
    res.status(201).json({
      success: true,
      message: 'Compétence créée avec succès',
      data: { id: newSkillRef.key, ...skillData }
    });
  } catch (error) {
    console.error('Erreur création compétence:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de la compétence' });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skillData = { ...req.body };

    const skillRef = db.ref(`skills/${id}`);
    const snapshot = await skillRef.once('value');
    const existingSkill = snapshot.val();

    if (!existingSkill) {
      return res.status(404).json({ success: false, message: 'Compétence non trouvée' });
    }

    // ✅ Upload nouvelle image
    const imageFile = (req.files && req.files.image && req.files.image[0]) ||
                      (req.files && req.files.coverImage && req.files.coverImage[0]);

    if (imageFile) {
      console.log('📸 Update image compétence:', imageFile.originalname);
      const oldPublicId = existingSkill.coverImagePublicId;
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId).catch(e => console.warn(e.message));
      }
      const result = await uploadToCloudinary(imageFile, 'portfolio/skills/covers');
      skillData.icon = result.secure_url;
      skillData.coverImage = result.secure_url;
      skillData.coverImagePublicId = result.public_id;
      skillData.coverImageType = imageFile.mimetype.startsWith('video') ? 'video' : 'image';
      console.log('✅ Image compétence mise à jour:', result.secure_url);
    }

    // ✅ Upload nouveaux médias
    if (req.files && req.files.mediaFiles && req.files.mediaFiles.length > 0) {
      const mediaUploads = await Promise.all(
        req.files.mediaFiles.map(file => uploadToCloudinary(file, 'portfolio/skills/media'))
      );
      const mediaObj = { ...(existingSkill.mediaFiles || {}) };
      const newMediaKeys = Object.keys(mediaObj).length;
      mediaUploads.forEach((result, index) => {
        const file = req.files.mediaFiles[index];
        mediaObj[`media_${newMediaKeys + index}`] = {
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype.startsWith('video') ? 'video' : 'image',
          mimeType: file.mimetype,
          originalName: file.originalname
        };
      });
      skillData.mediaFiles = mediaObj;
    }

    if (skillData.level) skillData.level = Number(skillData.level);
    skillData.updatedAt = new Date().toISOString();

    const updatedSkill = { ...existingSkill, ...skillData };
    await skillRef.set(updatedSkill);

    console.log('✅ Compétence mise à jour:', id);
    res.json({
      success: true,
      message: 'Compétence mise à jour avec succès',
      data: { id, ...updatedSkill }
    });
  } catch (error) {
    console.error('Erreur mise à jour compétence:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la compétence' });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.ref(`skills/${id}`).once('value');
    const skill = snapshot.val();
    if (!skill) return res.status(404).json({ success: false, message: 'Compétence non trouvée' });

    if (skill.coverImagePublicId) {
      await deleteFromCloudinary(skill.coverImagePublicId).catch(e => console.warn(e.message));
    }
    if (skill.mediaFiles) {
      await Promise.all(
        Object.values(skill.mediaFiles).map(media =>
          deleteFromCloudinary(media.publicId).catch(e => console.warn(e.message))
        )
      );
    }

    await db.ref(`skills/${id}`).remove();
    res.json({ success: true, message: 'Compétence supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la compétence' });
  }
};