// backend/src/controllers/projects.controller.js
import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

export const getAllProjects = async (req, res) => {
  try {
    const projectsRef = db.ref('projects');
    const snapshot = await projectsRef.once('value');
    const projects = snapshot.val();

    if (!projects) return res.json({ success: true, data: [] });

    const projectsArray = Object.keys(projects).map(key => ({
      id: key,
      ...projects[key]
    }));

    projectsArray.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });

    res.json({ success: true, data: projectsArray });
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des projets' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.ref(`projects/${id}`).once('value');
    const project = snapshot.val();
    if (!project) return res.status(404).json({ success: false, message: 'Projet non trouvé' });
    res.json({ success: true, data: { id, ...project } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération projet' });
  }
};

export const createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };

    // ✅ Upload image de couverture
    if (req.files && req.files.image && req.files.image[0]) {
      const file = req.files.image[0];
      console.log('📸 Upload image projet:', file.originalname);
      const result = await uploadToCloudinary(file, 'portfolio/projects/covers');
      projectData.coverImage = result.secure_url;
      projectData.coverImagePublicId = result.public_id;
      projectData.coverImageType = file.mimetype.startsWith('video') ? 'video' : 'image';
      // Compatibilité avec ancien champ "image"
      projectData.image = result.secure_url;
      console.log('✅ Image uploadée:', result.secure_url);
    }

    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      const file = req.files.coverImage[0];
      console.log('📸 Upload coverImage projet:', file.originalname);
      const result = await uploadToCloudinary(file, 'portfolio/projects/covers');
      projectData.coverImage = result.secure_url;
      projectData.coverImagePublicId = result.public_id;
      projectData.coverImageType = file.mimetype.startsWith('video') ? 'video' : 'image';
      projectData.image = result.secure_url;
      console.log('✅ CoverImage uploadée:', result.secure_url);
    }

    // ✅ Upload fichiers médias multiples
    if (req.files && req.files.mediaFiles && req.files.mediaFiles.length > 0) {
      const mediaUploads = await Promise.all(
        req.files.mediaFiles.map(file => uploadToCloudinary(file, 'portfolio/projects/media'))
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
      projectData.mediaFiles = mediaObj;
    }

    // Parser technologies
    if (typeof projectData.technologies === 'string') {
      try {
        const techArray = JSON.parse(projectData.technologies);
        const techObj = {};
        techArray.forEach((tech, index) => { techObj[`tech_${index}`] = tech; });
        projectData.technologies = techObj;
      } catch (e) {
        projectData.technologies = {};
      }
    }

    projectData.createdAt = new Date().toISOString();
    projectData.updatedAt = new Date().toISOString();

    const projectsRef = db.ref('projects');
    const newProjectRef = projectsRef.push();
    await newProjectRef.set(projectData);

    console.log('✅ Projet créé:', newProjectRef.key);
    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: { id: newProjectRef.key, ...projectData }
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création du projet' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = { ...req.body };

    const projectRef = db.ref(`projects/${id}`);
    const snapshot = await projectRef.once('value');
    const existingProject = snapshot.val();

    if (!existingProject) {
      return res.status(404).json({ success: false, message: 'Projet non trouvé' });
    }

    // ✅ Upload nouvelle image (champ "image" ou "coverImage")
    const imageFile = (req.files && req.files.image && req.files.image[0]) ||
                      (req.files && req.files.coverImage && req.files.coverImage[0]);

    if (imageFile) {
      console.log('📸 Update image projet:', imageFile.originalname);
      // Supprimer ancienne image
      const oldPublicId = existingProject.coverImagePublicId || existingProject.imagePublicId;
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId).catch(e => console.warn('Suppression ancienne image échouée:', e.message));
      }
      const result = await uploadToCloudinary(imageFile, 'portfolio/projects/covers');
      projectData.coverImage = result.secure_url;
      projectData.coverImagePublicId = result.public_id;
      projectData.coverImageType = imageFile.mimetype.startsWith('video') ? 'video' : 'image';
      projectData.image = result.secure_url;
      console.log('✅ Image mise à jour:', result.secure_url);
    }

    // ✅ Upload nouveaux fichiers médias
    if (req.files && req.files.mediaFiles && req.files.mediaFiles.length > 0) {
      const mediaUploads = await Promise.all(
        req.files.mediaFiles.map(file => uploadToCloudinary(file, 'portfolio/projects/media'))
      );
      const mediaObj = { ...(existingProject.mediaFiles || {}) };
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
      projectData.mediaFiles = mediaObj;
    }

    // Parser technologies
    if (typeof projectData.technologies === 'string') {
      try { projectData.technologies = JSON.parse(projectData.technologies); } catch (e) {}
    }

    projectData.updatedAt = new Date().toISOString();

    const updatedProject = { ...existingProject, ...projectData };
    await projectRef.set(updatedProject);

    console.log('✅ Projet mis à jour:', id);
    res.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: { id, ...updatedProject }
    });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour du projet' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.ref(`projects/${id}`).once('value');
    const project = snapshot.val();
    if (!project) return res.status(404).json({ success: false, message: 'Projet non trouvé' });

    const oldPublicId = project.coverImagePublicId || project.imagePublicId;
    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId).catch(e => console.warn(e.message));
    }

    if (project.mediaFiles) {
      await Promise.all(
        Object.values(project.mediaFiles).map(media =>
          deleteFromCloudinary(media.publicId).catch(e => console.warn(e.message))
        )
      );
    }

    await db.ref(`projects/${id}`).remove();
    res.json({ success: true, message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression du projet' });
  }
};
