export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  SKILLS: '/skills',
  TESTIMONIALS: '/testimonials', // ✅ AJOUT
  DOWNLOADS: '/downloads',
  MEDIA: '/media', // ✅ AJOUT
  LINKS: '/links', // ✅ AJOUT
  CONTACT: '/contact',
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
};

export const CATEGORIES = {
  PROJECTS: ['web', 'mobile', 'desktop', 'api', 'other'],
  SKILLS: ['frontend', 'backend', 'database', 'devops', 'tools', 'soft-skills'],
  FILES: ['cv', 'certificate', 'document', 'other'],
  LINKS: ['github', 'linkedin', 'twitter', 'portfolio', 'blog', 'other'],
};

export const FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/mov'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const TOAST_DURATION = 3000;

export const ANIMATION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
};

export const TRANSITION = {
  duration: 0.5,
  ease: 'easeOut',
};

export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
