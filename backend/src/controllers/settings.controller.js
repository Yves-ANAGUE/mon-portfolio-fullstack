import { db } from '../config/firebase.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

/* ===========================
   GET SETTINGS
=========================== */
export const getSettings = async (req, res) => {
  try {
    const settingsRef = db.ref('settings');
    const snapshot = await settingsRef.once('value');
    let settings = snapshot.val();

    // 🔹 Valeurs par défaut si la config n'existe pas
    if (!settings) {
      settings = {
        profile: {
          fullName: 'ANAGUE Yves San-nong',

          // Titres simples (compatibilité)
          title: 'Développeur Full Stack',
          titleEn: 'Full Stack Developer',

          // ✅ Titres multiples
          titlesFr: [
            'Développeur Full Stack',
            'Expert React & Node.js',
            'Architecte Web'
          ],
          titlesEn: [
            'Full Stack Developer',
            'React & Node.js Expert',
            'Web Architect'
          ],

          // Descriptions simples (compatibilité)
          description: 'Passionné par la création d\'expériences web innovantes',
          descriptionEn: 'Passionate about creating innovative web experiences',

          // ✅ Descriptions multiples
          descriptionsFr: [
            'Passionné par la création d\'expériences web innovantes',
            'Transformant des idées en applications performantes',
            'Expert en développement moderne et scalable'
          ],
          descriptionsEn: [
            'Passionate about creating innovative web experiences',
            'Transforming ideas into high-performance applications',
            'Expert in modern and scalable development'
          ],

          aboutFr: 'Développeur passionné avec plusieurs années d\'expérience.',
          aboutEn: 'Passionate developer with several years of experience.',

          photo: null,

          // Champs simples (compatibilité)
          email: 'anagueyvessannong@gmail.com',
          phone: '+237657048958',
          location: 'Douala, Cameroun',
          locationEn: 'Douala, Cameroon',

          // ✅ Champs multiples
          emails: ['anagueyvessannong@gmail.com'],
          phones: ['+237657048958'],
          locations: ['Douala, Cameroun'],
          locationsEn: ['Douala, Cameroon'],

          // Infos personnelles
          birthDate: '',
          gender: '',
          genderEn: '',
          nationality: '',
          nationalityEn: '',
          maritalStatus: '',
          maritalStatusEn: '',
          drivingLicenses: []
        },

        // ✅ Sections dynamiques
        experiences: [],
        formations: [],
        languages: [],
        interests: [],

        socials: {
          github: 'https://github.com/Yves-ANAGUE',
          linkedin: 'https://www.linkedin.com/in/yves-san-nong-anague-5434a738a',
          twitter: 'https://x.com/yvess_n_c',
          email: 'anagueyvessannong@gmail.com'
        },

        footer: {
          descriptionFr: 'Développeur Full Stack passionné.',
          descriptionEn: 'Passionate Full Stack Developer.',
          copyright: '©️ 2025 Portfolio. Tous droits réservés.',
          copyrightEn: '©️ 2025 Portfolio. All rights reserved.'
        }
      };

      await settingsRef.set(settings);
    }

    res.json({ success: true, data: settings });

  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres'
    });
  }
};

/* ===========================
   UPDATE SETTINGS
=========================== */
export const updateSettings = async (req, res) => {
  try {
    let settingsData = {};

    // ===== PROFILE =====
    if (req.body.profile) {
      const profile = typeof req.body.profile === 'string'
        ? JSON.parse(req.body.profile)
        : req.body.profile;

      settingsData.profile = {
        ...profile,

        // ✅ Sécurisation correcte des tableaux
titlesFr: Array.isArray(profile.titlesFr) ? profile.titlesFr : [],
titlesEn: Array.isArray(profile.titlesEn) ? profile.titlesEn : [],
descriptionsFr: Array.isArray(profile.descriptionsFr) ? profile.descriptionsFr : [],
descriptionsEn: Array.isArray(profile.descriptionsEn) ? profile.descriptionsEn : [],
        emails: profile.emails || (profile.email ? [profile.email] : []),
        phones: profile.phones || (profile.phone ? [profile.phone] : []),
        locations: profile.locations || (profile.location ? [profile.location] : []),
        locationsEn: profile.locationsEn || (profile.locationEn ? [profile.locationEn] : []),

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

    // ===== AUTRES SECTIONS =====
    const parseField = (field) =>
      typeof req.body[field] === 'string'
        ? JSON.parse(req.body[field])
        : req.body[field];

    if (req.body.experiences) settingsData.experiences = parseField('experiences');
    if (req.body.formations) settingsData.formations = parseField('formations');
    if (req.body.languages) settingsData.languages = parseField('languages');
    if (req.body.interests) settingsData.interests = parseField('interests');
    if (req.body.socials) settingsData.socials = parseField('socials');
    if (req.body.footer) settingsData.footer = parseField('footer');
    if (req.body.homePage) settingsData.homePage = parseField('homePage');

    const settingsRef = db.ref('settings');
    const snapshot = await settingsRef.once('value');
    const existingSettings = snapshot.val() || {};

    // ===== UPLOAD PHOTO =====
    if (req.files && req.files.image) {
      if (existingSettings.profile?.photoPublicId) {
        await deleteFromCloudinary(existingSettings.profile.photoPublicId);
      }

      const result = await uploadToCloudinary(req.files.image[0], 'portfolio/profile');
      if (!settingsData.profile) settingsData.profile = {};
      settingsData.profile.photo = result.secure_url;
      settingsData.profile.photoPublicId = result.public_id;
    }

    // ===== FUSION FINALE =====
    const updatedSettings = {
      ...existingSettings,
      profile: { ...(existingSettings.profile || {}), ...(settingsData.profile || {}) },
      experiences: settingsData.experiences ?? existingSettings.experiences ?? [],
      formations: settingsData.formations ?? existingSettings.formations ?? [],
      languages: settingsData.languages ?? existingSettings.languages ?? [],
      interests: settingsData.interests ?? existingSettings.interests ?? [],
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
