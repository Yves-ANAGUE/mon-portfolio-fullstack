// backend/src/controllers/chatbot.controller.js
import { db } from '../config/firebase.js';

export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId, language = 'fr' } = req.body;

    console.log('📨 Message:', message);

    if (!message || !message.trim()) {
      return res.status(200).json({
        success: true,
        response: language === 'fr' ? 'Veuillez écrire un message.' : 'Please write a message.',
        conversationId: conversationId || Date.now().toString()
      });
    }

    // ✅ RÉCUPÉRATION COMPLÈTE DES DONNÉES
    let settings = null;
    let projects = [];
    let skills = [];
    let testimonials = [];
    let experiences = [];
    let formations = [];
    let languages = [];
    let interests = [];

    try {
      const [
        settingsSnap, 
        projectsSnap, 
        skillsSnap, 
        testimonialsSnap,
        experiencesSnap,
        formationsSnap,
        languagesSnap,
        interestsSnap
      ] = await Promise.all([
        db.ref('settings').once('value'),
        db.ref('projects').once('value'),
        db.ref('skills').once('value'),
        db.ref('testimonials').once('value'),
        db.ref('experiences').once('value'),
        db.ref('formations').once('value'),
        db.ref('languages').once('value'),
        db.ref('interests').once('value')
      ]);

      settings = settingsSnap.val();
      
      if (projectsSnap.val()) projects = Object.values(projectsSnap.val());
      if (skillsSnap.val()) skills = Object.values(skillsSnap.val());
      if (testimonialsSnap.val()) testimonials = Object.values(testimonialsSnap.val());
      if (experiencesSnap.val()) experiences = Object.values(experiencesSnap.val());
      if (formationsSnap.val()) formations = Object.values(formationsSnap.val());
      if (languagesSnap.val()) languages = Object.values(languagesSnap.val());
      if (interestsSnap.val()) interests = Object.values(interestsSnap.val());
      
    } catch (dbError) {
      console.error('⚠️ Firebase:', dbError.message);
    }

    // ✅ CONTEXTE ENRICHI
    const fullName = settings?.profile?.fullName || 'ANAGUE Yves San-nong';
    const isFrench = language === 'fr';
    
    const emails = settings?.profile?.emails || [settings?.profile?.email] || [];
    const phones = settings?.profile?.phones || [settings?.profile?.phone] || [];
    const locations = settings?.profile?.locations || [settings?.profile?.location] || [];
    
    const projectsList = projects.slice(0, 5)
      .map(p => `• ${p.title}: ${p.description?.substring(0, 80) || 'Projet web'}`)
      .join('\n');
    
    const skillsList = skills.slice(0, 15)
      .map(s => s.name)
      .join(', ');

    const experiencesList = experiences.slice(0, 3)
      .map(e => `• ${e.position} chez ${e.company} (${e.duration})`)
      .join('\n');

    const formationsList = formations.slice(0, 3)
      .map(f => `• ${f.diploma} - ${f.school}`)
      .join('\n');

    const languagesList = languages
      .map(l => `${l.name} (${l.level})`)
      .join(', ');

    // ✅ ANALYSE INTELLIGENTE DU MESSAGE
    const lowerMsg = message.toLowerCase();
    const words = lowerMsg.split(' ');
    let aiResponse = '';

    // 🎯 DÉTECTION D'INTENTION AVANCÉE
    
    // Compétences
    if (lowerMsg.match(/compétence|skill|technologie|technology|stack|maîtrise|sais[-\s]tu|peux[-\s]tu|capacité/i)) {
      aiResponse = isFrench
        ? `💼 **Compétences techniques :**\n\n${skillsList || 'React, Node.js, JavaScript, TypeScript, Python, MongoDB, Firebase'}\n\n🎓 **Langues :**\n${languagesList || 'Français, Anglais'}\n\n✨ Plus de détails dans la section **"Compétences"** !`
        : `💼 **Technical skills:**\n\n${skillsList || 'React, Node.js, JavaScript, TypeScript, Python, MongoDB, Firebase'}\n\n🎓 **Languages:**\n${languagesList || 'French, English'}\n\n✨ More in **"Skills"** section!`;
    }
    
    // Projets
    else if (lowerMsg.match(/projet|project|réalisation|portfolio|travail|work|as[-\s]tu\s+fait|développé|créé/i)) {
      aiResponse = isFrench
        ? `🚀 **Projets récents :**\n\n${projectsList || '• Portfolio interactif\n• Application web moderne\n• Site e-commerce'}\n\n💡 ${projects.length > 5 ? `Et ${projects.length - 5} autres projets !` : ''}\n\n📂 Découvrez tout dans **"Projets"** !`
        : `🚀 **Recent projects:**\n\n${projectsList || '• Interactive portfolio\n• Modern web app\n• E-commerce site'}\n\n💡 ${projects.length > 5 ? `And ${projects.length - 5} more!` : ''}\n\n📂 See all in **"Projects"**!`;
    }
    
    // Contact
    else if (lowerMsg.match(/contact|email|téléphone|phone|joindre|appel|reach|écris[-\s]moi|appelle/i)) {
      const emailsList = emails.map(e => `📧 ${e}`).join('\n');
      const phonesList = phones.map(p => `📱 ${p}`).join('\n');
      const locationsList = locations.map(l => `📍 ${l}`).join('\n');
      
      aiResponse = isFrench
        ? `📞 **Me contacter :**\n\n${emailsList}\n${phonesList}\n${locationsList}\n\n💬 Formulaire disponible dans **"Contact"** !\n🗺️ Cliquez sur la localisation pour ouvrir dans Google Maps.`
        : `📞 **Contact me:**\n\n${emailsList}\n${phonesList}\n${locationsList}\n\n💬 Form available in **"Contact"**!\n🗺️ Click location to open in Google Maps.`;
    }
    
    // CV et Téléchargements
    else if (lowerMsg.match(/cv|resume|télécharge|download|curriculum|parcours/i)) {
      aiResponse = isFrench
        ? `📄 **CV et documents :**\n\nRendez-vous dans **"Téléchargements"** pour :\n• 📥 Télécharger mon CV\n• 📜 Voir mes certificats\n• 🎨 Générer un portfolio PDF personnalisé\n\n🔗 Cliquez sur **"Téléchargements"** dans le menu !`
        : `📄 **Resume & documents:**\n\nGo to **"Downloads"** for:\n• 📥 Download my resume\n• 📜 View certificates\n• 🎨 Generate custom portfolio PDF\n\n🔗 Click **"Downloads"** in menu!`;
    }
    
    // Expérience professionnelle
    else if (lowerMsg.match(/expérience|experience|travaillé|worked|poste|job|emploi|carrière|career/i)) {
      aiResponse = isFrench
        ? `💼 **Expérience professionnelle :**\n\n${experiencesList || '• Développeur Full Stack\n• Projets freelance'}\n\n📈 ${experiences.length} expérience(s) au total.\n\n✨ Détails complets dans mon CV (section **"Téléchargements"**) !`
        : `💼 **Professional experience:**\n\n${experiencesList || '• Full Stack Developer\n• Freelance projects'}\n\n📈 ${experiences.length} experience(s) total.\n\n✨ Full details in resume (**"Downloads"** section)!`;
    }
    
    // Formation
    else if (lowerMsg.match(/formation|éducation|education|diplôme|degree|étude|study|université|university|école/i)) {
      aiResponse = isFrench
        ? `🎓 **Formation :**\n\n${formationsList || '• Diplôme en Informatique'}\n\n📚 ${formations.length} formation(s) au total.\n\n✨ Parcours complet dans mon CV !`
        : `🎓 **Education:**\n\n${formationsList || '• Computer Science Degree'}\n\n📚 ${formations.length} degree(s) total.\n\n✨ Full background in resume!`;
    }
    
    // Qui es-tu / À propos
    else if (lowerMsg.match(/qui|who|présent|about|toi|you|es[-\s]tu|are\s+you|parle[-\s]moi/i)) {
      const age = settings?.profile?.birthDate 
        ? new Date().getFullYear() - new Date(settings.profile.birthDate).getFullYear()
        : '';
      
      aiResponse = isFrench
        ? `👋 **Je suis ${fullName}**\n${age ? `${age} ans, ` : ''}${settings?.profile?.gender || ''}\n${settings?.profile?.nationality || ''}\n\n💼 **Expertise :**\n• Développement web full-stack\n• ${skillsList?.split(',').slice(0, 3).join(', ')}\n\n🎯 **Mission :** Créer des solutions web innovantes et performantes !\n\n📧 Contact : ${emails[0] || 'anagueyvessannong@gmail.com'}\n\n✨ En savoir plus : section **"À propos"**`
        : `👋 **I'm ${fullName}**\n${age ? `${age} years old, ` : ''}${settings?.profile?.genderEn || ''}\n${settings?.profile?.nationalityEn || ''}\n\n💼 **Expertise:**\n• Full-stack web development\n• ${skillsList?.split(',').slice(0, 3).join(', ')}\n\n🎯 **Mission:** Create innovative web solutions!\n\n📧 Contact: ${emails[0] || 'anagueyvessannong@gmail.com'}\n\n✨ Learn more: **"About"** section`;
    }
    
    // Navigation
    else if (lowerMsg.match(/où|where|trouver|find|navigation|navigate|menu|cherche/i)) {
      aiResponse = isFrench
        ? `🧭 **Navigation du portfolio :**\n\n• 🏠 **Accueil** - Présentation complète\n• 💼 **Projets** - Réalisations (${projects.length})\n• ⚡ **Compétences** - Technologies (${skills.length})\n• 💬 **Témoignages** - Avis clients (${testimonials.length})\n• 🎓 **Formation** - Parcours académique\n• 💼 **Expérience** - Carrière professionnelle\n• 📥 **Téléchargements** - CV & documents\n• 📧 **Contact** - Me joindre\n\n💡 Que cherchez-vous précisément ?`
        : `🧭 **Portfolio navigation:**\n\n• 🏠 **Home** - Full presentation\n• 💼 **Projects** - Work (${projects.length})\n• ⚡ **Skills** - Technologies (${skills.length})\n• 💬 **Testimonials** - Reviews (${testimonials.length})\n• 🎓 **Education** - Academic background\n• 💼 **Experience** - Professional career\n• 📥 **Downloads** - Resume & docs\n• 📧 **Contact** - Reach me\n\n💡 What are you looking for?`;
    }
    
    // Centres d'intérêt
    else if (lowerMsg.match(/intérêt|interest|loisir|hobby|aime|like|passion/i)) {
      const interestsList = interests.map(i => i.name).join(', ');
      
      aiResponse = isFrench
        ? `🎨 **Centres d'intérêt :**\n\n${interestsList || 'Technologie, Innovation, Développement web'}\n\n✨ Ces passions m'inspirent dans mon travail quotidien !`
        : `🎨 **Interests:**\n\n${interestsList || 'Technology, Innovation, Web Development'}\n\n✨ These passions inspire my daily work!`;
    }
    
    // Pourquoi un chatbot
    else if (lowerMsg.match(/pourquoi|why|chatbot|assistant|ajouté|added/i)) {
      aiResponse = isFrench
        ? `🤖 **Pourquoi ce chatbot ?**\n\nJ'ai ajouté cet assistant intelligent pour :\n\n✅ **Accès rapide** - Réponses instantanées à vos questions\n✅ **Navigation facilitée** - Guide dans le portfolio\n✅ **Disponibilité 24/7** - Toujours là pour vous aider\n✅ **Expérience moderne** - Portfolio à la pointe de la technologie\n✅ **Interaction naturelle** - Conversation fluide et intuitive\n\n💬 N'hésitez pas à me poser vos questions !`
        : `🤖 **Why this chatbot?**\n\nI added this smart assistant for:\n\n✅ **Quick access** - Instant answers\n✅ **Easy navigation** - Portfolio guide\n✅ **24/7 availability** - Always here to help\n✅ **Modern experience** - Cutting-edge portfolio\n✅ **Natural interaction** - Fluid conversation\n\n💬 Feel free to ask questions!`;
    }
    
    // Témoignages
    else if (lowerMsg.match(/témoignage|testimonial|avis|review|client|recommandation/i)) {
      aiResponse = isFrench
        ? `💬 **Témoignages clients :**\n\n${testimonials.length} témoignage(s) disponible(s).\n\n✨ Découvrez ce que disent mes clients dans la section **"Témoignages"** !\n\n🌟 Satisfaction client : ${testimonials.length > 0 ? 'Excellente' : 'En cours de collecte'}`
        : `💬 **Client testimonials:**\n\n${testimonials.length} testimonial(s) available.\n\n✨ See what clients say in **"Testimonials"** section!\n\n🌟 Client satisfaction: ${testimonials.length > 0 ? 'Excellent' : 'Collecting'}`;
    }
    
    // Aide / Bonjour
    else if (lowerMsg.match(/aide|help|bonjour|hello|salut|hi|hey|comment\s+vas|how\s+are/i)) {
      aiResponse = isFrench
        ? `👋 **Bonjour ! Je suis l'assistant intelligent de ${fullName}**\n\n🤖 **Je peux vous aider avec :**\n\n✅ Compétences et technologies\n✅ Projets et réalisations\n✅ Expérience professionnelle\n✅ Formation académique\n✅ Informations de contact\n✅ Téléchargement du CV\n✅ Navigation du portfolio\n✅ Centres d'intérêt\n\n💬 **Exemples de questions :**\n• "Quelles sont tes compétences ?"\n• "Parle-moi de ton expérience"\n• "Où as-tu étudié ?"\n• "Comment te contacter ?"\n• "Montre-moi tes projets"\n\n💡 Posez votre question !`
        : `👋 **Hello! I'm ${fullName}'s smart assistant**\n\n🤖 **I can help with:**\n\n✅ Skills and technologies\n✅ Projects and achievements\n✅ Professional experience\n✅ Academic background\n✅ Contact information\n✅ Resume download\n✅ Portfolio navigation\n✅ Interests\n\n💬 **Example questions:**\n• "What are your skills?"\n• "Tell me about your experience"\n• "Where did you study?"\n• "How to contact you?"\n• "Show me your projects"\n\n💡 Ask your question!`;
    }
    
    // Réponse par défaut intelligente
    else {
      aiResponse = isFrench
        ? `🤖 **Je suis l'assistant de ${fullName}**\n\nJe n'ai pas bien compris votre question : "${message}"\n\n💡 **Je peux vous renseigner sur :**\n\n📌 Compétences techniques\n📌 Projets réalisés\n📌 Expérience professionnelle\n📌 Formation et diplômes\n📌 Langues parlées\n📌 Centres d'intérêt\n📌 Informations de contact\n📌 Téléchargement du CV\n\n💬 **Essayez par exemple :**\n• "Quelles sont tes compétences ?"\n• "Parle-moi de ton expérience"\n• "Où as-tu travaillé ?"\n• "Comment te contacter ?"\n\n🎯 Reformulez votre question ou choisissez un sujet !`
        : `🤖 **I'm ${fullName}'s assistant**\n\nI didn't quite understand: "${message}"\n\n💡 **I can help with:**\n\n📌 Technical skills\n📌 Completed projects\n📌 Professional experience\n📌 Education and degrees\n📌 Spoken languages\n📌 Interests\n📌 Contact information\n📌 Resume download\n\n💬 **Try for example:**\n• "What are your skills?"\n• "Tell me about your experience"\n• "Where did you work?"\n• "How to contact you?"\n\n🎯 Rephrase or choose a topic!`;
    }

    // ✅ SAUVEGARDE
    if (conversationId) {
      try {
        const chatRef = db.ref(`chats/${conversationId}`);
        const chatSnapshot = await chatRef.once('value');
        const existingMessages = chatSnapshot.val()?.messages || [];
        
        await chatRef.set({
          messages: [
            ...existingMessages,
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }
          ],
          updatedAt: new Date().toISOString()
        });
      } catch (saveError) {
        console.error('⚠️ Sauvegarde:', saveError.message);
      }
    }

    console.log('✅ Réponse envoyée');
    
    return res.status(200).json({
      success: true,
      response: aiResponse,
      conversationId: conversationId || Date.now().toString()
    });
    
  } catch (error) {
    console.error('❌ ERREUR:', error);
    
    const fallback = req.body?.language === 'fr'
      ? `👋 Bonjour ! Je suis l'assistant virtuel.\n\n**Je peux vous aider avec :**\n✅ Compétences\n✅ Projets\n✅ Expérience\n✅ Formation\n✅ Contact\n✅ CV\n\n💬 Posez votre question !`
      : `👋 Hello! I'm the assistant.\n\n**I can help with:**\n✅ Skills\n✅ Projects\n✅ Experience\n✅ Education\n✅ Contact\n✅ Resume\n\n💬 Ask your question!`;
    
    return res.status(200).json({
      success: true,
      response: fallback,
      conversationId: req.body?.conversationId || Date.now().toString()
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const chatRef = db.ref(`chats/${conversationId}`);
    const snapshot = await chatRef.once('value');
    const chat = snapshot.val();

    return res.status(200).json({
      success: true,
      data: chat || { messages: [] }
    });
  } catch (error) {
    console.error('❌ History:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur',
      data: { messages: [] }
    });
  }
};