// frontend/src/components/home/About.jsx - MISE À JOUR COMPLÈTE
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code, Palette, Zap, Users, Calendar, MapPin, Globe, 
  Heart, Briefcase, GraduationCap, Award 
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import settingsService from '../../services/settings.service';
import experiencesService from '../../services/experiences.service';
import formationsService from '../../services/formations.service';
import languagesService from '../../services/languages.service';
import interestsService from '../../services/interests.service';
import { ANIMATION_VARIANTS, STAGGER_CONTAINER } from '../../utils/constants';

const About = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [formations, setFormations] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [settingsRes, experiencesRes, formationsRes, languagesRes, interestsRes] = await Promise.all([
        settingsService.get(),
        experiencesService.getAll(),
        formationsService.getAll(),
        languagesService.getAll(),
        interestsService.getAll()
      ]);

      setSettings(settingsRes.data);
      setExperiences(experiencesRes.data);
      setFormations(formationsRes.data);
      setLanguages(languagesRes.data);
      setInterests(interestsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const isFrench = language === 'fr';
  const aboutText = isFrench ? settings?.profile?.aboutFr : settings?.profile?.aboutEn;
  const homePage = settings?.homePage || {};

  // ✅ Calculer l'âge
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(settings?.profile?.birthDate);

  const features = [
    {
      icon: Code,
      title: isFrench ? (homePage.cleanCodeTitleFr || 'Clean Code') : (homePage.cleanCodeTitleEn || 'Clean Code'),
      description: isFrench ? (homePage.cleanCodeDescFr || 'J\'écris du code propre.') : (homePage.cleanCodeDescEn || 'I write clean code.'),
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: Palette,
      title: isFrench ? (homePage.creativeDesignTitleFr || 'Design créatif') : (homePage.creativeDesignTitleEn || 'Creative Design'),
      description: isFrench ? (homePage.creativeDesignDescFr || 'Interfaces modernes.') : (homePage.creativeDesignDescEn || 'Modern interfaces.'),
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: Zap,
      title: isFrench ? (homePage.performanceTitleFr || 'Performance') : (homePage.performanceTitleEn || 'Performance'),
      description: isFrench ? (homePage.performanceDescFr || 'Performances maximales.') : (homePage.performanceDescEn || 'Maximum performance.'),
      color: 'text-yellow-500',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      icon: Users,
      title: isFrench ? (homePage.collaborationTitleFr || 'Collaboration') : (homePage.collaborationTitleEn || 'Collaboration'),
      description: isFrench ? (homePage.collaborationDescFr || 'Travail d\'équipe efficace.') : (homePage.collaborationDescEn || 'Effective teamwork.'),
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  return (
    <section className="section bg-white dark:bg-gray-900">
      <div className="container-custom">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={STAGGER_CONTAINER}
        >
          <motion.h2
            variants={ANIMATION_VARIANTS.slideUp}
            className="text-4xl md:text-5xl font-bold text-center mb-4"
          >
            {t('home.about')}
          </motion.h2>

          <motion.p
            variants={ANIMATION_VARIANTS.slideUp}
            className="text-xl text-center text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
          >
            {aboutText || 'Développeur passionné...'}
          </motion.p>

          {/* ✅ Informations personnelles */}
          {settings?.profile && (
            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
              className="max-w-4xl mx-auto mb-12 card p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {age && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold">{isFrench ? 'Âge:' : 'Age:'}</span>
                    <span className="text-gray-600 dark:text-gray-400">{age} ans</span>
                  </div>
                )}

                {settings.profile.gender && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold">{isFrench ? 'Genre:' : 'Gender:'}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {isFrench ? settings.profile.gender : settings.profile.genderEn}
                    </span>
                  </div>
                )}

                {settings.profile.nationality && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold">{isFrench ? 'Nationalité:' : 'Nationality:'}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {isFrench ? settings.profile.nationality : settings.profile.nationalityEn}
                    </span>
                  </div>
                )}

                {settings.profile.maritalStatus && (
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold">{isFrench ? 'Statut:' : 'Status:'}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {isFrench ? settings.profile.maritalStatus : settings.profile.maritalStatusEn}
                    </span>
                  </div>
                )}

                {settings.profile.locations && settings.profile.locations.length > 0 && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold">{isFrench ? 'Localisation:' : 'Location:'}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {isFrench ? settings.profile.locations[0] : settings.profile.locationsEn?.[0]}
                    </span>
                  </div>
                )}

                {settings.profile.drivingLicenses && settings.profile.drivingLicenses.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold">{isFrench ? 'Permis:' : 'License:'}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {settings.profile.drivingLicenses.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Cartes de compétences */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={ANIMATION_VARIANTS.slideUp}
                whileHover={{ y: -10 }}
                className="card p-6 text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${feature.bg} flex items-center justify-center`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* ✅ Expériences professionnelles */}
          {experiences.length > 0 && (
            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
              className="mb-12"
            >
              <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Briefcase className="w-6 h-6 text-primary-600" />
                {isFrench ? 'Expériences Professionnelles' : 'Professional Experience'}
              </h3>
              <div className="max-w-4xl mx-auto space-y-4">
                {experiences.slice(0, 3).map((exp, index) => (
                  <div key={index} className="card p-4 border-l-4 border-primary-600">
                    <h4 className="font-bold">
                      {isFrench ? exp.position : exp.positionEn || exp.position}
                    </h4>
                    <p className="text-primary-600 font-semibold">{exp.company}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(exp.startDate).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })} - 
                      {exp.current ? (isFrench ? ' Présent' : ' Present') : ` ${new Date(exp.endDate).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ✅ Formations */}
          {formations.length > 0 && (
            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
              className="mb-12"
            >
              <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-600" />
                {isFrench ? 'Formation' : 'Education'}
              </h3>
              <div className="max-w-4xl mx-auto space-y-4">
                {formations.slice(0, 3).map((formation, index) => (
                  <div key={index} className="card p-4 border-l-4 border-purple-600">
                    <h4 className="font-bold">
                      {isFrench ? formation.diploma : formation.diplomaEn || formation.diploma}
                    </h4>
                    <p className="text-purple-600 font-semibold">
                      {isFrench ? formation.school : formation.schoolEn || formation.school}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(formation.startDate).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })} - 
                      {formation.current ? (isFrench ? ' En cours' : ' Current') : ` ${new Date(formation.endDate).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}`}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ✅ Langues */}
          {languages.length > 0 && (
            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
              className="mb-12"
            >
              <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Globe className="w-6 h-6 text-blue-600" />
                {isFrench ? 'Langues' : 'Languages'}
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {languages.map((lang, index) => (
                  <div key={index} className="card p-4 text-center">
                    <p className="font-bold">{isFrench ? lang.name : lang.nameEn || lang.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isFrench ? lang.level : lang.levelEn || lang.level}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ✅ Centres d'intérêt */}
          {interests.length > 0 && (
            <motion.div
              variants={ANIMATION_VARIANTS.slideUp}
            >
              <h3 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <Heart className="w-6 h-6 text-red-600" />
                {isFrench ? 'Centres d\'Intérêt' : 'Interests'}
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {interests.map((interest, index) => (
                  <div key={index} className="card p-4 flex items-center gap-2">
                    <span className="text-2xl">{interest.icon}</span>
                    <span className="font-semibold">
                      {isFrench ? interest.name : interest.nameEn || interest.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default About;