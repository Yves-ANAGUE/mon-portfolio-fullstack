import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

export const getSettings = async (req, res) => {
  try {
    const settingsRef = db.ref('settings');
    const snapshot = await settingsRef.once('value');
    let settings = snapshot.val();

    // Paramètres par défaut si rien n'existe
    if (!settings) {
      settings = {
        profile: {
          fullName: 'ANAGUE Yves San-nong',
          title: 'Développeur Full Stack',
          titleEn: 'Full Stack Developer',
          description: 'Passionné par la création d\'expériences web innovantes',
          descriptionEn: 'Passionate about creating innovative web experiences',
          aboutFr: 'Développeur passionné avec plusieurs années d\'expérience dans la création d\'applications web modernes et performantes.',
          aboutEn: 'Passionate developer with several years of experience creating modern and high-performance web applications.',
          
          // Champs existants
          photo: null,
          email: 'anagueyvessannong@gmail.com',
          phone: '+237657048958',
          location: 'Douala, Cameroun',
          locationEn: 'Douala, Cameroon',

          // Champs nouveaux (défauts)
          emails: ['anagueyvessannong@gmail.com'],
          phones: ['+237657048958'],
          locations: ['Douala, Cameroun'],
          locationsEn: ['Douala, Cameroon'],
          birthDate: '',
          gender: '',
          genderEn: '',
          nationality: '',
          nationalityEn: '',
          maritalStatus: '',
          maritalStatusEn: '',
          drivingLicenses: []
        },
        socials: {
          github: 'https://github.com/Yves-ANAGUE',
          linkedin: 'https://www.linkedin.com/in/yves-san-nong-anague-5434a38a',
          twitter: 'https://x.com/yvess_n_c',
          email: 'anagueyvessannong@gmail.com'
        },
        footer: {
          descriptionFr: 'Développeur Full Stack passionné par la création d\'expériences web innovantes et performantes.',
          descriptionEn: 'Full Stack Developer passionate about creating innovative and high-performance web experiences.',
          copyright: '© 2025 Portfolio. Tous droits réservés.',
          copyrightEn: '© 2025 Portfolio. All rights reserved.'
        }
      };
      await settingsRef.set(settings);
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres'
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settingsData = {};

    // Parser correctement les données JSON
    if (req.body.profile) {
      const profile = typeof req.body.profile === 'string'
        ? JSON.parse(req.body.profile)
        : req.body.profile;

      // ➕ AJOUT des nouveaux champs ici
      settingsData.profile = {
        ...profile,
        emails: profile.emails || [profile.email],
        phones: profile.phones || [profile.phone],
        locations: profile.locations || [profile.location],
        locationsEn: profile.locationsEn || [profile.locationEn],
        birthDate: profile.birthDate || '',
        gender: profile.gender || '',
        genderEn: profile.genderEn || '',
        nationality: profile.nationality || '',
        nationalityEn: profile.nationalityEn || '',
        maritalStatus: profile.maritalStatus || '',
        maritalStatusEn: profile.maritalStatusEn || '',
        drivingLicenses: profile.drivingLicenses || []
      };
    }

    if (req.body.socials) {
      settingsData.socials = typeof req.body.socials === 'string'
        ? JSON.parse(req.body.socials)
        : req.body.socials;
    }

    if (req.body.footer) {
      settingsData.footer = typeof req.body.footer === 'string'
        ? JSON.parse(req.body.footer)
        : req.body.footer;
    }

    if (req.body.homePage) {
      settingsData.homePage = typeof req.body.homePage === 'string'
        ? JSON.parse(req.body.homePage)
        : req.body.homePage;
    }

    const settingsRef = db.ref('settings');
    const snapshot = await settingsRef.once('value');
    const existingSettings = snapshot.val() || {};

    // Upload de photo si présente
    if (req.files && req.files.image) {
      if (existingSettings.profile?.photoPublicId) {
        await deleteFromCloudinary(existingSettings.profile.photoPublicId);
      }

      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/profile');

      if (!settingsData.profile) settingsData.profile = {};
      settingsData.profile.photo = result.secure_url;
      settingsData.profile.photoPublicId = result.public_id;
    }

    const updatedSettings = {
      ...existingSettings,
      profile: { ...(existingSettings.profile || {}), ...(settingsData.profile || {}) },
      socials: { ...(existingSettings.socials || {}), ...(settingsData.socials || {}) },
      footer: { ...(existingSettings.footer || {}), ...(settingsData.footer || {}) },
      homePage: { ...(existingSettings.homePage || {}), ...(settingsData.homePage || {}) },
      updatedAt: new Date().toISOString()
    };

    await settingsRef.set(updatedSettings);

    res.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Erreur mise à jour paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres'
    });
  }
};
