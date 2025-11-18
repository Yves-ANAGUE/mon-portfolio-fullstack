// frontend/src/components/downloads/PortfolioGenerator.jsx - MISE À JOUR COMPLÈTE
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, Download } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import projectsService from '../../services/projects.service';
import skillsService from '../../services/skills.service';
import settingsService from '../../services/settings.service';
import experiencesService from '../../services/experiences.service';
import formationsService from '../../services/formations.service';
import languagesService from '../../services/languages.service';
import interestsService from '../../services/interests.service';
import testimonialsService from '../../services/testimonials.service';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import { ANIMATION_VARIANTS } from '../../utils/constants';

const PortfolioGenerator = () => {
  const { t, language } = useLanguage();
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setGenerating(true);
      toast.loading(t('downloads.generating'), { id: 'pdf-gen' });

      // ✅ Récupérer TOUTES les données
      const [
        projectsRes, skillsRes, settingsRes, experiencesRes, 
        formationsRes, languagesRes, interestsRes, testimonialsRes
      ] = await Promise.all([
        projectsService.getAll(),
        skillsService.getAll(),
        settingsService.get(),
        experiencesService.getAll(),
        formationsService.getAll(),
        languagesService.getAll(),
        interestsService.getAll(),
        testimonialsService.getAll()
      ]);

      const projects = projectsRes.data;
      const skills = skillsRes.data;
      const settings = settingsRes.data;
      const experiences = experiencesRes.data;
      const formations = formationsRes.data;
      const languages = languagesRes.data;
      const interests = interestsRes.data;
      const testimonials = testimonialsRes.data;
      
      const isFrench = language === 'fr';

      const doc = new jsPDF();
      let yPos = 20;

      // ===== HEADER MODERNE =====
      // Bandeau coloré en haut
      doc.setFillColor(79, 70, 229); // primary-600
      doc.rect(0, 0, 210, 40, 'F');

      // Photo de profil (si disponible)
      if (settings.profile?.photo) {
        try {
          doc.addImage(settings.profile.photo, 'JPEG', 15, 10, 30, 30, undefined, 'FAST');
        } catch (error) {
          console.log('Photo non chargée');
        }
      }

      // Nom et titre (texte blanc sur bandeau)
      doc.setFontSize(26);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(settings.profile?.fullName || 'Portfolio', 55, 20);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      const title = isFrench ? settings.profile?.title : settings.profile?.titleEn;
      doc.text(title || 'Développeur', 55, 28);

      yPos = 50;

      // ===== COORDONNÉES =====
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      
      const emails = settings.profile?.emails || [settings.profile?.email] || [];
      const phones = settings.profile?.phones || [settings.profile?.phone] || [];
      const locations = isFrench 
        ? (settings.profile?.locations || [settings.profile?.location] || [])
        : (settings.profile?.locationsEn || [settings.profile?.locationEn] || []);
      
      const contactLine = [
        emails[0],
        phones[0],
        locations[0]
      ].filter(Boolean).join(' | ');
      
      doc.text(contactLine, 105, yPos, { align: 'center' });
      yPos += 5;

      // ✅ Infos personnelles supplémentaires
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

      const age = calculateAge(settings.profile?.birthDate);
      const personalInfo = [];
      
      if (age) personalInfo.push(`${age} ans`);
      if (settings.profile?.nationality) personalInfo.push(isFrench ? settings.profile.nationality : settings.profile.nationalityEn);
      if (settings.profile?.maritalStatus) personalInfo.push(isFrench ? settings.profile.maritalStatus : settings.profile.maritalStatusEn);
      if (settings.profile?.drivingLicenses && settings.profile.drivingLicenses.length > 0) {
        personalInfo.push(`Permis: ${settings.profile.drivingLicenses.join(', ')}`);
      }
      
      if (personalInfo.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(personalInfo.join(' • '), 105, yPos, { align: 'center' });
        yPos += 5;
      }

      // Ligne de séparation
      doc.setDrawColor(79, 70, 229);
      doc.setLineWidth(0.5);
      doc.line(15, yPos, 195, yPos);
      yPos += 10;

      // ===== À PROPOS =====
      addSection(doc, isFrench ? 'À PROPOS' : 'ABOUT', yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      const aboutText = isFrench ? settings.profile?.aboutFr : settings.profile?.aboutEn;
      const aboutLines = doc.splitTextToSize(aboutText || '', 180);
      doc.text(aboutLines, 15, yPos);
      yPos += aboutLines.length * 5 + 10;

      // ===== EXPÉRIENCES PROFESSIONNELLES =====
      if (experiences.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        addSection(doc, isFrench ? 'EXPÉRIENCES PROFESSIONNELLES' : 'PROFESSIONAL EXPERIENCE', yPos);
        yPos += 8;

        experiences.forEach((exp, index) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          // Icône
          doc.setFillColor(79, 70, 229);
          doc.circle(18, yPos + 2, 2, 'F');

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          doc.text(isFrench ? exp.position : exp.positionEn || exp.position, 25, yPos);
          yPos += 5;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(60, 60, 60);
          doc.text(exp.company, 25, yPos);
          yPos += 5;

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          const expLocation = isFrench ? exp.location : exp.locationEn || exp.location;
          const expDates = `${new Date(exp.startDate).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })} - ${exp.current ? (isFrench ? 'Présent' : 'Present') : new Date(exp.endDate).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}`;
          doc.text(`${expLocation} | ${expDates}`, 25, yPos);
          yPos += 5;

          if (exp.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            const descText = isFrench ? exp.description : exp.descriptionEn || exp.description;
            const descLines = doc.splitTextToSize(descText, 170);
            doc.text(descLines, 25, yPos);
            yPos += descLines.length * 4 + 2;
          }

          if (exp.technologies && exp.technologies.length > 0) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(79, 70, 229);
            doc.text(`Technologies: ${exp.technologies.join(', ')}`, 25, yPos);
            yPos += 4;
          }

          yPos += 5;
        });
      }

      // ===== FORMATION =====
      if (formations.length > 0) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        addSection(doc, isFrench ? 'FORMATION' : 'EDUCATION', yPos);
        yPos += 8;

        formations.forEach((formation) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFillColor(147, 51, 234); // purple-600
          doc.circle(18, yPos + 2, 2, 'F');

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(147, 51, 234);
          doc.text(isFrench ? formation.diploma : formation.diplomaEn || formation.diploma, 25, yPos);
          yPos += 5;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(60, 60, 60);
          doc.text(isFrench ? formation.school : formation.schoolEn || formation.school, 25, yPos);
          yPos += 5;

          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          doc.setTextColor(100, 100, 100);
          const formLocation = isFrench ? formation.location : formation.locationEn || formation.location;
          const formDates = `${new Date(formation.startDate).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })} - ${formation.current ? (isFrench ? 'En cours' : 'Current') : new Date(formation.endDate).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })}`;
          doc.text(`${formLocation} | ${formDates}`, 25, yPos);
          yPos += 5;

          if (formation.grade) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(147, 51, 234);
            doc.text(`Mention: ${formation.grade}`, 25, yPos);
            yPos += 4;
          }

          if (formation.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            const descText = isFrench ? formation.description : formation.descriptionEn || formation.description;
            const descLines = doc.splitTextToSize(descText, 170);
            doc.text(descLines, 25, yPos);
            yPos += descLines.length * 4;
          }

          yPos += 5;
        });
      }

      // ===== COMPÉTENCES =====
      if (skills.length > 0) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        addSection(doc, isFrench ? 'COMPÉTENCES TECHNIQUES' : 'TECHNICAL SKILLS', yPos);
        yPos += 8;

        const skillsByCategory = skills.reduce((acc, skill) => {
          const cat = skill.category || 'other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(skill);
          return acc;
        }, {});

        Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          doc.text(category.toUpperCase(), 15, yPos);
          yPos += 5;

          categorySkills.forEach(skill => {
            if (yPos > 275) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const skillText = `• ${skill.name}${skill.level ? ` - ${skill.level}%` : ''}`;
            doc.text(skillText, 20, yPos);
            yPos += 4;
          });
          yPos += 3;
        });
      }

      // ===== LANGUES =====
      if (languages.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        addSection(doc, isFrench ? 'LANGUES' : 'LANGUAGES', yPos);
        yPos += 8;

        languages.forEach(lang => {
          if (yPos > 275) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(60, 60, 60);
          doc.text(`• ${isFrench ? lang.name : lang.nameEn || lang.name}`, 20, yPos);
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text(`: ${isFrench ? lang.level : lang.levelEn || lang.level}`, 50, yPos);
          yPos += 5;
        });
        yPos += 5;
      }

      // ===== CENTRES D'INTÉRÊT =====
      if (interests.length > 0) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        addSection(doc, isFrench ? 'CENTRES D\'INTÉRÊT' : 'INTERESTS', yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const interestsText = interests.map(i => 
          `${i.icon} ${isFrench ? i.name : i.nameEn || i.name}`
        ).join('  •  ');
        
        const interestsLines = doc.splitTextToSize(interestsText, 180);
        doc.text(interestsLines, 15, yPos);
        yPos += interestsLines.length * 5 + 5;
      }

      // ===== PROJETS =====
      if (projects.length > 0) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        addSection(doc, isFrench ? 'PROJETS' : 'PROJECTS', yPos);
        yPos += 8;

        projects.slice(0, 5).forEach((project) => {
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          doc.text(project.title, 15, yPos);
          yPos += 6;

          if (project.date) {
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            doc.setFont('helvetica', 'italic');
            doc.text(new Date(project.date).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US'), 15, yPos);
            yPos += 5;
          }

          if (project.description) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 60, 60);
            const descLines = doc.splitTextToSize(project.description, 180);
            doc.text(descLines, 15, yPos);
            yPos += descLines.length * 4;
          }

          if (project.technologies && project.technologies.length > 0) {
            doc.setFontSize(8);
            doc.setTextColor(79, 70, 229);
            doc.setFont('helvetica', 'italic');
            const techText = (isFrench ? 'Technologies: ' : 'Technologies: ') + project.technologies.join(', ');
            const techLines = doc.splitTextToSize(techText, 180);
            doc.text(techLines, 15, yPos);
            yPos += techLines.length * 4;
          }

          if (project.url || project.github) {
            doc.setFontSize(8);
            doc.setTextColor(79, 70, 229);
            if (project.url) {
              doc.textWithLink('🔗 ' + project.url, 15, yPos, { url: project.url });
              yPos += 4;
            }
            if (project.github) {
              doc.textWithLink('💻 ' + project.github, 15, yPos, { url: project.github });
              yPos += 4;
            }
          }

          yPos += 6;
        });
      }

      // ===== TÉMOIGNAGES =====
      if (testimonials.length > 0) {
        if (yPos > 230) {
          doc.addPage();
          yPos = 20;
        }

        addSection(doc, isFrench ? 'TÉMOIGNAGES' : 'TESTIMONIALS', yPos);
        yPos += 8;

        testimonials.slice(0, 3).forEach((testimonial) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(60, 60, 60);
          const msgLines = doc.splitTextToSize(`"${testimonial.message}"`, 180);
          doc.text(msgLines, 15, yPos);
          yPos += msgLines.length * 4 + 2;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(79, 70, 229);
          doc.text(`- ${testimonial.name}${testimonial.position ? ', ' + testimonial.position : ''}`, 15, yPos);
          yPos += 6;
        });
      }

      // ===== FOOTER SUR TOUTES LES PAGES =====
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(15, 282, 195, 282);
        
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        
        const footerLeft = `${settings.profile?.fullName || 'Portfolio'}`;
        const footerCenter = emails[0] || '';
        const footerRight = `${isFrench ? 'Page' : 'Page'} ${i}/${totalPages}`;
        
        doc.text(footerLeft, 15, 287);
        doc.text(footerCenter, 105, 287, { align: 'center' });
        doc.text(footerRight, 195, 287, { align: 'right' });
      }

      // ===== TÉLÉCHARGEMENT =====
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `CV_${settings.profile?.fullName?.replace(/\s+/g, '_') || 'Portfolio'}_${dateStr}_${timeStr}.pdf`;
      
      doc.save(fileName);
      
      toast.success(t('downloads.success'), { id: 'pdf-gen' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(t('downloads.error'), { id: 'pdf-gen' });
    } finally {
      setGenerating(false);
    }
  };

  // Fonction helper pour les sections
  const addSection = (doc, title, yPos) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(title, 15, yPos);
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(15, yPos + 2, 195, yPos + 2);
  };

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.scaleIn}
      initial="hidden"
      animate="visible"
      className="card p-8 text-center bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-2 border-primary-200 dark:border-primary-800"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
        <FileText className="w-10 h-10 text-white" />
      </div>

      <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        {t('downloads.portfolio')}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {t('downloads.portfolioDesc')}
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={generatePDF}
        disabled={generating}
        className="btn btn-primary mx-auto shadow-xl"
      >
        {generating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {t('downloads.generating')}
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            {t('downloads.generateBtn')}
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
        ✨ CV professionnel avec toutes vos données : expériences, formations, langues, centres d'intérêt, etc.
      </p>
    </motion.div>
  );
};

export default PortfolioGenerator;