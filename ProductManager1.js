import React, { useState } from "react";

const initialProductData = {
  Frames: {
    "Adivasi Geographic by Jayesh Lakhama Vayeda": 500,
    "Anti-caste Bookseller by Nidhin Shobhana": 500,
  },
  Tshirt: {
    "Elephant": 200,
    "Chameleon": 200,
  },
};

const ProductManager = () => {
  const [products, setProducts] = useState(() =>
    Object.entries(initialProductData).flatMap(([category, items]) =>
      Object.entries(items).map(([name, price]) => ({
        category,
        name,
        price,
        active: true,
      }))
    )
  );

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    price: "",
  });

  const toggleStatus = (index, isActive) => {
    const updated = [...products];
    updated[index].active = isActive;
    setProducts(updated);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();

    if (!formData.category || !formData.name || !formData.price) {
      alert("Please fill all fields.");
      return;
    }

    const newProduct = {
      category: formData.category,
      name: formData.name,
      price: parseFloat(formData.price),
      active: true,
    };

    setProducts((prev) => {
      const newList = [...prev, newProduct];
      const grouped = {};

      newList.forEach(p => {
        if (!grouped[p.category]) grouped[p.category] = {};
        grouped[p.category][p.name] = p.price;
      });

      localStorage.setItem('productData', JSON.stringify(grouped));
      return newList;
    });


    // Clear form
    setFormData({ category: "", name: "", price: "" });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <button id="backBtn" onClick={() => window.location.href = '/'}>Dashboard</button>
      <h2>Product Management</h2>

      {/* Add New Product Form */}
      <form onSubmit={handleAddProduct} style={{ marginBottom: "2rem" }}>
        <h3>Add New Product</h3>
        <input
          type="text"
          name="category"
          placeholder="Category (e.g., Mug)"
          value={formData.category}
          onChange={handleChange}
          style={{ marginRight: "1rem" }}
        />
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          style={{ marginRight: "1rem" }}
        />
        <input
          type="number"
          name="price"
          placeholder="Price (₹)"
          value={formData.price}
          onChange={handleChange}
          style={{ marginRight: "1rem" }}
        />
        <button type="submit">Add Product</button>
      </form>

      {/* Product Table */}
      <table border="1" cellPadding="10" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Product Name</th>
            <th>Price (₹)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.name + index}>
              <td>{product.category}</td>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td style={{ color: product.active ? "green" : "red" }}>
                {product.active ? "Active" : "Inactive"}
              </td>
              <td>
                <button onClick={() => toggleStatus(index, true)}>Activate</button>
                <button onClick={() => toggleStatus(index, false)}>Deactivate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductManager;
