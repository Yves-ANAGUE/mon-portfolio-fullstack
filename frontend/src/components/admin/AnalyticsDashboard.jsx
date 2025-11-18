// frontend/src/components/admin/AnalyticsDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, Eye, Download, MessageCircle, 
  ExternalLink, BarChart3, Globe, Calendar 
} from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const AnalyticsDashboard = () => {
  const { t } = useLanguage();
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  // Extraire l'ID de propriété depuis le measurement ID
  const propertyId = measurementId?.replace('G-', '');

  const stats = [
    {
      icon: Users,
      label: 'Visiteurs uniques',
      description: 'Nombre de visiteurs distincts',
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      icon: Eye,
      label: 'Pages vues',
      description: 'Total de pages consultées',
      color: 'text-green-500',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      icon: Download,
      label: 'Téléchargements',
      description: 'CV et fichiers téléchargés',
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      icon: MessageCircle,
      label: 'Messages chatbot',
      description: 'Interactions avec l\'assistant IA',
      color: 'text-orange-500',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  const trackedEvents = [
    {
      icon: Eye,
      name: 'Pages visitées',
      description: 'Tracking automatique de toutes les pages',
      color: 'bg-blue-500'
    },
    {
      icon: Download,
      name: 'Téléchargements',
      description: 'Fichiers téléchargés (CV, documents)',
      color: 'bg-green-500'
    },
    {
      icon: BarChart3,
      name: 'Vues de projets',
      description: 'Clics sur les projets du portfolio',
      color: 'bg-purple-500'
    },
    {
      icon: MessageCircle,
      name: 'Messages chatbot',
      description: 'Interactions avec l\'assistant IA',
      color: 'bg-orange-500'
    },
    {
      icon: Globe,
      name: 'Changements de langue',
      description: 'Basculement FR/EN',
      color: 'bg-pink-500'
    },
    {
      icon: Calendar,
      name: 'Formulaire de contact',
      description: 'Soumissions du formulaire',
      color: 'bg-yellow-500'
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">📊 Statistiques du site</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Google Analytics 4 - Données en temps réel
            </p>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="card p-4 border-2 border-gray-200 dark:border-gray-700"
            >
              <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <h3 className="font-semibold mb-1">{stat.label}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Consultez Google Analytics pour les chiffres
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bouton vers Google Analytics */}
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center border-2 border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold">
              Consultez vos statistiques en temps réel
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Accédez à Google Analytics 4 pour voir toutes vos données détaillées : visiteurs, pages vues, taux de rebond, sources de trafic, et plus encore.
          </p>
          <a
            href={`https://analytics.google.com/analytics/web/#/p${propertyId}/reports/dashboard`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Ouvrir Google Analytics
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Événements trackés */}
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          🎯 Événements suivis automatiquement
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Ces événements sont automatiquement enregistrés dans Google Analytics
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackedEvents.map((event, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className={`w-10 h-10 rounded-lg ${event.color} flex items-center justify-center flex-shrink-0`}>
                <event.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{event.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Informations utiles */}
      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">💡 Informations utiles</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <p>
              <strong>Données en temps réel :</strong> Les statistiques apparaissent dans Google Analytics quelques minutes après les événements.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <p>
              <strong>Respect de la vie privée :</strong> Les IP sont anonymisées automatiquement (conformité RGPD).
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span>
            <p>
              <strong>Rapports disponibles :</strong> Démographie, géolocalisation, appareils, sources de trafic, comportement des utilisateurs.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">ℹ</span>
            <p>
              <strong>ID de mesure :</strong> <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{measurementId || 'Non configuré'}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Guide rapide */}
      <div className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-bold mb-4">🚀 Guide rapide Google Analytics</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">📊 Rapports principaux :</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• <strong>Temps réel</strong> : Visiteurs actuels</li>
              <li>• <strong>Vue d'ensemble</strong> : Métriques principales</li>
              <li>• <strong>Acquisition</strong> : Sources de trafic</li>
              <li>• <strong>Engagement</strong> : Pages populaires</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🎯 Métriques clés :</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• <strong>Utilisateurs</strong> : Visiteurs uniques</li>
              <li>• <strong>Sessions</strong> : Nombre de visites</li>
              <li>• <strong>Taux de rebond</strong> : % quittent rapidement</li>
              <li>• <strong>Durée moyenne</strong> : Temps passé</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
