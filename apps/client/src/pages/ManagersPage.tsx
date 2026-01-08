import { useState, useEffect } from 'react';
import { managersApi } from '../api/client';
import Modal from '../components/Modal';

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

  if (loading) return <div className="loading">Loading</div>;

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-2"><i className="bi bi-person-badge me-2"></i>Managers</h1>
          <p className="text-muted mb-0">Manage team leaders and staff assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-1"></i>
          Add Manager
        </button>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Staff Count</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {managers.map((manager) => (
              <tr key={manager.id}>
                <td><strong>{manager.name}</strong></td>
                <td>
                  <span className="badge bg-info">{manager.staff?.length || 0}</span>
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(manager)}>
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(manager.id)}
                  >
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingManager ? 'Edit Manager' : 'Add Manager'}
        icon="bi-person-badge"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              required
            />
          </div>
          <div style={{padding: '1rem 0', borderTop: '1px solid #dee2e6', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-check-circle me-1"></i>
              Save
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              <i className="bi bi-x-circle me-1"></i>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
