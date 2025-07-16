import React, { useState, useEffect } from 'react'; // ✅ Add useEffect
import { useNavigate } from 'react-router-dom';//1


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
  const [toast, setToast] = useState({ message: '', type: '' });
  const navigate = useNavigate();//2
  const [productData, setProductData] = useState({}); // ✅ New state to hold localStorage data
  // ✅ Load productData from localStorage on mount
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('productData')) || {};
    setProductData(storedData);
  }, []);


  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    const row = { ...updatedProducts[index], [field]: value };

    if (field === 'productType') {
      row.product = '';
      row.price = 0;
      row.total = 0;
    }

    if (field === 'product') {
      const price = productData[row.productType]?.[value] || 0;
      row.price = price;
    }

    if (['price', 'quantity', 'discount', 'product', 'productType'].includes(field)) {
      const price = parseFloat(row.price) || 0;
      const quantity = parseInt(row.quantity) || 0;
      const discount = parseFloat(row.discount) || 0;
      const subtotal = price * quantity;
      const discountedAmount = subtotal * (discount / 100);
      row.total = subtotal - discountedAmount;
    }

    updatedProducts[index] = row;
    setProducts(updatedProducts);
  };

  const addProductRow = () => {
    setProducts([...products, defaultProductRow]);
  };

  const deleteProductRow = (index) => {
    if (products.length === 1) {
      showToast('You must have at least one product row.', 'error');
      return;
    }
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const getGrandTotal = () => {
    return products.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0).toFixed(2);
  };


  const handleSubmit = async () => {
    if (!customerName) {
      showToast('Please enter customer name', 'error');
      return;
    }

    const valid = products.every(p => p.productType && p.product);
    if (!valid || products.length === 0) {
      showToast('Please fill all product details', 'error');
      return;
    }

    const billData = {
      customerName,
      mobileNumber,
      paymentMethod,
      totalAmount: parseFloat(getGrandTotal()),
      products: products.map(p => ({
        product: p.productType === 'Tshirt' ? 'T-shirts' : p.productType,
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
      console.log("Saved Bill Response:", data);

      if (res.ok) {
        // Save to localStorage
        localStorage.setItem('lastBill', JSON.stringify(data));
        // Navigate using plain HTML
        //window.location.href = '/invoice/:id';
        navigate(`/invoice/${data.bill._id}`);


        showToast('Bill saved successfully!');
        setCustomerName('');
        setMobileNumber('');
        setProducts([defaultProductRow]);
        setPaymentMethod('Cash');
      } else {
        throw new Error(data.message || 'Error saving bill');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  };

  return (
    <div className="bill-container">
      {toast.message && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}

      <div className="header">
        <h1>SANGHAMITRA BILL</h1>
        <img src="/sanghamitra logo.jpeg" alt="Sanghamitra Logo" className="logo" />
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
          <tr>
            <th>Product Type</th>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
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
                  {Object.keys(productData).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </td>
              <td>
                <select value={row.product} onChange={e => handleProductChange(index, 'product', e.target.value)}>
                  <option value="">Select Product</option>
                  {productData[row.productType] &&
                    Object.keys(productData[row.productType]).map(product => (
                      <option key={product} value={product}>{product}</option>
                    ))}
                </select>
              </td>
              <td><input type="number" value={row.price} readOnly /></td>
              <td><input type="number" value={row.quantity} min="1" onChange={e => handleProductChange(index, 'quantity', e.target.value)} /></td>
              <td>
                <select value={row.discount} onChange={e => handleProductChange(index, 'discount', e.target.value)}>
                  {[0, 10, 20, 30, 40, 50].map(dis => (
                    <option key={dis} value={dis}>{dis}%</option>
                  ))}
                </select>
              </td>
              <td>{row.total.toFixed(2)}</td>
              <td><button className="delete-btn" onClick={() => deleteProductRow(index)}>×</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addProductRow}>Add Product</button>

      <div className="payment-method">
        <p><strong>Payment Method:</strong></p>
        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="Cash">Cash</option>
          <option value="Online">Online</option>
        </select>
      </div>

      {paymentMethod === 'Online' && (
        <div className="qr-container">
          <p><strong>Scan QR Code to Pay:</strong></p>
          <img src="/qr-code.png" alt="QR Code" />
        </div>
      )}

      <div className="total-amount">Total Amount: ₹{getGrandTotal()}</div>

      <div className="buttons">
        <button id="saveBillBtn" onClick={handleSubmit}>Save</button>        
        <button id="backBtn" onClick={() => window.location.href = '/'}>Dashboard</button>
      </div>


      <div className="footer">
        Sanghamitra Business Incubator<br />
        Website: <a href="https://sanghamitra.store" target="_blank" rel="noreferrer">sanghamitra.store</a><br />
        Contact: +919234567890
      </div>
  </div>
  );
};

export default BillForm;
