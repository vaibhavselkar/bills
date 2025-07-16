import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [category, setCategory] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [productData, setProductData] = useState({});

  // ✅ Fetch products from backend
  useEffect(() => {
    fetchProductData();
  }, []);

  const fetchProductData = async () => {
    try {
      const res = await fetch('https://billing-app-server.vercel.app/api/products');
      const products = await res.json();

      const formatted = {};
      products.forEach(p => {
        if (!formatted[p.type]) formatted[p.type] = {};
        formatted[p.type][p.name] = p.price;
      });

      setProductData(formatted);
    } catch (err) {
      console.error('Error fetching product data:', err);
    }
  };

  const handleAddProduct = async () => {
    if (!category || !product || !price) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      type: category,
      name: product,
      price: parseFloat(price),
    };

    try {
      const res = await fetch('https://billing-app-server.vercel.app/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setCategory('');
        setProduct('');
        setPrice('');
        fetchProductData(); // refresh data
      } else {
        alert("Error adding product");
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  const handleDelete = async (cat, prod) => {
    try {
      const res = await fetch(`https://billing-app-server.vercel.app/api/products/${cat}/${prod}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchProductData(); // refresh data
      } else {
        alert('Error deleting product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="header">
        <h2>🛠️ Product Management</h2>
        <img src="/sanghamitra logo.jpeg" alt="Sanghamitra Logo" className="logo" />
      </div>
      <button id="backBtn" onClick={() => window.location.href = '/'}>Dashboard</button>

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <input
        type="text"
        placeholder="Product Name"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button onClick={handleAddProduct}>Add Product</button>

      <h3>Current Products:</h3>
      {Object.keys(productData).length === 0 ? (
        <p>No products available.</p>
      ) : (
        Object.entries(productData).map(([cat, products]) => (
          <div key={cat}>
            <h4>{cat}</h4>
            <ul>
              {Object.entries(products).map(([prod, price]) => (
                <li key={prod}>
                  {prod} - ₹{price}
                  &nbsp;
                  <button onClick={() => handleDelete(cat, prod)} style={{ color: 'black' }}>
                    Delete
                  </button>
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
