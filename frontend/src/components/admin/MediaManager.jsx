import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import mediaService from '../../services/media.service';
import toast from 'react-hot-toast';

const MediaManager = () => {
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await mediaService.getAll();
      setMedia(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    }
  };

  // ✅ MULTI-UPLOAD
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const data = new FormData();

        if (file.type.startsWith('image/')) {
          data.append('image', file);
        } else if (file.type.startsWith('video/')) {
          data.append('video', file);
        } else {
          continue; // sécurité
        }

        data.append('title', file.name);

        await mediaService.upload(data);
      }

      toast.success('Médias uploadés !');
      fetchMedia();
    } catch (error) {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return;

    try {
      await mediaService.delete(id);
      toast.success('Supprimé !');
      fetchMedia();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Médias</h2>

        <label className="btn btn-primary cursor-pointer">
          <Plus className="w-5 h-5 mr-2" />
          {uploading ? 'Upload...' : 'Upload médias'}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item) => (
          <div key={item.id} className="card overflow-hidden group">
            {item.type === 'image' && (
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            )}

            {item.type === 'video' && (
              <video
                src={item.url}
                className="w-full h-48 object-cover"
                controls
              />
            )}

            <div className="p-3 flex justify-between items-center">
              <span className="text-sm font-medium truncate">
                {item.title}
              </span>

              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 hover:bg-red-100 text-red-600 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaManager;
