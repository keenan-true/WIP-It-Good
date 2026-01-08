import { useState, useEffect } from 'react';
import { staffApi, managersApi } from '../api/client';
import Modal from '../components/Modal';

interface Staff {
  id: string;
  name: string;
  location: string;
  hourlyCost: number;
  managerId: string;
  manager?: { name: string };
}

interface Manager {
  id: string;
  name: string;
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: 'US',
    hourlyCost: '',
    managerId: '',
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffRes, managersRes] = await Promise.all([
        staffApi.getAll(),
        managersApi.getAll(),
      ]);
      console.log('Staff response:', staffRes);
      console.log('Managers response:', managersRes);
      setStaff(Array.isArray(staffRes.data) ? staffRes.data : []);
      setManagers(Array.isArray(managersRes.data) ? managersRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setStaff([]);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        hourlyCost: parseFloat(formData.hourlyCost),
      };
      
      if (editingStaff) {
        await staffApi.update(editingStaff.id, data);
      } else {
        await staffApi.create(data);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      location: staffMember.location,
      hourlyCost: staffMember.hourlyCost.toString(),
      managerId: staffMember.managerId,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await staffApi.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    try {
      const response = await staffApi.import(importFile);
      setImportResult(response.data);
      setImportFile(null);
      fetchData();
    } catch (error) {
      console.error('Error importing staff:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: 'US',
      hourlyCost: '',
      managerId: '',
    });
    setEditingStaff(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    resetForm();
  };

  if (loading) return <div className="loading">Loading</div>;

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-2"><i className="bi bi-people me-2"></i>Staff</h1>
          <p className="text-muted mb-0">Manage staff members, locations, and cost information</p>
        </div>
        <div>
          <button className="btn btn-primary me-2" onClick={() => setShowModal(true)}>
            <i className="bi bi-plus-circle me-1"></i>
            Add Staff
          </button>
          <button className="btn btn-outline-secondary" onClick={() => setShowImportModal(true)}>
            <i className="bi bi-upload me-1"></i>
            Import CSV
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Hourly Cost</th>
              <th>Manager</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(staff) ? staff : []).map((staffMember) => (
              <tr key={staffMember.id}>
                <td><strong>{staffMember.name}</strong></td>
                <td>
                  <span className="badge bg-secondary">{staffMember.location}</span>
                </td>
                <td>${Number(staffMember.hourlyCost).toFixed(2)}</td>
                <td>{staffMember.manager?.name}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(staffMember)}>
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(staffMember.id)}
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
        title={editingStaff ? 'Edit Staff' : 'Add Staff'}
        icon="bi-people"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="location" className="form-label">Location</label>
            <select
              className="form-select"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            >
              <option value="US">US</option>
              <option value="UK">UK</option>
              <option value="Contract">Contract</option>
              <option value="India">India</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="hourlyCost" className="form-label">Hourly Cost ($)</label>
            <input
              type="number"
              className="form-control"
              id="hourlyCost"
              step="0.01"
              value={formData.hourlyCost}
              onChange={(e) => setFormData({ ...formData, hourlyCost: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="managerId" className="form-label">Manager</label>
            <select
              className="form-select"
              id="managerId"
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              required
            >
              <option value="">Select a manager</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name}
                </option>
              ))}
            </select>
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

      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Staff from CSV"
        icon="bi-upload"
      >
        <div className="alert alert-info mb-3">
          <i className="bi bi-info-circle me-2"></i>
          CSV should have columns: <strong>name, location, hourlyCost, managerName</strong>
        </div>
        <form onSubmit={handleImport}>
          <div className="mb-3">
            <label htmlFor="file" className="form-label">Select CSV File</label>
            <input
              type="file"
              className="form-control"
              id="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          {importResult && (
            <div className="mb-3">
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                Successfully imported: <strong>{importResult.success}</strong>
              </div>
              {importResult.failed > 0 && (
                <div className="alert alert-danger">
                  <i className="bi bi-x-circle me-2"></i>
                  Failed: <strong>{importResult.failed}</strong>
                </div>
              )}
            </div>
          )}

          <div style={{padding: '1rem 0', borderTop: '1px solid #dee2e6', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end'}}>
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-upload me-1"></i>
              Import
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => {
              setShowImportModal(false);
              setImportResult(null);
              setImportFile(null);
            }}>
              <i className="bi bi-x-circle me-1"></i>
              Close
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
