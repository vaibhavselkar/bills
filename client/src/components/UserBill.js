import React, { useEffect, useState } from 'react';
import '../styles/ViewBills.css';
import Navbar from "./Navbar";

const ViewBills = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [editingBill, setEditingBill] = useState(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    mobileNumber: "",
    paymentMethod: "Cash",
    totalAmount: 0,
    products: []
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch("https://bills-welding.vercel.app/api/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch bills");
      }

      const sorted = data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setBills(sorted);
    } catch (error) {
      console.error('Error fetching bills:', error);
      alert('Error fetching bills');
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill._id);
    setEditForm({
      customerName: bill.customerName,
      mobileNumber: bill.mobileNumber || "",
      paymentMethod: bill.paymentMethod,
      totalAmount: bill.totalAmount,
      products: bill.products.map(p => ({ ...p })) // Clone products array
    });
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...editForm.products];
    updatedProducts[index][field] = value;

    // Auto-calculate total for this product
    if (field === "quantity" || field === "price" || field === "discount") {
      const qty = parseFloat(updatedProducts[index].quantity) || 0;
      const price = parseFloat(updatedProducts[index].price) || 0;
      const discount = parseFloat(updatedProducts[index].discount) || 0;
      
      const discountedPrice = price - (price * discount / 100);
      updatedProducts[index].total = qty * discountedPrice;
    }

    // Recalculate total amount
    const newTotalAmount = updatedProducts.reduce((sum, p) => sum + (p.total || 0), 0);

    setEditForm({
      ...editForm,
      products: updatedProducts,
      totalAmount: newTotalAmount
    });
  };

  const addProduct = () => {
    setEditForm({
      ...editForm,
      products: [
        ...editForm.products,
        {
          product: "",
          category: "",
          quantity: 1,
          price: 0,
          discount: 0,
          total: 0
        }
      ]
    });
  };

  const removeProduct = (index) => {
    if (editForm.products.length === 1) {
      alert("At least one product is required");
      return;
    }

    const updatedProducts = editForm.products.filter((_, i) => i !== index);
    const newTotalAmount = updatedProducts.reduce((sum, p) => sum + (p.total || 0), 0);

    setEditForm({
      ...editForm,
      products: updatedProducts,
      totalAmount: newTotalAmount
    });
  };

  const handleSave = async (billId) => {
    // Validation
    if (!editForm.customerName.trim()) {
      alert("Customer name is required");
      return;
    }

    if (editForm.products.some(p => !p.product.trim())) {
      alert("All products must have a name");
      return;
    }

    try {
      const response = await fetch(`https://bills-welding.vercel.app/api/bill/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Bill updated successfully!");
        setEditingBill(null);
        fetchBills();
      } else {
        alert(data.message || "Failed to update bill");
      }
    } catch (err) {
      console.error("Error updating bill:", err);
      alert("Error updating bill");
    }
  };

  const handleCancel = () => {
    setEditingBill(null);
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

  const downloadCSV = () => {
    if (filteredBills.length === 0) {
      alert("No data to download");
      return;
    }

    const headers = [
      "Date",
      "Customer Name",
      "Items",
      "Payment Method",
      "Total Amount"
    ];

    const rows = filteredBills.map(bill => [
      new Date(bill.date || bill.createdAt).toLocaleString('en-IN'),
      bill.customerName,
      bill.products.map(p => `${p.product} (${p.category}) x${p.quantity}`).join("; "),
      bill.paymentMethod,
      bill.totalAmount
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `customer_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard">
      <Navbar />

      <div className="admin-container">
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
          <button onClick={downloadCSV} style={{ background: "#4CAF50", color: "#fff" }}>Download CSV</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Mobile</th>
              <th>Items</th>
              <th>Payment Method</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>No bills found</td></tr>
            ) : (
              filteredBills.map(bill => (
                <React.Fragment key={bill._id}>
                  <tr>
                    <td className="date-column">
                      {new Date(bill.date || bill.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td>
                      {editingBill === bill._id ? (
                        <input
                          type="text"
                          value={editForm.customerName}
                          onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                          style={{ width: "100%", padding: "0.3rem" }}
                        />
                      ) : (
                        bill.customerName
                      )}
                    </td>
                    <td>
                      {editingBill === bill._id ? (
                        <input
                          type="tel"
                          value={editForm.mobileNumber}
                          onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                          style={{ width: "100%", padding: "0.3rem" }}
                        />
                      ) : (
                        bill.mobileNumber || "N/A"
                      )}
                    </td>
                    <td>
                      {editingBill === bill._id ? (
                        <div>
                          <strong>{editForm.products.length} items</strong>
                          <button
                            onClick={addProduct}
                            style={{
                              marginLeft: "10px",
                              padding: "0.3rem 0.6rem",
                              background: "#673199",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.85rem"
                            }}
                          >
                            + Add Product
                          </button>
                        </div>
                      ) : (
                        <>
                          {bill.products.length} items{" "}
                          <span className="toggle-details" onClick={e => {
                            const el = e.target.nextSibling;
                            el.style.display = el.style.display === 'block' ? 'none' : 'block';
                            e.target.textContent = el.style.display === 'block' ? '(hide)' : '(show)';
                          }}>(show)</span>
                          <div className="product-details" style={{ display: 'none' }}>
                            {bill.products.map((p, i) => (
                              <div key={i}>{p.product} - {p.category} (Qty: {p.quantity}, ₹{p.price}, Disc: {p.discount}%)</div>
                            ))}
                          </div>
                        </>
                      )}
                    </td>
                    <td>
                      {editingBill === bill._id ? (
                        <select
                          value={editForm.paymentMethod}
                          onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                          style={{ width: "100%", padding: "0.3rem" }}
                        >
                          <option value="Cash">💵 Cash</option>
                          <option value="Online">📱 Online</option>
                          <option value="UPI">📱 UPI</option>
                          <option value="Card">💳 Card</option>
                        </select>
                      ) : (
                        <span style={{
                          padding: "0.3rem 0.6rem",
                          borderRadius: "15px",
                          background: bill.paymentMethod === "Cash" ? "#c8e6c9" : "#bbdefb",
                          color: bill.paymentMethod === "Cash" ? "#2e7d32" : "#1565c0",
                          fontSize: "0.85rem",
                          fontWeight: "600"
                        }}>
                          {bill.paymentMethod === "Cash" ? "💵" : "📱"} {bill.paymentMethod}
                        </span>
                      )}
                    </td>
                    <td style={{ fontWeight: "bold", color: "#2e7d32" }}>
                      ₹{editingBill === bill._id ? editForm.totalAmount.toFixed(2) : bill.totalAmount.toFixed(2)}
                    </td>
                    <td>
                      {editingBill === bill._id ? (
                        <>
                          <button
                            onClick={() => handleSave(bill._id)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              background: "#2e7d32",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginRight: "5px",
                              fontSize: "0.85rem"
                            }}
                          >
                            ✓ Save
                          </button>
                          <button
                            onClick={handleCancel}
                            style={{
                              padding: "0.4rem 0.8rem",
                              background: "#d32f2f",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.85rem"
                            }}
                          >
                            ✕ Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(bill)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            background: "#f57c00",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </td>
                  </tr>
                  
                  {/* Product Edit Section (shown only when editing) */}
                  {editingBill === bill._id && (
                    <tr>
                      <td colSpan="7" style={{ background: "#f8f9fa", padding: "1rem" }}>
                        <strong>Edit Products:</strong>
                        <div style={{ marginTop: "0.5rem" }}>
                          {editForm.products.map((product, index) => (
                            <div key={index} style={{
                              display: "grid",
                              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr auto",
                              gap: "0.5rem",
                              marginBottom: "0.5rem",
                              padding: "0.5rem",
                              background: "white",
                              borderRadius: "4px",
                              alignItems: "center"
                            }}>
                              <input
                                type="text"
                                placeholder="Product Name"
                                value={product.product}
                                onChange={(e) => handleProductChange(index, "product", e.target.value)}
                                style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }}
                              />
                              <input
                                type="text"
                                placeholder="Category"
                                value={product.category}
                                onChange={(e) => handleProductChange(index, "category", e.target.value)}
                                style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }}
                              />
                              <input
                                type="number"
                                placeholder="Qty"
                                value={product.quantity}
                                onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                min="1"
                                style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }}
                              />
                              <input
                                type="number"
                                placeholder="Price"
                                value={product.price}
                                onChange={(e) => handleProductChange(index, "price", e.target.value)}
                                min="0"
                                step="0.01"
                                style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }}
                              />
                              <input
                                type="number"
                                placeholder="Disc %"
                                value={product.discount}
                                onChange={(e) => handleProductChange(index, "discount", e.target.value)}
                                min="0"
                                max="100"
                                style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px" }}
                              />
                              <input
                                type="number"
                                placeholder="Total"
                                value={product.total.toFixed(2)}
                                readOnly
                                style={{ padding: "0.4rem", border: "1px solid #ddd", borderRadius: "4px", background: "#e9ecef" }}
                              />
                              <button
                                onClick={() => removeProduct(index)}
                                style={{
                                  padding: "0.4rem 0.6rem",
                                  background: "#dc3545",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer"
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewBills;
