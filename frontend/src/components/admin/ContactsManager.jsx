// src/components/admin/ContactsManager.jsx
import { useState, useEffect } from 'react';
import { Trash2, Mail } from 'lucide-react';
import contactService from '../../services/contact.service';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const ContactsManager = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await contactService.getAll();
      setContacts(res.data);
    } catch (error) {
      toast.error('Erreur chargement');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await contactService.delete(id);
      toast.success('Message supprimé !');
      fetchContacts();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Messages de contact</h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {contacts.length} message(s)
        </span>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold">{contact.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {formatDate(contact.createdAt)}
                </span>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 hover:bg-red-100 text-red-600 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Sujet: {contact.subject}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun message pour le moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsManager;