import { useState, useEffect } from 'react';
import { staffApi, managersApi } from '../api/client';

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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Staff</h1>
      
      <div className="button-group">
        <button onClick={() => setShowModal(true)}>Add Staff</button>
        <button onClick={() => setShowImportModal(true)}>Import from CSV</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Hourly Cost</th>
              <th>Manager</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(staff) ? staff : []).map((staffMember) => (
              <tr key={staffMember.id}>
                <td>{staffMember.name}</td>
                <td>{staffMember.location}</td>
                <td>${staffMember.hourlyCost}</td>
                <td>{staffMember.manager?.name}</td>
                <td className="actions">
                  <button className="btn-small" onClick={() => handleEdit(staffMember)}>
                    Edit
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(staffMember.id)}
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
            <h2>{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <select
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

              <div className="form-group">
                <label htmlFor="hourlyCost">Hourly Cost ($)</label>
                <input
                  type="number"
                  id="hourlyCost"
                  step="0.01"
                  value={formData.hourlyCost}
                  onChange={(e) => setFormData({ ...formData, hourlyCost: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="managerId">Manager</label>
                <select
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

      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Import Staff from CSV</h2>
            <p>CSV should have columns: name, location, hourlyCost, managerName</p>
            <form onSubmit={handleImport}>
              <div className="form-group">
                <label htmlFor="file">Select CSV File</label>
                <input
                  type="file"
                  id="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              {importResult && (
                <div style={{ marginTop: '1rem' }}>
                  <p>✅ Successfully imported: {importResult.success}</p>
                  {importResult.failed > 0 && (
                    <p style={{ color: '#ff6b6b' }}>❌ Failed: {importResult.failed}</p>
                  )}
                </div>
              )}

              <div className="button-group">
                <button type="submit">Import</button>
                <button type="button" onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                  setImportFile(null);
                }}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
