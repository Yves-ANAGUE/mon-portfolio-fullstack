// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import testimonialsRoutes from './routes/testimonials.routes.js';
import filesRoutes from './routes/files.routes.js';
import mediaRoutes from './routes/media.routes.js';
import linksRoutes from './routes/links.routes.js';
import contactRoutes from './routes/contact.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js'; // ✅ DÉJÀ IMPORTÉ
import experiencesRoutes from './routes/experiences.routes.js';
import formationsRoutes from './routes/formations.routes.js';
import languagesRoutes from './routes/languages.routes.js';
import interestsRoutes from './routes/interests.routes.js';


// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { verifyEmailConnection } from './services/email.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});

app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'https://www.mon-portfolio-fullstack-anague-yves.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chatbot', chatbotRoutes); // ✅ AJOUTEZ CETTE LIGNE
app.use('/api/experiences', experiencesRoutes); // ✅ NOUVEAU
app.use('/api/formations', formationsRoutes); // ✅ NOUVEAU
app.use('/api/languages', languagesRoutes); // ✅ NOUVEAU
app.use('/api/interests', interestsRoutes); // ✅ NOUVEAU

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await verifyEmailConnection();
    
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📧 Email configuré: ${process.env.EMAIL_USER}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;