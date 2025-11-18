import ReactGA from 'react-ga4';

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
  }

  initialize() {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (!measurementId) {
      console.warn('⚠️ Google Analytics ID non configuré');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      ReactGA.initialize(measurementId, {
        gaOptions: {
          anonymizeIp: true, // Conformité RGPD
        },
      });
      this.isInitialized = true;
      console.log('✅ Google Analytics initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation GA:', error);
    }
  }

  // Tracker une page vue
  trackPageView(path, title) {
    if (!this.isInitialized) return;

    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title,
    });
  }

  // Tracker un événement personnalisé
  trackEvent(category, action, label, value) {
    if (!this.isInitialized) return;

    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }

  // Événements spécifiques portfolio
  trackProjectView(projectTitle) {
    this.trackEvent('Projects', 'View', projectTitle);
  }

  trackDownload(fileName) {
    this.trackEvent('Downloads', 'Click', fileName);
  }

  trackContactFormSubmit() {
    this.trackEvent('Contact', 'Submit', 'Contact Form');
  }

  trackChatbotInteraction(message) {
    this.trackEvent('Chatbot', 'Message Sent', message.substring(0, 50));
  }

  trackLanguageChange(language) {
    this.trackEvent('Settings', 'Language Change', language);
  }

  trackThemeChange(theme) {
    this.trackEvent('Settings', 'Theme Change', theme);
  }

  trackError(error, context) {
    this.trackEvent('Error', context, error.message);
  }
}

export default new AnalyticsService();