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
    
    // ✅ Upload image/vidéo de couverture
    if (req.files && req.files.coverImage) {
      const result = await uploadToCloudinary(req.files.coverImage[0], 'portfolio/skills/covers');
      skillData.coverImage = result.secure_url;
      skillData.coverImagePublicId = result.public_id;
      skillData.coverImageType = req.files.coverImage[0].mimetype.startsWith('video') ? 'video' : 'image';
    }

    // ✅ Upload fichiers médias multiples
    if (req.files && req.files.mediaFiles) {
      const mediaUploads = await Promise.all(
        req.files.mediaFiles.map(file => uploadToCloudinary(file, 'portfolio/skills/media'))
      );
      
      const mediaObj = {};
      mediaUploads.forEach((result, index) => {
        const file = req.files.mediaFiles[index];
        mediaObj[`media_${index}`] = {
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype.startsWith('video') ? 'video' : file.mimetype.startsWith('image') ? 'image' : 'file',
          mimeType: file.mimetype,
          originalName: file.originalname
        };
      });
      skillData.mediaFiles = mediaObj;

      // ✅ Créer entrées dans Médias
      const mediaRef = db.ref('media');
      for (const [key, media] of Object.entries(mediaObj)) {
        await mediaRef.push({
          ...media,
          skillId: null,
          skillName: skillData.name,
          category: 'skill',
          createdAt: new Date().toISOString()
        });
      }
    }

    if (skillData.level) {
      skillData.level = Number(skillData.level);
    }

    skillData.createdAt = new Date().toISOString();
    skillData.updatedAt = new Date().toISOString();

    const skillsRef = db.ref('skills');
    const newSkillRef = skillsRef.push();
    await newSkillRef.set(skillData);

    // Mettre à jour skillId dans médias
    if (skillData.mediaFiles) {
      const mediaRef = db.ref('media');
      const mediaSnapshot = await mediaRef.orderByChild('skillName').equalTo(skillData.name).once('value');
      const updates = {};
      mediaSnapshot.forEach(child => {
        updates[child.key] = { ...child.val(), skillId: newSkillRef.key };
      });
      await Promise.all(Object.entries(updates).map(([key, val]) => mediaRef.child(key).set(val)));
    }

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

    // Upload nouvelle image de couverture
    if (req.files && req.files.coverImage) {
      if (existingSkill.coverImagePublicId) {
        await deleteFromCloudinary(existingSkill.coverImagePublicId);
      }
      
      const result = await uploadToCloudinary(req.files.coverImage[0], 'portfolio/skills/covers');
      skillData.coverImage = result.secure_url;
      skillData.coverImagePublicId = result.public_id;
      skillData.coverImageType = req.files.coverImage[0].mimetype.startsWith('video') ? 'video' : 'image';
    }

    // Upload nouveaux médias
    if (req.files && req.files.mediaFiles) {
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
          type: file.mimetype.startsWith('video') ? 'video' : file.mimetype.startsWith('image') ? 'image' : 'file',
          mimeType: file.mimetype,
          originalName: file.originalname
        };
      });
      skillData.mediaFiles = mediaObj;

      // Créer entrées médias
      const mediaRef = db.ref('media');
      for (const [key, media] of Object.entries(mediaObj)) {
        if (key.startsWith(`media_${newMediaKeys}`)) {
          await mediaRef.push({
            ...media,
            skillId: id,
            skillName: skillData.name || existingSkill.name,
            category: 'skill',
            createdAt: new Date().toISOString()
          });
        }
      }
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

    // Supprimer image de couverture
    if (skill.coverImagePublicId) {
      await deleteFromCloudinary(skill.coverImagePublicId);
    }

    // Supprimer fichiers médias
    if (skill.mediaFiles) {
      await Promise.all(
        Object.values(skill.mediaFiles).map(media => 
          deleteFromCloudinary(media.publicId)
        )
      );
    }

    // Supprimer entrées médias associées
    const mediaRef = db.ref('media');
    const mediaSnapshot = await mediaRef.orderByChild('skillId').equalTo(id).once('value');
    const mediaDeletes = [];
    mediaSnapshot.forEach(child => {
      mediaDeletes.push(mediaRef.child(child.key).remove());
    });
    await Promise.all(mediaDeletes);

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
