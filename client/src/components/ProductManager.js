// ProductManagement.js
import React, { useState } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  const [product, setProduct] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

  const handleAddProduct = async (e) => {
    e.preventDefault();

    const newBill = {
      customerName: "product-entry", // used only to group products
      products: [{
        product,
        category,
        price,
        discount: 0,
        quantity: 1,
        total: price
      }],
      totalAmount: price,
      paymentMethod: "Cash"
    };

    try {
      await axios.post('/api/bills', newBill);
      setProduct('');
      setCategory('');
      setPrice('');
      alert("Product saved!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add Product</h2>
      <form onSubmit={handleAddProduct}>
        <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default ProductManagement;
