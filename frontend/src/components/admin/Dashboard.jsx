// frontend/src/components/admin/Dashboard.jsx - MISE À JOUR
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, FolderOpen, Award, MessageSquare, FileText, 
  Image, Link, Mail, Settings as SettingsIcon, TrendingUp, 
  Briefcase, GraduationCap, Globe, Heart, LogOut 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProjectsManager from './ProjectsManager';
import SkillsManager from './SkillsManager';
import TestimonialsManager from './TestimonialsManager';
import FilesManager from './FilesManager';
import MediaManager from './MediaManager';
import LinksManager from './LinksManager';
import ContactsManager from './ContactsManager';
import SettingsManager from './SettingsManager';
import AdminSettings from './AdminSettings';
import AnalyticsDashboard from './AnalyticsDashboard';
import ExperiencesManager from './ExperiencesManager'; // ✅ NOUVEAU
import FormationsManager from './FormationsManager'; // ✅ NOUVEAU
import LanguagesManager from './LanguagesManager'; // ✅ NOUVEAU
import InterestsManager from './InterestsManager'; // ✅ NOUVEAU
import { ROUTES } from '../../utils/constants';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'analytics', label: 'Statistiques 📊', icon: TrendingUp },
    { id: 'projects', label: 'Projets', icon: FolderOpen },
    { id: 'skills', label: 'Compétences', icon: Award },
    { id: 'experiences', label: 'Expériences', icon: Briefcase }, // ✅ NOUVEAU
    { id: 'formations', label: 'Formations', icon: GraduationCap }, // ✅ NOUVEAU
    { id: 'languages', label: 'Langues', icon: Globe }, // ✅ NOUVEAU
    { id: 'interests', label: 'Centres d\'intérêt', icon: Heart }, // ✅ NOUVEAU
    { id: 'testimonials', label: 'Témoignages', icon: MessageSquare },
    { id: 'files', label: 'Fichiers', icon: FileText },
    { id: 'media', label: 'Médias', icon: Image },
    { id: 'links', label: 'Liens', icon: Link },
    { id: 'contacts', label: 'Messages', icon: Mail },
    { id: 'settings', label: 'Paramètres Site', icon: SettingsIcon },
    { id: 'admin-settings', label: 'Paramètres Admin', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardOverview />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'projects': return <ProjectsManager />;
      case 'skills': return <SkillsManager />;
      case 'experiences': return <ExperiencesManager />; // ✅ NOUVEAU
      case 'formations': return <FormationsManager />; // ✅ NOUVEAU
      case 'languages': return <LanguagesManager />; // ✅ NOUVEAU
      case 'interests': return <InterestsManager />; // ✅ NOUVEAU
      case 'testimonials': return <TestimonialsManager />;
      case 'files': return <FilesManager />;
      case 'media': return <MediaManager />;
      case 'links': return <LinksManager />;
      case 'contacts': return <ContactsManager />;
      case 'settings': return <SettingsManager />;
      case 'admin-settings': return <AdminSettings />;
      default: return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-custom py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord Admin</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Bienvenue, {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-outline flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4 space-y-2 sticky top-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Overview mis à jour
const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-4">Vue d'ensemble</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Bienvenue dans votre tableau de bord. Utilisez le menu à gauche pour gérer votre portfolio.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2">📊 Statistiques</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consultez vos stats Google Analytics
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold mb-2">💼 Profil Complet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expériences, formations, langues, centres d'intérêt
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h3 className="font-semibold mb-2">🤖 Chatbot IA</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Assistant intelligent avec toutes vos données
            </p>
          </div>
        </div>
      </div>

      {/* Guide rapide */}
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">🚀 Guide rapide</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <div>
              <p className="font-semibold">Remplissez votre profil</p>
              <p className="text-gray-600 dark:text-gray-400">
                Allez dans "Paramètres Site" pour configurer vos informations personnelles complètes
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <div>
              <p className="font-semibold">Ajoutez vos expériences</p>
              <p className="text-gray-600 dark:text-gray-400">
                Complétez votre parcours professionnel et académique
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <div>
              <p className="font-semibold">Gérez vos compétences</p>
              <p className="text-gray-600 dark:text-gray-400">
                Ajoutez vos compétences techniques et langues parlées
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-2xl">4️⃣</span>
            <div>
              <p className="font-semibold">Testez le chatbot</p>
              <p className="text-gray-600 dark:text-gray-400">
                Le chatbot utilise toutes vos données pour répondre intelligemment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;