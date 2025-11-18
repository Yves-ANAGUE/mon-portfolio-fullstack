import { useState, useEffect } from 'react';
import { Save, Upload, User } from 'lucide-react';
import settingsService from '../../services/settings.service';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const SettingsManager = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsService.get();
      setSettings(response.data);
      if (response.data?.profile?.photo) {
        setPhotoPreview(response.data.profile.photo);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const updateProfile = (field, value) => {
    setSettings({
      ...settings,
      profile: { ...settings.profile, [field]: value }
    });
  };

  const updateSocials = (field, value) => {
    setSettings({
      ...settings,
      socials: { ...settings.socials, [field]: value }
    });
  };

  const updateFooter = (field, value) => {
    setSettings({
      ...settings,
      footer: { ...settings.footer, [field]: value }
    });
  };

  const updateHomePage = (field, value) => {
    setSettings({
      ...settings,
      homePage: { ...settings.homePage, [field]: value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('profile', JSON.stringify(settings.profile));
      formData.append('socials', JSON.stringify(settings.socials));
      formData.append('footer', JSON.stringify(settings.footer));
      formData.append('homePage', JSON.stringify(settings.homePage));
      
      if (photoFile) {
        formData.append('image', photoFile);
      }

      await settingsService.update(formData);
      toast.success('Paramètres enregistrés !');
      fetchSettings();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  // Initialiser homePage si n'existe pas
  if (!settings.homePage) {
    settings.homePage = {
      cleanCodeTitleFr: 'Clean Code',
      cleanCodeTitleEn: 'Clean Code',
      cleanCodeDescFr: 'J\'écris du code propre, maintenable et bien documenté.',
      cleanCodeDescEn: 'I write clean, maintainable, and well-documented code.',
      creativeDesignTitleFr: 'Design créatif',
      creativeDesignTitleEn: 'Creative Design',
      creativeDesignDescFr: 'Je crée des interfaces modernes et intuitives.',
      creativeDesignDescEn: 'I create modern and intuitive interfaces.',
      performanceTitleFr: 'Performance',
      performanceTitleEn: 'Performance',
      performanceDescFr: 'J\'optimise chaque aspect pour des performances maximales.',
      performanceDescEn: 'I optimize every aspect for maximum performance.',
      collaborationTitleFr: 'Collaboration',
      collaborationTitleEn: 'Collaboration',
      collaborationDescFr: 'Je travaille efficacement en équipe et communique clairement.',
      collaborationDescEn: 'I work effectively in teams and communicate clearly.'
    };
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">⚙️ Paramètres du site</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photo de profil */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4">📸 Photo de profil</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <label className="btn btn-secondary cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              Changer la photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        {/* 👤 Informations Personnelles Complètes */}
<div className="card p-6">
  <h3 className="text-xl font-bold mb-4">👤 Informations Personnelles Complètes</h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Nom complet */}
    <div>
      <label className="block text-sm font-medium mb-2">Nom complet *</label>
      <input
        type="text"
        value={settings.profile?.fullName || ''}
        onChange={(e) => updateProfile('fullName', e.target.value)}
        className="input"
        required
      />
    </div>

    {/* Date de naissance */}
    <div>
      <label className="block text-sm font-medium mb-2">Date de naissance</label>
      <input
        type="date"
        value={settings.profile?.birthDate || ''}
        onChange={(e) => updateProfile('birthDate', e.target.value)}
        className="input"
      />
    </div>

    {/* Genre */}
    <div>
      <label className="block text-sm font-medium mb-2">Genre (FR)</label>
      <select
        value={settings.profile?.gender || ''}
        onChange={(e) => updateProfile('gender', e.target.value)}
        className="input"
      >
        <option value="">Sélectionner</option>
        <option value="Homme">Homme</option>
        <option value="Femme">Femme</option>
        <option value="Non-binaire">Non-binaire</option>
        <option value="Préfère ne pas dire">Préfère ne pas dire</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Genre (EN)</label>
      <select
        value={settings.profile?.genderEn || ''}
        onChange={(e) => updateProfile('genderEn', e.target.value)}
        className="input"
      >
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Non-binary">Non-binary</option>
        <option value="Prefer not to say">Prefer not to say</option>
      </select>
    </div>

    {/* Nationalité */}
    <div>
      <label className="block text-sm font-medium mb-2">Nationalité (FR)</label>
      <input
        type="text"
        value={settings.profile?.nationality || ''}
        onChange={(e) => updateProfile('nationality', e.target.value)}
        className="input"
        placeholder="Camerounaise"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Nationalité (EN)</label>
      <input
        type="text"
        value={settings.profile?.nationalityEn || ''}
        onChange={(e) => updateProfile('nationalityEn', e.target.value)}
        className="input"
        placeholder="Cameroonian"
      />
    </div>

    {/* Statut matrimonial */}
    <div>
      <label className="block text-sm font-medium mb-2">Statut matrimonial (FR)</label>
      <select
        value={settings.profile?.maritalStatus || ''}
        onChange={(e) => updateProfile('maritalStatus', e.target.value)}
        className="input"
      >
        <option value="">Sélectionner</option>
        <option value="Célibataire">Célibataire</option>
        <option value="Marié(e)">Marié(e)</option>
        <option value="Divorcé(e)">Divorcé(e)</option>
        <option value="Veuf/Veuve">Veuf/Veuve</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Statut matrimonial (EN)</label>
      <select
        value={settings.profile?.maritalStatusEn || ''}
        onChange={(e) => updateProfile('maritalStatusEn', e.target.value)}
        className="input"
      >
        <option value="">Select</option>
        <option value="Single">Single</option>
        <option value="Married">Married</option>
        <option value="Divorced">Divorced</option>
        <option value="Widowed">Widowed</option>
      </select>
    </div>
  </div>

  {/* Permis de conduire */}
  <div className="mt-4">
    <label className="block text-sm font-medium mb-2">Permis de conduire</label>
    <input
      type="text"
      value={settings.profile?.drivingLicenses ? settings.profile.drivingLicenses.join(', ') : ''}
      onChange={(e) =>
        updateProfile('drivingLicenses', e.target.value.split(',').map((v) => v.trim()))
      }
      className="input"
      placeholder="Permis B, Permis A (séparés par virgules)"
    />
  </div>
</div>

{/* ✅ NOUVELLE SECTION: Emails multiples */}
<div className="card p-6">
  <h3 className="text-xl font-bold mb-4">📧 Adresses Email</h3>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
    Ajoutez plusieurs emails (un par ligne)
  </p>
  <textarea
    value={settings.profile?.emails ? settings.profile.emails.join('\n') : ''}
    onChange={(e) =>
      updateProfile('emails', e.target.value.split('\n').filter(Boolean))
    }
    className="textarea"
    rows={4}
    placeholder={`email1@example.com
email2@example.com`}
  />
</div>

{/* ✅ NOUVELLE SECTION: Téléphones multiples */}
<div className="card p-6">
  <h3 className="text-xl font-bold mb-4">📱 Numéros de téléphone</h3>
  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
    Ajoutez plusieurs numéros (un par ligne)
  </p>
  <textarea
    value={settings.profile?.phones ? settings.profile.phones.join('\n') : ''}
    onChange={(e) =>
      updateProfile('phones', e.target.value.split('\n').filter(Boolean))
    }
    className="textarea"
    rows={3}
    placeholder={`+33 6 12 34 56 78
+33 7 98 76 54 32`}
  />
</div>

{/* ✅ NOUVELLE SECTION: Localisations multiples */}
<div className="card p-6">
  <h3 className="text-xl font-bold mb-4">📍 Localisations</h3>

  <div className="mb-4">
    <label className="block text-sm font-medium mb-2">
      Localisations (FR) - une par ligne
    </label>
    <textarea
      value={settings.profile?.locations ? settings.profile.locations.join('\n') : ''}
      onChange={(e) =>
        updateProfile('locations', e.target.value.split('\n').filter(Boolean))
      }
      className="textarea"
      rows={3}
      placeholder={`Paris, France
Lyon, France`}
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      Localisations (EN) - une par ligne
    </label>
    <textarea
      value={settings.profile?.locationsEn ? settings.profile.locationsEn.join('\n') : ''}
      onChange={(e) =>
        updateProfile('locationsEn', e.target.value.split('\n').filter(Boolean))
      }
      className="textarea"
      rows={3}
      placeholder={`Paris, France
Lyon, France`}
    />
  </div>
</div>



        {/* Présentation principale */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4">🎯 Présentation (Hero Section)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre professionnel (FR) *</label>
              <input
                type="text"
                value={settings.profile?.title || ''}
                onChange={(e) => updateProfile('title', e.target.value)}
                className="input"
                placeholder="Développeur Full Stack"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Titre professionnel (EN) *</label>
              <input
                type="text"
                value={settings.profile?.titleEn || ''}
                onChange={(e) => updateProfile('titleEn', e.target.value)}
                className="input"
                placeholder="Full Stack Developer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description courte (FR) *</label>
              <textarea
                value={settings.profile?.description || ''}
                onChange={(e) => updateProfile('description', e.target.value)}
                className="textarea"
                rows={2}
                placeholder="Passionné par la création d'expériences web innovantes"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description courte (EN) *</label>
              <textarea
                value={settings.profile?.descriptionEn || ''}
                onChange={(e) => updateProfile('descriptionEn', e.target.value)}
                className="textarea"
                rows={2}
                placeholder="Passionate about creating innovative web experiences"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">À propos - texte complet (FR) *</label>
              <textarea
                value={settings.profile?.aboutFr || ''}
                onChange={(e) => updateProfile('aboutFr', e.target.value)}
                className="textarea"
                rows={4}
                placeholder="Développeur passionné avec plusieurs années d'expérience..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">À propos - texte complet (EN) *</label>
              <textarea
                value={settings.profile?.aboutEn || ''}
                onChange={(e) => updateProfile('aboutEn', e.target.value)}
                className="textarea"
                rows={4}
                placeholder="Passionate developer with several years of experience..."
                required
              />
            </div>
          </div>
        </div>

        {/* Cartes compétences page d'accueil */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4">💼 Cartes de compétences (Page d'accueil)</h3>
          <div className="space-y-6">
            {/* Clean Code */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold mb-3">🔵 Clean Code</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (FR)</label>
                  <input type="text" value={settings.homePage?.cleanCodeTitleFr || ''} onChange={(e) => updateHomePage('cleanCodeTitleFr', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (EN)</label>
                  <input type="text" value={settings.homePage?.cleanCodeTitleEn || ''} onChange={(e) => updateHomePage('cleanCodeTitleEn', e.target.value)} className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (FR)</label>
                  <textarea value={settings.homePage?.cleanCodeDescFr || ''} onChange={(e) => updateHomePage('cleanCodeDescFr', e.target.value)} className="textarea" rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (EN)</label>
                  <textarea value={settings.homePage?.cleanCodeDescEn || ''} onChange={(e) => updateHomePage('cleanCodeDescEn', e.target.value)} className="textarea" rows={2} />
                </div>
              </div>
            </div>

            {/* Design créatif */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold mb-3">🟣 Design créatif</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (FR)</label>
                  <input type="text" value={settings.homePage?.creativeDesignTitleFr || ''} onChange={(e) => updateHomePage('creativeDesignTitleFr', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (EN)</label>
                  <input type="text" value={settings.homePage?.creativeDesignTitleEn || ''} onChange={(e) => updateHomePage('creativeDesignTitleEn', e.target.value)} className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (FR)</label>
                  <textarea value={settings.homePage?.creativeDesignDescFr || ''} onChange={(e) => updateHomePage('creativeDesignDescFr', e.target.value)} className="textarea" rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (EN)</label>
                  <textarea value={settings.homePage?.creativeDesignDescEn || ''} onChange={(e) => updateHomePage('creativeDesignDescEn', e.target.value)} className="textarea" rows={2} />
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold mb-3">🟡 Performance</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (FR)</label>
                  <input type="text" value={settings.homePage?.performanceTitleFr || ''} onChange={(e) => updateHomePage('performanceTitleFr', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (EN)</label>
                  <input type="text" value={settings.homePage?.performanceTitleEn || ''} onChange={(e) => updateHomePage('performanceTitleEn', e.target.value)} className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (FR)</label>
                  <textarea value={settings.homePage?.performanceDescFr || ''} onChange={(e) => updateHomePage('performanceDescFr', e.target.value)} className="textarea" rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (EN)</label>
                  <textarea value={settings.homePage?.performanceDescEn || ''} onChange={(e) => updateHomePage('performanceDescEn', e.target.value)} className="textarea" rows={2} />
                </div>
              </div>
            </div>

            {/* Collaboration */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold mb-3">🟢 Collaboration</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (FR)</label>
                  <input type="text" value={settings.homePage?.collaborationTitleFr || ''} onChange={(e) => updateHomePage('collaborationTitleFr', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titre (EN)</label>
                  <input type="text" value={settings.homePage?.collaborationTitleEn || ''} onChange={(e) => updateHomePage('collaborationTitleEn', e.target.value)} className="input" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (FR)</label>
                  <textarea value={settings.homePage?.collaborationDescFr || ''} onChange={(e) => updateHomePage('collaborationDescFr', e.target.value)} className="textarea" rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description (EN)</label>
                  <textarea value={settings.homePage?.collaborationDescEn || ''} onChange={(e) => updateHomePage('collaborationDescEn', e.target.value)} className="textarea" rows={2} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Réseaux sociaux */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4">🌐 Réseaux sociaux</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">GitHub</label>
              <input type="url" value={settings.socials?.github || ''} onChange={(e) => updateSocials('github', e.target.value)} className="input" placeholder="https://github.com/Yves-ANAGUE" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn</label>
              <input type="url" value={settings.socials?.linkedin || ''} onChange={(e) => updateSocials('linkedin', e.target.value)} className="input" placeholder="https://www.linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Twitter/X</label>
              <input type="url" value={settings.socials?.twitter || ''} onChange={(e) => updateSocials('twitter', e.target.value)} className="input" placeholder="https://x.com/yvess_n_c" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4">📄 Pied de page (Footer)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Description (FR) *</label>
              <textarea value={settings.footer?.descriptionFr || ''} onChange={(e) => updateFooter('descriptionFr', e.target.value)} className="textarea" rows={3} placeholder="Développeur Full Stack passionné..." required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description (EN) *</label>
              <textarea value={settings.footer?.descriptionEn || ''} onChange={(e) => updateFooter('descriptionEn', e.target.value)} className="textarea" rows={3} placeholder="Full Stack Developer passionate..." required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Copyright (FR) *</label>
              <input type="text" value={settings.footer?.copyright || ''} onChange={(e) => updateFooter('copyright', e.target.value)} className="input" placeholder="© 2025 Portfolio. Tous droits réservés." required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Copyright (EN) *</label>
              <input type="text" value={settings.footer?.copyrightEn || ''} onChange={(e) => updateFooter('copyrightEn', e.target.value)} className="input" placeholder="© 2025 Portfolio. All rights reserved." required />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary w-full md:w-auto sticky bottom-4 shadow-lg">
          <Save className="w-5 h-5 mr-2" />
          {saving ? '💾 Enregistrement...' : '✅ Enregistrer tous les paramètres'}
        </button>
      </form>
    </div>
  );
};

export default SettingsManager;
