import { useState, useEffect } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import filesService from '../../services/files.service';
import toast from 'react-hot-toast';
import { formatFileSize } from '../../utils/helpers';

const FilesManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchFiles(); }, []);

  const fetchFiles = async () => {
    try {
      const res = await filesService.getAll();
      setFiles(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('title', file.name);
    data.append('category', 'document');
    
    try {
      await filesService.upload(data);
      toast.success('Fichier uploadé !');
      fetchFiles();
    } catch (error) {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ?')) return;
    try {
      await filesService.delete(id);
      toast.success('Supprimé !');
      fetchFiles();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fichiers</h2>
        <label className="btn btn-primary cursor-pointer">
          <Plus className="w-5 h-5 mr-2" />
          {uploading ? 'Upload...' : 'Upload fichier'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      <div className="grid gap-4">
        {files.map((file) => (
          <div key={file.id} className="card p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">{file.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</p>
            </div>
            <div className="flex gap-2">
              <a href={file.url} download className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><Download className="w-5 h-5" /></a>
              <button onClick={() => handleDelete(file.id)} className="p-2 hover:bg-red-100 text-red-600 rounded"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesManager;
