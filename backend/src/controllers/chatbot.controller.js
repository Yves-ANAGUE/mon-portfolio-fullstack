// backend/src/controllers/chatbot.controller.js
import axios from 'axios';
import { db } from '../config/firebase.js';

export const sendMessage = async (req, res) => {
  try {
    const { message, conversationId, language = 'fr' } = req.body;

    console.log('📨 Chatbot - Message:', message, '| Langue:', language);

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message requis',
        response: language === 'fr' 
          ? 'Veuillez écrire un message.' 
          : 'Please write a message.'
      });
    }

    // ✅ Charger TOUTES les données nécessaires
    let settings = null;
    let projects = [];
    let skills = [];
    let experiences = [];
    let formations = [];

    try {
      const [settingsSnap, projectsSnap, skillsSnap] = await Promise.all([
        db.ref('settings').once('value'),
        db.ref('projects').once('value'),
        db.ref('skills').once('value')
      ]);

      settings = settingsSnap.val();
      
      const projectsData = projectsSnap.val();
      if (projectsData) {
        projects = Object.values(projectsData);
        // ✅ Trier par date décroissante (plus récents d'abord)
        projects.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
      }
      
      const skillsData = skillsSnap.val();
      if (skillsData) {
        skills = Object.values(skillsData);
      }

      experiences = settings?.experiences || [];
      formations = settings?.formations || [];

      console.log('✅ Données chargées:', { 
        hasSettings: !!settings, 
        projectsCount: projects.length, 
        skillsCount: skills.length,
        experiencesCount: experiences.length,
        formationsCount: formations.length
      });
    } catch (dbError) {
      console.error('⚠️ Firebase error:', dbError.message);
    }

    // ✅ Contexte enrichi avec TOUS les projets récents
    const projectsList = projects.slice(0, 10)
      .map(p => {
        const techs = Array.isArray(p.technologies) ? p.technologies.join(', ') : 
                      typeof p.technologies === 'object' ? Object.values(p.technologies).join(', ') : '';
        return `📌 ${p.title} (${p.date ? new Date(p.date).getFullYear() : 'Récent'})\n   Description: ${p.description || 'Projet web'}\n   Technologies: ${techs || 'N/A'}`;
      })
      .join('\n\n');
    
    // ✅ Liste complète des compétences par catégorie
    const skillsByCategory = skills.reduce((acc, s) => {
      const cat = s.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(`${s.name}${s.level ? ` (${s.level}%)` : ''}`);
      return acc;
    }, {});

    const skillsList = Object.entries(skillsByCategory)
      .map(([cat, skillsInCat]) => {
        const catName = cat === 'frontend' ? 'Frontend' :
                        cat === 'backend' ? 'Backend' :
                        cat === 'database' ? 'Bases de données' :
                        cat === 'devops' ? 'DevOps' :
                        cat === 'tools' ? 'Outils' :
                        cat === 'soft-skills' ? 'Soft Skills' : 'Autres';
        return `🔹 ${catName}:\n   ${skillsInCat.join(', ')}`;
      })
      .join('\n\n');

    // ✅ Expériences professionnelles
    const experiencesList = experiences.slice(0, 5)
      .map(e => `💼 ${e.position || e.title} chez ${e.company}\n   Période: ${e.startDate || ''} - ${e.endDate || 'Présent'}\n   ${e.description || ''}`)
      .join('\n\n');

    // ✅ Formations
    const formationsList = formations.slice(0, 3)
      .map(f => `🎓 ${f.degree || f.title}\n   ${f.school || f.institution} (${f.year || ''})`)
      .join('\n\n');

    const fullName = settings?.profile?.fullName || 'un développeur';
    const title = language === 'fr' 
      ? (settings?.profile?.titlesFr?.[0] || settings?.profile?.title || 'Développeur Full Stack')
      : (settings?.profile?.titlesEn?.[0] || settings?.profile?.titleEn || 'Full Stack Developer');
    const email = settings?.profile?.email || 'Non disponible';
    const phone = settings?.profile?.phone || 'Non disponible';
    const location = language === 'fr' 
      ? (settings?.profile?.location || 'Non spécifié')
      : (settings?.profile?.locationEn || 'Not specified');

    const systemPrompt = language === 'fr' 
      ? `Tu es l'assistant virtuel du portfolio de ${fullName}.

📋 INFORMATIONS PERSONNELLES:
- Nom complet: ${fullName}
- Titre: ${title}
- Email: ${email}
- Téléphone: ${phone}
- Localisation: ${location}

💼 EXPÉRIENCES PROFESSIONNELLES:
${experiencesList || 'Aucune expérience enregistrée'}

🎓 FORMATIONS:
${formationsList || 'Aucune formation enregistrée'}

🛠️ COMPÉTENCES TECHNIQUES (${skills.length} au total):
${skillsList || 'React, Node.js, JavaScript, TypeScript, MongoDB, PostgreSQL'}

🚀 PROJETS RÉALISÉS (${projects.length} au total - Tri: plus récents d'abord):
${projectsList || '- Portfolio interactif\n- Applications web modernes'}

📌 INSTRUCTIONS IMPORTANTES:
- Tu dois être naturel, amical et professionnel
- Cite les projets du PLUS RÉCENT au PLUS ANCIEN
- Pour les compétences, groupe par catégorie (Frontend, Backend, etc.)
- Si demandé "où as-tu travaillé", cite les EXPÉRIENCES, pas les projets
- Donne des descriptions COMPLÈTES, ne coupe jamais les phrases
- Si tu cites plusieurs projets, décris chacun complètement
- N'utilise JAMAIS "Et X autres projets" - cite tous ceux demandés
- Réponds aux salutations de manière amicale (Bonjour, Bonsoir, etc.)

Réponds en français de façon concise, complète et professionnelle.`
      : `You are ${fullName}'s virtual portfolio assistant.

📋 PERSONAL INFO:
- Full Name: ${fullName}
- Title: ${title}
- Email: ${email}
- Phone: ${phone}
- Location: ${location}

💼 PROFESSIONAL EXPERIENCE:
${experiencesList || 'No experience recorded'}

🎓 EDUCATION:
${formationsList || 'No education recorded'}

🛠️ TECHNICAL SKILLS (${skills.length} total):
${skillsList || 'React, Node.js, JavaScript, TypeScript, MongoDB, PostgreSQL'}

🚀 COMPLETED PROJECTS (${projects.length} total - Sorted: most recent first):
${projectsList || '- Interactive portfolio\n- Modern web applications'}

📌 IMPORTANT INSTRUCTIONS:
- Be natural, friendly and professional
- Cite projects from MOST RECENT to OLDEST
- For skills, group by category (Frontend, Backend, etc.)
- If asked "where did you work", cite EXPERIENCES, not projects
- Give COMPLETE descriptions, never cut sentences
- If citing multiple projects, describe each completely
- NEVER use "And X other projects" - cite all requested
- Respond to greetings in a friendly way (Hello, Good evening, etc.)

Respond in English concisely, completely and professionally.`;

    let aiResponse = null;
    
    // ✅ API Groq
    const groqKey = process.env.GROQ_API_KEY;
    
    if (groqKey && groqKey.startsWith('gsk_')) {
      try {
        console.log('🤖 Calling Groq API...');
        
        const groqResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-70b-8192',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );

        if (groqResponse.data?.choices?.[0]?.message?.content) {
          aiResponse = groqResponse.data.choices[0].message.content;
          console.log('✅ Groq API response received');
        } else {
          console.log('⚠️ Groq response invalid format');
        }
        
      } catch (apiError) {
        console.error('❌ Groq API error:', {
          status: apiError.response?.status,
          message: apiError.response?.data?.error?.message || apiError.message
        });
      }
    } else {
      console.log('⚠️ Groq API key missing or invalid');
    }

    // ✅ FALLBACK intelligent amélioré
    if (!aiResponse) {
      console.log('🔄 Using intelligent fallback');
      
      const lowerMsg = message.toLowerCase();
      
      // ✅ Salutations
      if (lowerMsg.match(/^(bonjour|bonsoir|salut|hello|hi|hey|coucou)\s*[!?.]?$/i)) {
        aiResponse = language === 'fr'
          ? `👋 ${lowerMsg.includes('soir') ? 'Bonsoir' : 'Bonjour'} ! Je suis l'assistant virtuel de ${fullName}.\n\n💬 **Je peux vous aider avec :**\n• Les compétences techniques (${skills.length} au total)\n• Les projets réalisés (${projects.length} projets)\n• Les expériences professionnelles\n• Les coordonnées de contact\n\nQue souhaitez-vous savoir ? 😊`
          : `👋 ${lowerMsg.includes('evening') ? 'Good evening' : 'Hello'}! I'm ${fullName}'s virtual assistant.\n\n💬 **I can help you with:**\n• Technical skills (${skills.length} total)\n• Completed projects (${projects.length} projects)\n• Professional experience\n• Contact information\n\nWhat would you like to know? 😊`;
      }
      // ✅ Compétences
      else if (lowerMsg.match(/compétence|skill|technologie|technology|stack|maîtrise|sais faire|quelles.*compétences/i)) {
        aiResponse = language === 'fr'
          ? `💼 **Compétences techniques de ${fullName}:**\n\n${skillsList}\n\n**Total:** ${skills.length} compétences\n\n✨ Pour plus de détails, consultez la section "Compétences" du portfolio !`
          : `💼 **${fullName}'s technical skills:**\n\n${skillsList}\n\n**Total:** ${skills.length} skills\n\n✨ For more details, check the "Skills" section!`;
      }
      // ✅ Projets (avec descriptions complètes)
      else if (lowerMsg.match(/projet|project|réalisation|portfolio|travaux|what.*built|quels.*projets/i)) {
        const recentProjects = projects.slice(0, 5).map(p => {
          const techs = Array.isArray(p.technologies) ? p.technologies.join(', ') : 
                        typeof p.technologies === 'object' ? Object.values(p.technologies).join(', ') : '';
          return `\n📌 **${p.title}** ${p.date ? `(${new Date(p.date).getFullYear()})` : ''}\n${p.description || 'Projet web moderne'}\n🔧 Technologies: ${techs || 'Diverses technologies web'}\n${p.url ? `🔗 Lien: ${p.url}` : ''}`;
        }).join('\n');
        
        aiResponse = language === 'fr'
          ? `🚀 **Projets récents de ${fullName}:**${recentProjects}\n\n**Total:** ${projects.length} projet(s) réalisé(s)\n\n📂 Découvrez tous les projets dans la section "Projets" !`
          : `🚀 **Recent projects by ${fullName}:**${recentProjects}\n\n**Total:** ${projects.length} completed project(s)\n\n📂 See all projects in the "Projects" section!`;
      }
      // ✅ Expériences professionnelles
      else if (lowerMsg.match(/où.*travaillé|expérience|where.*worked|worked.*where|emploi|poste/i)) {
        const expList = experiences.slice(0, 5).map(e => 
          `\n💼 **${e.position || e.title}** chez ${e.company}\n📅 ${e.startDate || ''} - ${e.endDate || 'Présent'}\n📍 ${e.location || ''}\n${e.description || ''}`
        ).join('\n');
        
        aiResponse = language === 'fr'
          ? `💼 **Expériences professionnelles:**${expList || '\n\nAucune expérience professionnelle enregistrée pour le moment.'}\n\n${experiences.length > 5 ? `\n... et ${experiences.length - 5} autre(s) expérience(s)` : ''}`
          : `💼 **Professional experience:**${expList || '\n\nNo professional experience recorded yet.'}\n\n${experiences.length > 5 ? `\n... and ${experiences.length - 5} other experience(s)` : ''}`;
      }
      // ✅ Contact
      else if (lowerMsg.match(/contact|email|téléphone|phone|joindre|reach|coordonnées/i)) {
        aiResponse = language === 'fr'
          ? `📧 **Coordonnées de contact:**\n\n📬 Email: ${email}\n📱 Téléphone: ${phone}\n📍 Localisation: ${location}\n\n💬 Vous pouvez également utiliser le formulaire de contact disponible dans la section "Contact" !`
          : `📧 **Contact information:**\n\n📬 Email: ${email}\n📱 Phone: ${phone}\n📍 Location: ${location}\n\n💬 You can also use the contact form in the "Contact" section!`;
      }
      // ✅ CV / Téléchargements
      else if (lowerMsg.match(/cv|curriculum|resume|télécharge|download|document/i)) {
        aiResponse = language === 'fr'
          ? `📄 **Téléchargements disponibles:**\n\n✅ Vous pouvez télécharger le CV et autres documents dans la section "Téléchargements"\n\n💡 Astuce: Cette section permet aussi de générer un portfolio PDF complet automatiquement !`
          : `📄 **Available downloads:**\n\n✅ You can download the resume and other documents in the "Downloads" section\n\n💡 Tip: This section also allows you to generate a complete PDF portfolio automatically!`;
      }
      // ✅ Navigation générale
      else if (lowerMsg.match(/où|where|trouver|find|section|page|navigate/i)) {
        aiResponse = language === 'fr'
          ? `🧭 **Navigation du portfolio:**\n\n• **Accueil** - Présentation générale et résumé\n• **Projets** (${projects.length}) - Tous mes projets avec filtres et tri\n• **Compétences** (${skills.length}) - Technologies et outils maîtrisés\n• **Témoignages** - Avis de clients et collaborateurs\n• **Médias** - Galerie d'images et vidéos\n• **Liens** - Profils sociaux et ressources\n• **Téléchargements** - CV et documents\n• **Contact** - Formulaire pour me joindre\n\nQue cherchez-vous exactement ?`
          : `🧭 **Portfolio navigation:**\n\n• **Home** - General presentation\n• **Projects** (${projects.length}) - All projects with filters\n• **Skills** (${skills.length}) - Technologies and tools\n• **Testimonials** - Client reviews\n• **Media** - Image and video gallery\n• **Links** - Social profiles\n• **Downloads** - Resume and docs\n• **Contact** - Contact form\n\nWhat are you looking for?`;
      }
      // ✅ Aide générale
      else {
        aiResponse = language === 'fr'
          ? `💡 **Je peux vous renseigner sur:**\n\n📌 **Compétences** techniques (${skills.length} compétences)\n📌 **Projets** réalisés (${projects.length} projets)\n📌 **Expériences** professionnelles ${experiences.length > 0 ? `(${experiences.length} expériences)` : ''}\n📌 **Contact** et coordonnées\n📌 **Navigation** dans le portfolio\n\n💬 **Exemples de questions:**\n• "Quelles sont tes compétences ?"\n• "Montre-moi les projets récents"\n• "Où as-tu travaillé ?"\n• "Comment te contacter ?"\n\nQuelle est votre question ?`
          : `💡 **I can help with:**\n\n📌 Technical **skills** (${skills.length} skills)\n📌 Completed **projects** (${projects.length} projects)\n📌 Professional **experience** ${experiences.length > 0 ? `(${experiences.length} experiences)` : ''}\n📌 **Contact** information\n📌 Portfolio **navigation**\n\n💬 **Example questions:**\n• "What are your skills?"\n• "Show me recent projects"\n• "Where have you worked?"\n• "How to contact you?"\n\nWhat's your question?`;
      }
    }

    // ✅ Sauvegarde conversation
    if (conversationId) {
      try {
        const chatRef = db.ref(`chats/${conversationId}`);
        const chatSnapshot = await chatRef.once('value');
        const existingMessages = chatSnapshot.val()?.messages || [];
        
        await chatRef.set({
          messages: [
            ...existingMessages,
            { 
              role: 'user', 
              content: message, 
              timestamp: new Date().toISOString() 
            },
            { 
              role: 'assistant', 
              content: aiResponse, 
              timestamp: new Date().toISOString() 
            }
          ],
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Conversation saved');
      } catch (saveError) {
        console.error('⚠️ Save error:', saveError.message);
      }
    }

    console.log('✅ Response sent to client');
    
    return res.status(200).json({
      success: true,
      response: aiResponse,
      conversationId: conversationId || Date.now().toString()
    });
    
  } catch (error) {
    console.error('❌ CHATBOT ERROR:', error);
    
    const errorResponse = req.body?.language === 'fr'
      ? `👋 Bonjour ! Je suis l'assistant virtuel.\n\nJe peux répondre à vos questions sur:\n• Compétences techniques\n• Projets réalisés\n• Expériences professionnelles\n• Informations de contact\n\n💬 Que puis-je faire pour vous ?`
      : `👋 Hello! I'm the virtual assistant.\n\nI can answer questions about:\n• Technical skills\n• Completed projects\n• Professional experience\n• Contact information\n\n💬 How can I help?`;
    
    return res.status(200).json({
      success: true,
      response: errorResponse,
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
    console.error('❌ History error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur récupération historique',
      data: { messages: [] }
    });
  }
};
