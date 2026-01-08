import { useState, useEffect } from 'react';
import { initiativesApi, productsApi } from '../api/client';
import Modal from '../components/Modal';

interface Initiative {
  id: string;
  name: string;
  productId: string;
  category: string;
  description?: string;
  product?: { name: string };
}

interface Product {
  id: string;
  name: string;
}

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<Initiative | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    category: 'Contract',
    description: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [initiativesRes, productsRes] = await Promise.all([
        initiativesApi.getAll(),
        productsApi.getAll(),
      ]);
      setInitiatives(Array.isArray(initiativesRes.data) ? initiativesRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setInitiatives([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInitiative) {
        await initiativesApi.update(editingInitiative.id, formData);
      } else {
        await initiativesApi.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving initiative:', error);
    }
  };

  const handleEdit = (initiative: Initiative) => {
    setEditingInitiative(initiative);
    setFormData({
      name: initiative.name,
      productId: initiative.productId,
      category: initiative.category,
      description: initiative.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this initiative?')) return;
    try {
      await initiativesApi.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting initiative:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      productId: '',
      category: 'Contract',
      description: '',
    });
    setEditingInitiative(null);
  };

  const handleCancel = () => {
    setShowModal(false);
    resetForm();
  };

  const getCategoryBadgeClass = (category: string) => {
    const classes: Record<string, string> = {
      Contract: 'bg-success',
      Promise: 'bg-primary',
      Expectation: 'bg-warning text-dark',
      Growth: 'bg-info',
    };
    return classes[category] || 'bg-secondary';
  };

  if (loading) return <div className="loading">Loading</div>;

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-2"><i className="bi bi-flag me-2"></i>Initiatives</h1>
          <p className="text-muted mb-0">Track and manage project initiatives by product</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-1"></i>
          Add Initiative
        </button>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Product</th>
              <th>Category</th>
              <th>Description</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initiatives.map((initiative) => (
              <tr key={initiative.id}>
                <td><strong>{initiative.name}</strong></td>
                <td>{initiative.product?.name}</td>
                <td>
                  <span className={`badge ${getCategoryBadgeClass(initiative.category)}`}>
                    {initiative.category}
                  </span>
                </td>
                <td>{initiative.description || '-'}</td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(initiative)}>
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(initiative.id)}
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
        title={editingInitiative ? 'Edit Initiative' : 'Add Initiative'}
        icon="bi-flag"
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
            <label htmlFor="productId" className="form-label">Product</label>
            <select
              className="form-select"
              id="productId"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label">Category</label>
            <select
              className="form-select"
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="Contract">Contract</option>
              <option value="Promise">Promise</option>
              <option value="Expectation">Expectation</option>
              <option value="Growth">Growth</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              className="form-control"
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
