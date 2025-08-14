import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BillForm.css'; 

const defaultProductRow = {
  productType: '',
  product: '',
  price: 0,
  quantity: 1,
  discount: 0,
  total: 0
};

const BillForm = () => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [products, setProducts] = useState([defaultProductRow]);
  const [productData, setProductData] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8080/api/products') // Adjust the URL as per your backend
      .then(res => res.json())
      .then(data => setProductData(data))
      .catch(err => console.error('Error fetching product data:', err));
  }, []);
  

  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    const row = { ...updated[index], [field]: value };

    if (field === 'productType') {
      row.product = '';
      row.price = 0;
      row.total = 0;
    }

    if (field === 'product') {
      const productObj = productData.find(p => p.product === row.productType);
      const categoryObj = productObj?.categories.find(c => c.name === value);
      row.price = categoryObj?.price || 0;
    }

    const price = parseFloat(row.price) || 0;
    const quantity = parseInt(row.quantity) || 0;
    const discount = parseFloat(row.discount) || 0;
    const subtotal = price * quantity;
    const discountedAmount = subtotal * (discount / 100);
    row.total = subtotal - discountedAmount;

    updated[index] = row;
    setProducts(updated);
  };

  const addProductRow = () => setProducts([...products, defaultProductRow]);
  const deleteProductRow = (index) => {
    if (products.length === 1) return showToast('At least one product required.', 'error');
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const getGrandTotal = () =>
    products.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0).toFixed(2);

  const handleSubmit = async () => {
    if (!customerName) return showToast('Enter customer name', 'error');

    const valid = products.every(p => p.productType && p.product);
    if (!valid) return showToast('Fill all product details', 'error');

    const billData = {
      customerName,
      mobileNumber,
      paymentMethod,
      totalAmount: parseFloat(getGrandTotal()),
      products: products.map(p => ({
        product: p.productType,
        category: p.product,
        price: p.price,
        quantity: p.quantity,
        discount: p.discount,
        total: p.total
      }))
    };

    try {
      const res = await fetch('http://localhost:8080/api/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData)
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('lastBill', JSON.stringify(data));
        navigate(`/invoice/${data.bill._id}`);
        showToast('Bill saved successfully!');
        setCustomerName('');
        setMobileNumber('');
        setProducts([defaultProductRow]);
        setPaymentMethod('Cash');
      } else throw new Error(data.message || 'Error saving bill');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  const currentPath = window.location.pathname;

  return (
    <div className="dashboard">
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="logo-section">
          <img src="/sanghamitra logo.jpeg" alt="Logo" className="logo" />
          <span className="username">Olivia Wilson</span>
        </div>
         <ul className="nav-links">
          <li className={currentPath === "/user-dashboard" ? "active" : ""} onClick={() => (window.location.href = "/user-dashboard")}>HOME</li>
          <li className={currentPath === "/bill" ? "active" : ""} onClick={() => (window.location.href = "/bill")}>BILL</li>
          <li className={currentPath === "/" ? "active" : ""} onClick={() => (window.location.href = "")}>PRE ORDER</li>
          <li className={currentPath === "/logout" ? "active" : ""} onClick={() => (window.location.href = "/logout")}>Logout</li>
        </ul>
      </nav> 


    <div className="bill-container">
      {toast.message && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>{toast.message}</div>
      )}

      <div className="header">
        <h1 style={{ color: 'rgb(50, 18, 110)'}}>SANGHAMITRA BUSINESS INCUBATORS</h1>
      </div>

      <div className="customer-info">
        <table>
          <tbody>
            <tr>
              <td><strong>Customer Name:</strong></td>
              <td><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} /></td>
            </tr>
            <tr>
              <td>Contact No:</td>
              <td><input type="tel" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <table>
        <thead>
          <tr >
            <th>Product Type</th>
            <th>Category</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Discount</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((row, index) => (
            <tr key={index}>
              <td>
                <select value={row.productType} onChange={e => handleProductChange(index, 'productType', e.target.value)}>
                  <option value="">Select Type</option>
                  {productData.map(p => (
                    <option key={p._id} value={p.product}>{p.product}</option>
                  ))}
                </select>
              </td>
              <td>
                <select value={row.product} onChange={e => handleProductChange(index, 'product', e.target.value)}>
                  <option value="">Select Category</option>
                  {productData.find(p => p.product === row.productType)?.categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </td>
              <td><input type="number" value={row.price} readOnly /></td>
              <td><input type="number" min="1" value={row.quantity} onChange={e => handleProductChange(index, 'quantity', e.target.value)} /></td>
              <td>
                <select value={row.discount} onChange={e => handleProductChange(index, 'discount', e.target.value)}>
                  {[0, 10, 20, 30, 40, 50].map(d => (
                    <option key={d} value={d}>{d}%</option>
                  ))}
                </select>
              </td>
              <td>{row.total.toFixed(2)}</td>
              <td><button className="delete-btn" onClick={() => deleteProductRow(index)}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addProductRow}>Add</button>

      <div className="payment-method">
        <label>Payment:</label>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="Cash">Cash</option>
          <option value="Online">Online</option>
        </select>
      </div>

      {paymentMethod === 'Online' && (
        <div className="qr-container">
          <p>Scan QR Code:</p>
          <img src="/qr-code.png" alt="QR" />
        </div>
      )}

      <div className="total-amount">Total: ₹{getGrandTotal()}</div>

      <div className="buttons">
        <button onClick={handleSubmit}>Save</button>
      </div>

      <div className="footer">
        Sanghamitra Business Incubator<br />
        Website: <a href="https://sanghamitra.store" target="_blank" rel="noreferrer">sanghamitra.store</a><br />
        Contact: +919234567890
      </div>

    </div>
  </div>
  );
};

export default BillForm;
