import { useState, useEffect } from 'react';
import { productsApi } from '../api/client';
import Modal from '../components/Modal';

interface Product {
  id: string;
  name: string;
  initiatives?: any[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, formData);
      } else {
        await productsApi.create(formData);
      }
      setShowModal(false);
      setFormData({ name: '' });
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({ name: '' });
    setEditingProduct(null);
  };

  if (loading) return <div className="loading">Loading</div>;

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-2"><i className="bi bi-box me-2"></i>Products</h1>
          <p className="text-muted mb-0">Manage product portfolios and initiatives</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-circle me-1"></i>
          Add Product
        </button>
      </div>

      <div className="table-container">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Initiatives Count</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td><strong>{product.name}</strong></td>
                <td>
                  <span className="badge bg-success">{product.initiatives?.length || 0}</span>
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(product)}>
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(product.id)}
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
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        icon="bi-box"
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
          <div style={{
            padding: '1rem 0',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end'
          }}>
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
