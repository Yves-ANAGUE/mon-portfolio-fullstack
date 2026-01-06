import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

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

    // ✅ Trier par date décroissante (plus récents d'abord)
    projectsArray.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0);
      const dateB = new Date(b.date || b.createdAt || 0);
      return dateB - dateA;
    });

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
    
    // ✅ Upload image de couverture si présente
    if (req.files && req.files.coverImage) {
      const result = await uploadToCloudinary(req.files.coverImage[0], 'portfolio/projects/covers');
      projectData.coverImage = result.secure_url;
      projectData.coverImagePublicId = result.public_id;
      projectData.coverImageType = req.files.coverImage[0].mimetype.startsWith('video') ? 'video' : 'image';
    }

    // ✅ Upload fichiers multiples (images, vidéos, documents)
    if (req.files && req.files.mediaFiles) {
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

      // ✅ Créer entrées dans la section Médias
      const mediaRef = db.ref('media');
      for (const [key, media] of Object.entries(mediaObj)) {
        await mediaRef.push({
          ...media,
          projectId: null, // Sera mis à jour après création du projet
          projectTitle: projectData.title,
          category: 'project',
          createdAt: new Date().toISOString()
        });
      }
    }

    // Parser technologies
    if (typeof projectData.technologies === 'string') {
      try {
        const techArray = JSON.parse(projectData.technologies);
        const techObj = {};
        techArray.forEach((tech, index) => {
          techObj[`tech_${index}`] = tech;
        });
        projectData.technologies = techObj;
      } catch (e) {
        projectData.technologies = {};
      }
    }

    // ✅ Extraire et sauvegarder les liens
    const links = [];
    if (projectData.url) links.push({ title: `${projectData.title} - Demo`, url: projectData.url, category: 'project' });
    if (projectData.github) links.push({ title: `${projectData.title} - GitHub`, url: projectData.github, category: 'github' });
    
    if (links.length > 0) {
      const linksRef = db.ref('links');
      for (const link of links) {
        await linksRef.push({
          ...link,
          projectId: null, // Sera mis à jour
          createdAt: new Date().toISOString()
        });
      }
    }

    projectData.createdAt = new Date().toISOString();
    projectData.updatedAt = new Date().toISOString();

    const projectsRef = db.ref('projects');
    const newProjectRef = projectsRef.push();
    await newProjectRef.set(projectData);

    // Mettre à jour les projectId dans médias et liens
    if (projectData.mediaFiles) {
      const mediaRef = db.ref('media');
      const mediaSnapshot = await mediaRef.orderByChild('projectTitle').equalTo(projectData.title).once('value');
      const updates = {};
      mediaSnapshot.forEach(child => {
        updates[child.key] = { ...child.val(), projectId: newProjectRef.key };
      });
      await Promise.all(Object.entries(updates).map(([key, val]) => mediaRef.child(key).set(val)));
    }

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

    // Upload nouvelle image de couverture
    if (req.files && req.files.coverImage) {
      if (existingProject.coverImagePublicId) {
        await deleteFromCloudinary(existingProject.coverImagePublicId);
      }
      
      const result = await uploadToCloudinary(req.files.coverImage[0], 'portfolio/projects/covers');
      projectData.coverImage = result.secure_url;
      projectData.coverImagePublicId = result.public_id;
      projectData.coverImageType = req.files.coverImage[0].mimetype.startsWith('video') ? 'video' : 'image';
    }

    // Upload nouveaux fichiers médias
    if (req.files && req.files.mediaFiles) {
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
          type: file.mimetype.startsWith('video') ? 'video' : file.mimetype.startsWith('image') ? 'image' : 'file',
          mimeType: file.mimetype,
          originalName: file.originalname
        };
      });
      projectData.mediaFiles = mediaObj;

      // Créer entrées médias
      const mediaRef = db.ref('media');
      for (const [key, media] of Object.entries(mediaObj)) {
        if (key.startsWith(`media_${newMediaKeys}`)) {
          await mediaRef.push({
            ...media,
            projectId: id,
            projectTitle: projectData.title || existingProject.title,
            category: 'project',
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    // Parser technologies
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

    // Supprimer image de couverture
    if (project.coverImagePublicId) {
      await deleteFromCloudinary(project.coverImagePublicId);
    }

    // Supprimer fichiers médias
    if (project.mediaFiles) {
      await Promise.all(
        Object.values(project.mediaFiles).map(media => 
          deleteFromCloudinary(media.publicId)
        )
      );
    }

    // Supprimer entrées médias associées
    const mediaRef = db.ref('media');
    const mediaSnapshot = await mediaRef.orderByChild('projectId').equalTo(id).once('value');
    const mediaDeletes = [];
    mediaSnapshot.forEach(child => {
      mediaDeletes.push(mediaRef.child(child.key).remove());
    });
    await Promise.all(mediaDeletes);

    // Supprimer liens associés
    const linksRef = db.ref('links');
    const linksSnapshot = await linksRef.orderByChild('projectId').equalTo(id).once('value');
    const linkDeletes = [];
    linksSnapshot.forEach(child => {
      linkDeletes.push(linksRef.child(child.key).remove());
    });
    await Promise.all(linkDeletes);

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
