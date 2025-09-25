
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/Invoice.css';
import Navbar from "./Navbar";

const Invoice = () => {
  const [bill, setBill] = useState(null);
  const [viewType, setViewType] = useState("normal"); // 👈 toggle between "normal" and "dmart"
  const { id } = useParams();

  useEffect(() => {
    const fetchBillById = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://billing-app-server.vercel.app/api/bill/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Unauthorized or failed to fetch bill");
        }

        const data = await res.json();
        setBill(data);
      } catch (err) {
        console.error("Error fetching bill:", err);
      }
    };

    fetchBillById();
  }, [id]);

  if (!bill) return <div>Loading invoice...</div>;

  // 👉 Calculate totals for dmart style
  const totalQty = bill.products.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalItems = bill.products.length;

  return (
    <div className="dashboard">
      <Navbar />

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {/* Toggle buttons */}
        <button onClick={() => setViewType("normal")} style={{ marginRight: "10px" }}>
          Bill-Invoice
        </button>
        <button onClick={() => setViewType("dmart")}>
          Thermal-Print
        </button>
      </div>

      {/* Normal Invoice Layout */}
      {viewType === "normal" && (
        <div className="invoice-container">
          <div className="invoice-header">
            <h1>SANGHAMITRA </h1>
            <img src="/sanghamitra logo.jpeg" alt="Logo" className="invoice-logo" />
          </div>

          <div className="invoice-details">
            <p><strong>Customer Name:</strong> {bill.customerName}</p>
            <p><strong>Date:</strong> {new Date(bill.date).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {bill.paymentMethod}</p>
          </div>
          
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
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', fontWeight: 'bold' }}>Total Amount</td>
                <td><strong>₹{bill.totalAmount?.toFixed(2)}</strong></td>
              </tr>
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
      )}

      {/* Dmart Invoice Layout */}
      {viewType === "dmart" && (
        <div className="invoice-container dmart-invoice" style={{ maxWidth: "320px", margin: "0 auto", fontSize: "14px" }}>
          <div style={{ textAlign: "center", marginBottom: "5px" }}>
            <img src="/sanghamitra logo.jpeg" alt="Logo" style={{ width: "60px", marginBottom: "2px" }} />
            <h2 style={{ margin: "2px 0" }}>SANGHAMITRA</h2>
            <p style={{ margin: "2px 0" }}>Date: {new Date(bill.date).toLocaleDateString()}</p>
            <p style={{ margin: "2px 0" }}>Customer: {bill.customerName}</p>
            <h3 style={{ fontWeight: "bold", margin: "4px 0" }}>INVOICE</h3>
          </div>

          {/* Column aligned bill layout */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", fontSize: "13px" }}>
            {/* Header row */}
            <div style={{ fontWeight: "bold", borderBottom: "1px solid black", padding: "2px" }}>Product</div>
            <div style={{ fontWeight: "bold", borderBottom: "1px solid black", textAlign: "center", padding: "2px" }}>Qty</div>
            <div style={{ fontWeight: "bold", borderBottom: "1px solid black", textAlign: "center", padding: "2px" }}>Price</div>
            <div style={{ fontWeight: "bold", borderBottom: "1px solid black", textAlign: "right", padding: "2px" }}>Total</div>

            {/* Data rows */}
            {bill.products.map((p, index) => (
              <React.Fragment key={index}>
                <div style={{ padding: "2px" }}>{p.product}</div>
                <div style={{ textAlign: "center", padding: "2px" }}>{p.quantity}</div>
                <div style={{ textAlign: "center", padding: "2px" }}>{p.price?.toFixed(2)}</div>
                <div style={{ textAlign: "right", padding: "2px" }}>{p.total?.toFixed(2)}</div>
              </React.Fragment>
            ))}
          </div>

          <hr />
          {/* Totals */}
          <div style={{ display: "flex", flexDirection: "column", fontWeight: "bold" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Amount</span>
                <span>₹{bill.totalAmount?.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Qty:</span>
                <span>{totalQty}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Items:</span>
                <span>{totalItems}</span>
              </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: "10px", fontSize: "12px" }}>
            Sanghamitra Business Incubator<br />
            Website: <a href="https://sanghamitra.store" target="_blank" rel="noreferrer">sanghamitra.store</a><br />
            Contact: +919234567890
          </div>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button onClick={() => window.print()}>Print Invoice</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
