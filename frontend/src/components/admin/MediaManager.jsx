// frontend/src/components/admin/MediaManager.jsx
import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckSquare, Square, Loader2, Upload, AlertCircle } from 'lucide-react';
import cloudinaryService from '../../services/cloudinary.service';
import firebaseService from '../../services/firebase.service';
import mediaService from '../../services/media.service';
import toast from 'react-hot-toast';

const MediaManager = () => {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [fileProgresses, setFileProgresses] = useState({});
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const missingCloudinary =
    !import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
    !import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await mediaService.getAll();
      setMedia(res.data || []);
    } catch {
      toast.error('Erreur chargement médias');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (missingCloudinary) {
      toast.error('⚠️ Variables Cloudinary manquantes dans .env !', { duration: 8000 });
      return;
    }

    setUploading(true);
    const initialProgresses = {};
    files.forEach((file, i) => {
      initialProgresses[i] = { name: file.name, percent: 0, status: 'pending' };
    });
    setFileProgresses(initialProgresses);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const folder = isVideo ? 'portfolio/videos' : 'portfolio/media';

      setFileProgresses(prev => ({
        ...prev,
        [i]: { name: file.name, percent: 0, status: 'uploading' },
      }));

      try {
        // ── ÉTAPE 1 : Upload vers Cloudinary (direct, illimité) ──
        console.log(`\n[${i + 1}/${files.length}] Début: "${file.name}"`);
        const cloudResult = await cloudinaryService.uploadFile(
          file,
          folder,
          (percent) => {
            setFileProgresses(prev => ({
              ...prev,
              [i]: { name: file.name, percent, status: 'uploading' },
            }));
          }
        );

        // ── ÉTAPE 2 : Enregistrer dans Firebase via backend (JSON < 1KB) ──
        setFileProgresses(prev => ({
          ...prev,
          [i]: { name: file.name, percent: 99, status: 'saving' },
        }));

        const mediaData = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: '',
          category: 'portfolio',
          url: cloudResult.secure_url,
          publicId: cloudResult.public_id,
          originalName: file.name,
          type: cloudResult.type,
          format: cloudResult.format || (isVideo ? 'mp4' : 'jpg'),
          size: file.size,
          ...(cloudResult.duration ? { duration: cloudResult.duration } : {}),
          ...(cloudResult.width ? { width: cloudResult.width } : {}),
          ...(cloudResult.height ? { height: cloudResult.height } : {}),
        };

        // ✅ Appel backend /media/register (JSON seulement, pas de fichier)
        const newId = await firebaseService.pushMedia(mediaData);

        setMedia(prev => [{
          id: newId,
          ...mediaData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, ...prev]);

        setFileProgresses(prev => ({
          ...prev,
          [i]: { name: file.name, percent: 100, status: 'done' },
        }));

        successCount++;
        console.log(`✅ [${i + 1}/${files.length}] Terminé: "${file.name}"`);

      } catch (err) {
        const errMsg = err.message || 'Erreur inconnue';
        console.error(`❌ [${i + 1}/${files.length}] Erreur "${file.name}":`, errMsg);
        setFileProgresses(prev => ({
          ...prev,
          [i]: { name: file.name, percent: 0, status: 'error', error: errMsg },
        }));
        errorCount++;
        toast.error(`❌ ${file.name.substring(0, 35)}: ${errMsg}`, { duration: 6000 });
      }
    }

    if (successCount > 0) toast.success(`✅ ${successCount} fichier(s) uploadé(s) !`);
    if (errorCount > 0 && successCount === 0) toast.error('❌ Tous les uploads ont échoué');

    setUploading(false);
    e.target.value = '';
    setTimeout(() => setFileProgresses({}), 6000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce média ? Action irréversible.')) return;
    try {
      await mediaService.delete(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      toast.success('✅ Supprimé !');
    } catch {
      toast.error('❌ Erreur suppression');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Supprimer ${selectedIds.size} média(s) ? Action irréversible.`)) return;
    setDeleting(true);
    let deletedCount = 0;
    for (const id of selectedIds) {
      try { await mediaService.delete(id); deletedCount++; } catch {}
    }
    toast.success(`✅ ${deletedCount} média(s) supprimé(s) !`);
    setMedia(prev => prev.filter(m => !selectedIds.has(m.id)));
    setSelectedIds(new Set());
    setSelectionMode(false);
    setDeleting(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(
      selectedIds.size === media.length ? new Set() : new Set(media.map(m => m.id))
    );
  };

  const progressEntries = Object.entries(fileProgresses);
  const overallPercent = progressEntries.length > 0
    ? Math.round(progressEntries.reduce((s, [, p]) => s + p.percent, 0) / progressEntries.length)
    : 0;

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <div>
          <h2 className="text-2xl font-bold">Médias</h2>
          <p className="text-sm text-gray-500 mt-1">{media.length} média(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()); }}
            className={`btn ${selectionMode ? 'btn-primary' : 'btn-secondary'}`}
          >
            {selectionMode ? '✓ Sélection ON' : 'Sélectionner'}
          </button>

          {selectionMode && selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Supprimer ({selectedIds.size})
            </button>
          )}

          {selectionMode && (
            <button onClick={selectAll} className="btn btn-secondary">
              {selectedIds.size === media.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          )}

          <label className={`btn btn-primary cursor-pointer flex items-center gap-2 ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {uploading ? 'Upload en cours...' : 'Upload médias'}
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* ── Alerte config manquante ── */}
      {missingCloudinary && (
        <div className="mb-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold mb-1">⚠️ Variables Cloudinary manquantes dans frontend/.env</p>
            <code className="block text-xs bg-yellow-100 dark:bg-yellow-800 p-2 rounded">
              VITE_CLOUDINARY_CLOUD_NAME=dnegiuc7h<br/>
              VITE_CLOUDINARY_UPLOAD_PRESET=portfolio_unsigned
            </code>
          </div>
        </div>
      )}

      {/* ── Progression globale ── */}
      {progressEntries.length > 0 && (
        <div className="mb-6 card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">Upload — {overallPercent}% global</span>
            <Upload className="w-4 h-4 text-primary-600 animate-bounce" />
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-primary-600 h-3 rounded-full transition-all duration-300" style={{ width: `${overallPercent}%` }} />
          </div>
          {progressEntries.map(([idx, prog]) => (
            <div key={idx} className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="truncate max-w-[72%] text-gray-700 dark:text-gray-300">
                  {prog.status === 'done' ? '✅' : prog.status === 'error' ? '❌' : prog.status === 'saving' ? '💾' : '⬆️'} {prog.name}
                </span>
                <span className={`font-medium ${prog.status === 'done' ? 'text-green-600' : prog.status === 'error' ? 'text-red-600' : prog.status === 'saving' ? 'text-blue-600' : 'text-primary-600'}`}>
                  {prog.status === 'done' ? '✓ OK' : prog.status === 'error' ? 'Erreur' : prog.status === 'saving' ? 'Sauvegarde...' : `${prog.percent}%`}
                </span>
              </div>
              {prog.status === 'uploading' && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div className="bg-primary-400 h-1 rounded-full transition-all duration-200" style={{ width: `${prog.percent}%` }} />
                </div>
              )}
              {prog.status === 'error' && <p className="text-xs text-red-500 mt-1">{prog.error}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── Grille ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className={`card overflow-hidden group relative transition-all ${selectionMode ? 'cursor-pointer' : ''} ${selectedIds.has(item.id) ? 'ring-2 ring-primary-600 shadow-lg' : ''}`}
              onClick={selectionMode ? () => toggleSelect(item.id) : undefined}
            >
              {selectionMode && (
                <div className="absolute top-2 left-2 z-10">
                  {selectedIds.has(item.id)
                    ? <CheckSquare className="w-6 h-6 text-primary-600 bg-white rounded shadow" />
                    : <Square className="w-6 h-6 text-gray-400 bg-white rounded shadow opacity-80" />}
                </div>
              )}

              {item.type === 'image'
                ? <img src={item.url} alt={item.title} className="w-full h-48 object-cover" loading="lazy" />
                : <video src={item.url} className="w-full h-48 object-cover" controls onClick={e => selectionMode && e.preventDefault()} />
              }

              <div className="p-3 flex justify-between items-center">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {item.originalName && item.originalName !== item.title && (
                    <p className="text-xs text-gray-400 truncate">{item.originalName}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {item.type === 'video' ? '🎥' : '🖼️'} {item.format?.toUpperCase() || item.type?.toUpperCase()}
                    {item.size ? ` • ${(item.size / 1024 / 1024).toFixed(1)} MB` : ''}
                  </p>
                </div>
                {!selectionMode && (
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-100 text-red-600 rounded flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && media.length === 0 && !uploading && (
        <div className="text-center py-16 text-gray-500">
          <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Aucun média disponible</p>
          <p className="text-sm mt-1">Cliquez sur "Upload médias" pour commencer</p>
        </div>
      )}
    </div>
  );
};

export default MediaManager;
