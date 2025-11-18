import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '../services/upload.service.js';

export const getAllProjects = async (req, res) => {
  try {
    const projectsRef = db.ref('projects');
    const snapshot = await projectsRef.once('value');
    const projects = snapshot.val();

    if (!projects) {
      return res.json({
        success: true,
        data: []
      });
    }

    const projectsArray = Object.keys(projects).map(key => ({
      id: key,
      ...projects[key]
    }));

    res.json({
      success: true,
      data: projectsArray
    });
  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets'
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const projectRef = db.ref(`projects/${id}`);
    const snapshot = await projectRef.once('value');
    const project = snapshot.val();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    res.json({
      success: true,
      data: { id, ...project }
    });
  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du projet'
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const projectData = { ...req.body };
    
    // Upload image principale si présente
    if (req.files && req.files.image) {
      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/projects');
      projectData.image = result.secure_url;
      projectData.imagePublicId = result.public_id;
    }

    // Upload images multiples si présentes
    if (req.files && req.files.images) {
      const imageUploads = await Promise.all(
        req.files.images.map(file => uploadToCloudinary(file, 'portfolio/projects'))
      );
      // Convertir en objet simple pour Firebase
      const imagesObj = {};
      imageUploads.forEach((result, index) => {
        imagesObj[`img_${index}`] = {
          url: result.secure_url,
          publicId: result.public_id
        };
      });
      projectData.images = imagesObj;
    }

    // Parser les technologies si c'est une chaîne
    if (typeof projectData.technologies === 'string') {
      try {
        const techArray = JSON.parse(projectData.technologies);
        // Convertir le tableau en objet pour Firebase
        const techObj = {};
        techArray.forEach((tech, index) => {
          techObj[`tech_${index}`] = tech;
        });
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

    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: {
        id: newProjectRef.key,
        ...projectData
      }
    });
  } catch (error) {
    console.error('Erreur création projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet'
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;

    const projectRef = db.ref(`projects/${id}`);
    const snapshot = await projectRef.once('value');
    const existingProject = snapshot.val();

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Upload nouvelle image principale si présente
    if (req.files && req.files.image) {
      // Supprimer l'ancienne image
      if (existingProject.imagePublicId) {
        await deleteFromCloudinary(existingProject.imagePublicId);
      }
      
      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/projects');
      projectData.image = result.secure_url;
      projectData.imagePublicId = result.public_id;
    }

    // Upload nouvelles images multiples si présentes
    if (req.files && req.files.images) {
      // Supprimer les anciennes images
      if (existingProject.images) {
        await Promise.all(
          existingProject.images.map(img => deleteFromCloudinary(img.publicId))
        );
      }
      
      const imageUploads = await Promise.all(
        req.files.images.map(file => uploadToCloudinary(file, 'portfolio/projects'))
      );
      projectData.images = imageUploads.map(result => ({
        url: result.secure_url,
        publicId: result.public_id
      }));
    }

    // Parser les technologies si c'est une chaîne
    if (typeof projectData.technologies === 'string') {
      projectData.technologies = JSON.parse(projectData.technologies);
    }

    projectData.updatedAt = new Date().toISOString();

    const updatedProject = {
      ...existingProject,
      ...projectData
    };

    await projectRef.set(updatedProject);

    res.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: {
        id,
        ...updatedProject
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du projet'
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectRef = db.ref(`projects/${id}`);
    const snapshot = await projectRef.once('value');
    const project = snapshot.val();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Supprimer les images de Cloudinary
    if (project.imagePublicId) {
      await deleteFromCloudinary(project.imagePublicId);
    }

    if (project.images) {
      await Promise.all(
        project.images.map(img => deleteFromCloudinary(img.publicId))
      );
    }

    await projectRef.remove();

    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du projet'
    });
  }
};
