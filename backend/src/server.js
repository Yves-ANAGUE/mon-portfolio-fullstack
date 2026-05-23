// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import testimonialsRoutes from './routes/testimonials.routes.js';
import filesRoutes from './routes/files.routes.js';
import mediaRoutes from './routes/media.routes.js';
import linksRoutes from './routes/links.routes.js';
import contactRoutes from './routes/contact.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import experiencesRoutes from './routes/experiences.routes.js';
import formationsRoutes from './routes/formations.routes.js';
import languagesRoutes from './routes/languages.routes.js';
import interestsRoutes from './routes/interests.routes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';
import { verifyEmailConnection } from './services/email.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

app.use(helmet({ crossOriginResourcePolicy: false }));
app.set('trust proxy', 1);

// ✅ Rate limiter : très permissif en dev, strict en production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 200, // 10000 en dev, 200 en prod
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev, // ✅ En développement, désactiver complètement le rate limit
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.includes('vercel.app') || origin.includes('localhost')) return callback(null, true);
    const allowed = [process.env.FRONTEND_URL];
    callback(null, allowed.includes(origin) || true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// Log des requêtes (dev uniquement)
if (isDev) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} | body keys: ${Object.keys(req.body || {}).join(',') || 'none'}`);
    next();
  });
}

app.get('/', (req, res) => {
  res.json({ message: '🚀 Portfolio Backend API', status: 'running', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/formations', formationsRoutes);
app.use('/api/languages', languagesRoutes);
app.use('/api/interests', interestsRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await verifyEmailConnection();
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📧 Email configuré: ${process.env.EMAIL_USER}`);
      console.log(`🔓 Rate limit: ${isDev ? 'DÉSACTIVÉ (dev)' : '200 req/15min (prod)'}`);
      console.log(`📡 Routes media: GET/ GET/:id POST/register POST/ PUT/:id DELETE/bulk DELETE/:id`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Erreur démarrage:', error);
    if (!isDev) process.exit(1);
  }
};

startServer();
export default app;
