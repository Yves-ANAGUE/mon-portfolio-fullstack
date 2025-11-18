import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonialsRef = db.ref('testimonials');
    const snapshot = await testimonialsRef.once('value');
    const testimonials = snapshot.val();

    if (!testimonials) {
      return res.json({
        success: true,
        data: []
      });
    }

    const testimonialsArray = Object.keys(testimonials).map(key => ({
      id: key,
      ...testimonials[key]
    }));

    res.json({
      success: true,
      data: testimonialsArray
    });
  } catch (error) {
    console.error('Erreur récupération témoignages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des témoignages'
    });
  }
};

export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonialRef = db.ref(`testimonials/${id}`);
    const snapshot = await testimonialRef.once('value');
    const testimonial = snapshot.val();

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    res.json({
      success: true,
      data: { id, ...testimonial }
    });
  } catch (error) {
    console.error('Erreur récupération témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du témoignage'
    });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const testimonialData = { ...req.body };
    
    // Upload image si présente
    if (req.files && req.files.image) {
      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/testimonials');
      testimonialData.image = result.secure_url;
      testimonialData.imagePublicId = result.public_id;
    }

    // Convertir rating en nombre
    if (testimonialData.rating) {
      testimonialData.rating = Number(testimonialData.rating);
    }

    testimonialData.createdAt = new Date().toISOString();
    testimonialData.updatedAt = new Date().toISOString();

    const testimonialsRef = db.ref('testimonials');
    const newTestimonialRef = testimonialsRef.push();
    await newTestimonialRef.set(testimonialData);

    res.status(201).json({
      success: true,
      message: 'Témoignage créé avec succès',
      data: {
        id: newTestimonialRef.key,
        ...testimonialData
      }
    });
  } catch (error) {
    console.error('Erreur création témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du témoignage'
    });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonialData = req.body;

    const testimonialRef = db.ref(`testimonials/${id}`);
    const snapshot = await testimonialRef.once('value');
    const existingTestimonial = snapshot.val();

    if (!existingTestimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    // Upload nouvelle image si présente
    if (req.files && req.files.image) {
      // Supprimer l'ancienne image
      if (existingTestimonial.imagePublicId) {
        await deleteFromCloudinary(existingTestimonial.imagePublicId);
      }
      
      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/testimonials');
      testimonialData.image = result.secure_url;
      testimonialData.imagePublicId = result.public_id;
    }

    testimonialData.updatedAt = new Date().toISOString();

    const updatedTestimonial = {
      ...existingTestimonial,
      ...testimonialData
    };

    await testimonialRef.set(updatedTestimonial);

    res.json({
      success: true,
      message: 'Témoignage mis à jour avec succès',
      data: {
        id,
        ...updatedTestimonial
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du témoignage'
    });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonialRef = db.ref(`testimonials/${id}`);
    const snapshot = await testimonialRef.once('value');
    const testimonial = snapshot.val();

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Témoignage non trouvé'
      });
    }

    // Supprimer l'image de Cloudinary
    if (testimonial.imagePublicId) {
      await deleteFromCloudinary(testimonial.imagePublicId);
    }

    await testimonialRef.remove();

    res.json({
      success: true,
      message: 'Témoignage supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression témoignage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du témoignage'
    });
  }
};
