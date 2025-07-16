import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [products, setProducts] = useState([]);

  const handleAddProduct = async () => {
    if (!category || !name || !price) {
      alert('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('https://billing-app-server.vercel.app/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, name, price })
      });
      if (!response.ok) throw new Error('Failed to add product');
      setCategory('');
      setName('');
      setPrice('');
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };


  return (
    <div style={{ padding: '20px' }}>
      <div className="header">
        <h2>🛠️ Product Management</h2>
        <img src="/sanghamitra logo.jpeg" alt="Sanghamitra Logo" className="logo" />
      </div>
      <button id="backBtn" onClick={() => window.location.href = '/'}>Dashboard</button>

      <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
      <button onClick={handleAddProduct}>Add Product</button>

      <h3>Current Products:</h3>
      {Object.keys(groupedProducts).length === 0 ? (
        <p>No products available.</p>
      ) : (
        Object.entries(groupedProducts).map(([cat, prods]) => (
          <div key={cat}>
            <h4>{cat}</h4>
            <ul>
              {prods.map((p) => (
                <li key={p._id}>
                  {p.name} - ₹{p.price}
                  &nbsp;
                  <button onClick={() => handleDelete(p._id)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductManagement;
