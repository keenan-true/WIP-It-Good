import { useState, useEffect } from 'react';
import { managersApi } from '../api/client';

interface Manager {
  id: string;
  name: string;
  staff?: any[];
}

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await managersApi.getAll();
      setManagers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingManager) {
        await managersApi.update(editingManager.id, formData);
      } else {
        await managersApi.create(formData);
      }
      setShowModal(false);
      setFormData({ name: '' });
      setEditingManager(null);
      fetchManagers();
    } catch (error) {
      console.error('Error saving manager:', error);
    }
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    setFormData({ name: manager.name });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this manager?')) return;
    try {
      await managersApi.delete(id);
      fetchManagers();
    } catch (error) {
      console.error('Error deleting manager:', error);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({ name: '' });
    setEditingManager(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Managers</h1>
      
      <div className="button-group">
        <button onClick={() => setShowModal(true)}>Add Manager</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Staff Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((manager) => (
              <tr key={manager.id}>
                <td>{manager.name}</td>
                <td>{manager.staff?.length || 0}</td>
                <td className="actions">
                  <button className="btn-small" onClick={() => handleEdit(manager)}>
                    Edit
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(manager.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingManager ? 'Edit Manager' : 'Add Manager'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                />
              </div>
              <div className="button-group">
                <button type="submit">Save</button>
                <button type="button" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
