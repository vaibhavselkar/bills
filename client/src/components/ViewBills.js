import React, { useEffect, useState } from 'react';
import '../styles/ViewBills.css';
import Sidebar from "./Sidebar";

const ViewBills = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [occasionFilter, setOccasionFilter] = useState(''); // 🔥 NEW: Occasion filter
  const [uniqueOccasions, setUniqueOccasions] = useState([]); // 🔥 NEW: List of all occasions
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch('https://bills-welding.vercel.app/api/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      const sorted = data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setBills(sorted);
      
      // 🔥 Extract unique occasions from bills
      const occasions = [...new Set(data.map(bill => bill.occasion).filter(o => o && o.trim() !== ''))];
      setUniqueOccasions(occasions);
    } catch (error) {
      console.error('Error fetching bills:', error);
      alert('Error fetching bills');
    }
  };

  const filteredBills = bills.filter(bill => {
    const nameMatch = bill.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = dateFilter
      ? new Date(bill.date || bill.createdAt).toDateString() === new Date(dateFilter).toDateString()
      : true;
    
    // 🔥 NEW: Occasion filter logic
    const occasionMatch = occasionFilter === ''
      ? true // Show all if no filter selected
      : occasionFilter === 'no-occasion'
      ? (!bill.occasion || bill.occasion.trim() === '') // Show bills without occasion
      : bill.occasion === occasionFilter; // Show bills matching selected occasion
    
    return nameMatch && dateMatch && occasionMatch;
  });

  const totalStats = {
    totalBills: filteredBills.length,
    totalAmount: filteredBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    cashAmount: filteredBills.filter(b => b.paymentMethod === 'Cash').reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    onlineAmount: filteredBills.filter(b => b.paymentMethod === 'Online' || b.paymentMethod === 'UPI').reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setOccasionFilter(''); // 🔥 Reset occasion filter
  };

  return (
    <div className="dashboard">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        onItemClick={handleSidebarItemClick}
      />
      
      <main style={{
        marginTop: "70px",
        marginLeft: isSidebarOpen ? "280px" : "0",
        transition: "margin-left 0.3s ease",
        padding: "30px",
        minHeight: "calc(100vh - 70px)"
      }}>
      
        <div className="admin-container">
          <div className="stats">
            <div className="stat-card">
              <div className="stat-value">{totalStats.totalBills}</div>
              <div className="stat-label">Total Bills</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{totalStats.totalAmount.toFixed(2)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{totalStats.cashAmount.toFixed(2)}</div>
              <div className="stat-label">Cash Payments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₹{totalStats.onlineAmount.toFixed(2)}</div>
              <div className="stat-label">Online Payments</div>
            </div>
          </div>

          <div className="controls">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search by customer name..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
              
              <input 
                type="date" 
                value={dateFilter} 
                onChange={e => setDateFilter(e.target.value)} 
              />
              
              {/* 🔥 NEW: Occasion Filter Dropdown */}
              <select 
                value={occasionFilter} 
                onChange={e => setOccasionFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Occasions</option>
                <option value="no-occasion">No Occasion (Daily Bills)</option>
                {uniqueOccasions.map((occasion, index) => (
                  <option key={index} value={occasion}>
                    🎉 {occasion}
                  </option>
                ))}
              </select>
              
              <button onClick={resetFilters}>Reset Filters</button>
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
                <th>Mobile Number</th>
                <th>Occasion</th> {/* 🔥 NEW: Occasion column */}
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No bills found matching your filters
                  </td>
                </tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill._id}>
                    <td className="date-column">
                      {new Date(bill.date || bill.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit'
                      })}
                    </td>
                    <td>{bill.customerName}</td>
                    <td>
                      {bill.products.length} items{" "}
                      <span 
                        className="toggle-details" 
                        onClick={e => {
                          const el = e.target.nextSibling;
                          el.style.display = el.style.display === 'block' ? 'none' : 'block';
                          e.target.textContent = el.style.display === 'block' ? '(hide details)' : '(show details)';
                        }}
                      >
                        (show details)
                      </span>
                      <div className="product-details" style={{ display: 'none' }}>
                        {bill.products.map((p, i) => (
                          <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #eee' }}>
                            <strong>{p.product}</strong> - {p.category}
                            {p.subcategory?.sku && (
                              <span style={{ fontSize: '12px', color: '#666' }}>
                                {' '}(SKU: {p.subcategory.sku})
                              </span>
                            )}
                            <br />
                            <span style={{ fontSize: '13px' }}>
                              Qty: {p.quantity} × ₹{p.price} 
                              {p.discount > 0 && ` - ${p.discount}% off`}
                              {' '}= ₹{p.total.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: bill.paymentMethod === 'Cash' ? '#dcfce7' : '#dbeafe',
                        color: bill.paymentMethod === 'Cash' ? '#166534' : '#1e40af'
                      }}>
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', fontSize: '15px' }}>
                      ₹{bill.totalAmount.toFixed(2)}
                    </td>
                    <td>{bill.mobileNumber || 'N/A'}</td>
                    <td>
                      {bill.occasion && bill.occasion.trim() !== '' ? (
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: '#fef3c7',
                          color: '#92400e'
                        }}>
                          🎉 {bill.occasion}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                          Daily
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ViewBills;
