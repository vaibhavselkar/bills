import React, { useEffect, useState } from 'react';

const ViewBills = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/');
      const data = await response.json();
      const sorted = data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setBills(sorted);
    } catch (error) {
      console.error('Error fetching bills:', error);
      alert('Error fetching bills');
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (response.ok) {
        alert('Bill deleted');
        fetchBills();
      } else {
        throw new Error(result.message);
      }

    } catch (err) {
      alert('Error deleting bill');
    }
  };

  const filteredBills = bills.filter(bill => {
    const nameMatch = bill.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = dateFilter
      ? new Date(bill.date || bill.createdAt).toDateString() === new Date(dateFilter).toDateString()
      : true;
    return nameMatch && dateMatch;
  });

  const totalStats = {
    totalBills: filteredBills.length,
    totalAmount: filteredBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    cashAmount: filteredBills.filter(b => b.paymentMethod === 'Cash').reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    onlineAmount: filteredBills.filter(b => b.paymentMethod === 'Online').reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  };

  return (
    <div className="admin-container">
      <div className="header">
        <button id="backBtn" onClick={() => window.location.href = '/'}>Go Back to Home</button>
        <h1>SANGHAMITRA BILL - Records</h1>
        <img src="/sanghamitra logo.jpeg" alt="Sanghamitra Logo" className="logo" />
      </div>

      <div className="stats">
        <div className="stat-card"><div className="stat-value">{totalStats.totalBills}</div><div className="stat-label">Total Bills</div></div>
        <div className="stat-card"><div className="stat-value">₹{totalStats.totalAmount.toFixed(2)}</div><div className="stat-label">Total Revenue</div></div>
        <div className="stat-card"><div className="stat-value">₹{totalStats.cashAmount.toFixed(2)}</div><div className="stat-label">Cash Payments</div></div>
        <div className="stat-card"><div className="stat-value">₹{totalStats.onlineAmount.toFixed(2)}</div><div className="stat-label">Online Payments</div></div>
      </div>

      <div className="controls">
        <div className="search-container">
          <input type="text" placeholder="Search by customer name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          <button onClick={() => { setSearchTerm(''); setDateFilter(''); }}>Reset</button>
        </div>
        <button onClick={fetchBills}>Refresh Data</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer Name</th>
            <th>Items</th>
            <th>Payment Method</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBills.length === 0 ? (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No bills found</td></tr>
          ) : (
            filteredBills.map(bill => (
              <tr key={bill._id}>
                <td className="date-column">
                  {new Date(bill.date || bill.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td>{bill.customerName}</td>
                <td>
                  {bill.products.length} items{" "}
                  <span className="toggle-details" onClick={e => {
                    const el = e.target.nextSibling;
                    el.style.display = el.style.display === 'block' ? 'none' : 'block';
                    e.target.textContent = el.style.display === 'block' ? '(hide details)' : '(show details)';
                  }}>(show details)</span>
                  <div className="product-details" style={{ display: 'none' }}>
                    {bill.products.map((p, i) => (
                      <div key={i}>{p.product} - {p.category} (Qty: {p.quantity}, ₹{p.price}, Disc: {p.discount}%)</div>
                    ))}
                  </div>
                </td>
                <td>{bill.paymentMethod}</td>
                <td>₹{bill.totalAmount.toFixed(2)}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteBill(bill._id)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ViewBills;
