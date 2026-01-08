import { useState, useEffect } from 'react';
import { initiativesApi, productsApi } from '../api/client';

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

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Contract: '#4CAF50',
      Promise: '#2196F3',
      Expectation: '#FF9800',
      Growth: '#9C27B0',
    };
    return {
      backgroundColor: colors[category] || '#666',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.875rem',
    };
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h1>Initiatives</h1>
      
      <div className="button-group">
        <button onClick={() => setShowModal(true)}>Add Initiative</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Product</th>
              <th>Category</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initiatives.map((initiative) => (
              <tr key={initiative.id}>
                <td>{initiative.name}</td>
                <td>{initiative.product?.name}</td>
                <td>
                  <span style={getCategoryBadge(initiative.category)}>
                    {initiative.category}
                  </span>
                </td>
                <td>{initiative.description || '-'}</td>
                <td className="actions">
                  <button className="btn-small" onClick={() => handleEdit(initiative)}>
                    Edit
                  </button>
                  <button
                    className="btn-small btn-danger"
                    onClick={() => handleDelete(initiative.id)}
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
            <h2>{editingInitiative ? 'Edit Initiative' : 'Add Initiative'}</h2>
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
                <label htmlFor="productId">Product</label>
                <select
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

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
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

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
