import React, { useEffect, useState } from 'react';
import '../styles/ProductManagement.css';


const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product: '', category: '', price: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:8080/api/products');
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingProductId) {
      // New product or category
      const existingProduct = products.find(p => p.product === form.product);

      if (existingProduct) {
        // Add new category to existing product
        await fetch('http://localhost:8080/api/products/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: form.product, // Must match existing name to append
            categories: [{ name: form.category, price: form.price }]
          })
        });

      } else {
        // Create new product with category
        await fetch(`http://localhost:8080/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: form.product, categories: [{ name: form.category, price: form.price }] })
        });
      }
    } else {
      // Update category
      await fetch(`http://localhost:8080/api/products/${editingProductId}/category/${editingCategoryIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.category, price: form.price })
      });
    }

    setForm({ product: '', category: '', price: '' });
    setEditingProductId(null);
    setEditingCategoryIndex(null);
    fetchProducts();
  };

  const handleEdit = (productId, categoryIndex) => {
    const product = products.find(p => p._id === productId);
    const category = product.categories[categoryIndex];
    setForm({ product: product.product, category: category.name, price: category.price });
    setEditingProductId(productId);
    setEditingCategoryIndex(categoryIndex);
  };

  const handleDelete = async (productId, categoryIndex) => {
    await fetch(`http://localhost:8080/api/products/${productId}/category/${categoryIndex}`, {
      method: 'DELETE'
    });
    fetchProducts();
  };

  return (
    <div className="product-container">
      <div className="header">
        <button id="backBtn" onClick={() => window.location.href = '/'}>Go Back</button>
        <h1>Product Management</h1>
        <img src="/sanghamitra logo.jpeg" alt="Sanghamitra Logo" className="logo" />
      </div>
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          placeholder="Product"
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
          required
        />
        <button type="submit">{editingProductId ? 'Update' : 'Add'} Product</button>
      </form>

      {products.map((p) => (
        <div key={p._id} >
          <h3>{p.product}</h3>
          <table className="product-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {p.categories.map((cat, index) => (
                <tr key={index}>
                  <td>{cat.name}</td>
                  <td>{cat.price}</td>
                  <td>
                    <button onClick={() => handleEdit(p._id, index)}>Edit</button>
                    <button onClick={() => handleDelete(p._id, index)} className="del-btn">Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ProductManagement;
