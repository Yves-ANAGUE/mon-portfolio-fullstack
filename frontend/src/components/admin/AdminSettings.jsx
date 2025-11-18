import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Save, Loader2 } from 'lucide-react';
import authService from '../../services/auth.service';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailForm, setEmailForm] = useState({
    currentPassword: '',
    newEmail: ''
  });

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleEmailChange = (e) => {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value });
  };

  // ✅ Changer mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Mot de passe modifié avec succès !');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Changer email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailForm.currentPassword || !emailForm.newEmail) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      await authService.changeEmail(emailForm.currentPassword, emailForm.newEmail);
      toast.success('Email modifié avec succès !');
      setEmailForm({ currentPassword: '', newEmail: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de l’email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulaire email */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Mail className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Modifier l’adresse e-mail</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mettre à jour votre e-mail de connexion
            </p>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Lock className="inline-block w-4 h-4 mr-2" /> Mot de passe actuel
            </label>
            <input
              type="password"
              name="currentPassword"
              value={emailForm.currentPassword}
              onChange={handleEmailChange}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Mail className="inline-block w-4 h-4 mr-2" /> Nouvel e-mail
            </label>
            <input
              type="email"
              name="newEmail"
              value={emailForm.newEmail}
              onChange={handleEmailChange}
              className="input"
              placeholder="nouvel-email@example.com"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" /> Mettre à jour l’e-mail
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Formulaire mot de passe */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Modifier le mot de passe</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Changer votre mot de passe d’administration
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="input"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="input"
              required
              minLength={8}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" /> Modifier le mot de passe
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
