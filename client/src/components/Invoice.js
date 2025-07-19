import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Invoice.css';

const Invoice = () => {
  const [bill, setBill] = useState(null);
  const { id } = useParams(); // 👈 Get ID from URL

  useEffect(() => {
    const fetchBillById = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/bill/${id}`);
        const data = await res.json();

        if (data) {
          setBill(data);
        } else {
          console.error('Bill not found');
        }
      } catch (err) {
        console.error('Error fetching bill:', err);
      }
    };

    fetchBillById();
  }, [id]);

  if (!bill) return <div>Loading invoice...</div>;

  return (
    <div className="invoice-container">
      {/* Same invoice structure */}
      <div className="invoice-header">
        <h1>SANGHAMITRA BILL</h1>
        <img src="/sanghamitra logo.jpeg" alt="Logo" className="invoice-logo" />
      </div>

      <div className="invoice-details">
        <p><strong>Customer Name:</strong> {bill.customerName}</p>
        <p><strong>Date:</strong> {new Date(bill.date).toLocaleString()}</p>
        <p><strong>Payment Method:</strong> {bill.paymentMethod}</p>
        <p><strong>Total Amount:</strong> ₹{bill.totalAmount?.toFixed(2)}</p>
      </div>

      <h3>Products</h3>
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Type</th>
            <th>Price (₹)</th>
            <th>Quantity</th>
            <th>Discount (%)</th>
            <th>Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          {bill.products.map((p, index) => (
            <tr key={index}>
              <td>{p.product}</td>
              <td>{p.category}</td>
              <td>{p.price?.toFixed(2) || '-'}</td>
              <td>{p.quantity}</td>
              <td>{p.discount}</td>
              <td>{p.total?.toFixed(2) || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="footer">
        Sanghamitra Business Incubator<br />
        Website: <a href="https://sanghamitra.store" target="_blank" rel="noreferrer">sanghamitra.store</a><br />
        Contact: +919234567890
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => window.print()}>Print Invoice</button>
      </div>
    </div>
  );
};

export default Invoice;
