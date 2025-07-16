import React, { useState, useEffect } from 'react';

const ProductManagement = () => {
  const [category, setCategory] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [productData, setProductData] = useState({});

  // ✅ Load from localStorage when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('productData');
    if (savedData) {
      setProductData(JSON.parse(savedData));
    }
  }, []);

  // ✅ Save to localStorage after data is updated
  const saveToLocalStorage = (data) => {
    localStorage.setItem('productData', JSON.stringify(data));
  };

  const handleAddProduct = () => {
    if (!category || !product || !price) {
      alert("Please fill all fields");
      return;
    }

    const updatedData = { ...productData };

    if (!updatedData[category]) {
      updatedData[category] = {};
    }
    updatedData[category][product] = parseFloat(price);

    setProductData(updatedData);
    saveToLocalStorage(updatedData);

    setProduct('');
    setPrice('');
  };

  const handleDelete = (cat, prod) => {
    const updatedData = { ...productData };
    delete updatedData[cat][prod];

    // If category becomes empty, delete it too
    if (Object.keys(updatedData[cat]).length === 0) {
      delete updatedData[cat];
    }

    setProductData(updatedData);
    saveToLocalStorage(updatedData);
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
