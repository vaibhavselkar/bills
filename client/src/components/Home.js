import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/Home.css';

// Product Data
const productData = {
  "Adult T-shirt": { price: 350, subcategories: ["Square", "Circle", "Rectangle", "Skull"], colors: ["Black", "White", "Lavender", "Blue", "Grey", "Sandle Wood"], sizes: ["S", "M", "L", "XL"] },
"Kids T-shirts": { 
  price: 300, 
  subcategories: [
    "Chameleon",
    "Deer",
    "Elephant",
    "Wolf",
    "Frog",
    "Lioness",
    "Cub",
    "Lion",
    "Peacock",
    "Goat",
    "Tiger",
    "Baby fox",
    "Baby wolf"
  ], 
  colors: ["Black", "White", "Lavender", "Blue", "Grey"], 
  sizes: ["60", "65", "70", "75", "80", "85"] 
},
  Cups: { price: 250, subcategories: ["Chameleon",
    "Deer",
    "Elephant",
    "Wolf",
    "Frog",
    "Lioness",
    "Cub",
    "Lion",
    "Peacock",
    "Goat",
    "Tiger",
    "Baby fox",
    "Baby wolf"], colors: [], sizes: [] },
  Print: { 
  price: 150, 
  subcategories: [
    "Babasaheb", 
    "Jotiba and Savitri", 
    "People’s Babasaheb", 
    "Reading with Babasaheb", 
    "Savitri and Fatima", 
    "Under Babasaheb’s Umbrella"
  ], 
  colors: [], 
  sizes: [] 
},

Frame: { 
  price: 400, 
  subcategories: [
    "Babasaheb", 
    "Jotiba and Savitri", 
    "People’s Babasaheb", 
    "Reading with Babasaheb", 
    "Savitri and Fatima", 
    "Under Babasaheb’s Umbrella"
  ], 
  colors: [], 
  sizes: [] 
},
  Bag: { price: 500, subcategories: ["Rexine", "Jute"], colors: ["brown", "pink" , "pink"], sizes: [] },
   
  EDUtoys: {
  price: 200,
  subcategories: {
    Alfabets: ["Capital", "Small"],
    Fractions: ["Circle", "Bars"],
    Geometry: []
  },
  colors: [],
  sizes: []
}

};
  


const Home = () => {
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [billItems, setBillItems] = useState([]);
  const [draftItem, setDraftItem] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('');
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const savedBills = JSON.parse(localStorage.getItem("bills") || "[]");
    setBills(savedBills);
  }, [currentSection]);

  const renderDashboard = () => (
    <>
      <div className="welcome-section">
        <h2>Dashboard</h2>
        <p>Select an option from the dashboard below to get started.</p>
      </div>
      <div className="grid">
        <div className="card bill" onClick={() => setCurrentSection('bill')}>
          <h3>Create Bill</h3>
          <p>Create and manage new bills</p>
        </div>
        <div className="card view" onClick={() => setCurrentSection('viewBills')}>
          <h3>View Bills</h3>
          <p>Check all saved bills</p>
        </div>
        <div className="card products" onClick={() => setCurrentSection('products')}>
          <h3>Products</h3>
          <p>View product categories</p>
        </div>
        <div className="card analytics" onClick={() => setCurrentSection('analytics')}>
          <h3>Analytics</h3>
          <p>View sales analytics & insights</p>
        </div>
      </div>
    </>
  );

  const renderLogin = () => (
    <div className="form-container">
      <h2 className="form-title">Login</h2>
      <label>Email:</label>
      <input type="email" placeholder="Enter email" />
      <label>Password:</label>
      <input type="password" placeholder="Enter password" />
      <button>Login</button>
      <button className="back-btn" onClick={() => setCurrentSection('dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );

  const renderProducts = () => (
    <div className="welcome-section">
      <h2>Products</h2>
      <p>Products categories will be shown here.</p>
      <button className="back-btn" onClick={() => setCurrentSection('dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div>
      <div className="header">
        <h1>Sanghamitra Billing System</h1>
        <button className="login-btn" onClick={() => setCurrentSection('login')}>
          Login
        </button>
      </div>

      <div className="content">
        {currentSection === 'dashboard' && renderDashboard()}
        {currentSection === 'login' && renderLogin()}
        {currentSection === 'bill' && (
          <BillForm 
            setCurrentSection={setCurrentSection}
            billItems={billItems}
            setBillItems={setBillItems}
            draftItem={draftItem}
            setDraftItem={setDraftItem}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        )}
        {currentSection === 'viewBills' && (
          <ViewBills 
            setCurrentSection={setCurrentSection}
            bills={bills}
          />
        )}
        {currentSection === 'products' && renderProducts()}
        {currentSection === 'analytics' && (
          <Analytics 
            setCurrentSection={setCurrentSection}
            bills={bills}
          />
        )}
      </div>
    </div>
  );
};

const BillForm = ({ setCurrentSection, billItems, setBillItems, draftItem, setDraftItem, paymentMethod, setPaymentMethod }) => {
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    if (selectedCategory) {
      const newDraft = {
        category: selectedCategory,
        subcategory: "",
        color: "",
        size: "",
        price: productData[selectedCategory].price,
        qty: 1,
        total: productData[selectedCategory].price
      };
      setDraftItem(newDraft);
    }
  }, [selectedCategory, setDraftItem]);

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedOptions({});
  };

  const setDraftField = (field, value) => {
    const updatedDraft = { ...draftItem, [field]: value };
    setDraftItem(updatedDraft);
    setSelectedOptions({ ...selectedOptions, [field]: value });
  };

  const updateDraftPrice = (price) => {
    const updatedDraft = { ...draftItem, price: parseInt(price) };
    updatedDraft.total = updatedDraft.price * updatedDraft.qty;
    setDraftItem(updatedDraft);
  };

  const updateDraftQty = (qty) => {
    const updatedDraft = { ...draftItem, qty: parseInt(qty) };
    updatedDraft.total = updatedDraft.price * updatedDraft.qty;
    setDraftItem(updatedDraft);
  };

  const addItem = () => {
    if (!draftItem.category) {
      alert("Please select a category first!");
      return;
    }
    
    setBillItems([...billItems, { ...draftItem }]);
    setDraftItem({});
    setSelectedCategory(null);
    setSelectedOptions({});
  };

  const editItem = (index, field, value) => {
    const updatedItems = [...billItems];
    updatedItems[index][field] = parseInt(value);
    updatedItems[index].total = updatedItems[index].price * updatedItems[index].qty;
    setBillItems(updatedItems);
  };

  const removeItem = (index) => {
    const updatedItems = [...billItems];
    updatedItems.splice(index, 1);
    setBillItems(updatedItems);
  };

  const saveBill = () => {
    if (!billDate || !customerName) {
      alert("Please enter both date and customer name!");
      return;
    }
    
    if (!paymentMethod) {
      alert("Please select a payment method!");
      return;
    }
    
    if (billItems.length === 0) {
      alert("Please add at least one item to the bill!");
      return;
    }

    const savedBills = JSON.parse(localStorage.getItem("bills") || "[]");
    const id = Date.now();
    const newBill = { 
      id, 
      date: billDate, 
      customer: customerName, 
      items: billItems, 
      paymentMethod, 
      total: billItems.reduce((sum, item) => sum + (item.price * item.qty), 0) 
    };
    
    savedBills.push(newBill);
    localStorage.setItem("bills", JSON.stringify(savedBills));

    alert("Bill Saved Successfully!");
    setBillItems([]);
    setDraftItem({});
    setPaymentMethod('');
    setBillDate(new Date().toISOString().split("T")[0]);
    setCustomerName('');
    setSelectedCategory(null);
    setSelectedOptions({});
  };

  const grandTotal = billItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <>
      <div className="welcome-section">
        <h2>Create Bill</h2>
        <p>Create a new bill with product details</p>
      </div>
      
      <div className="form-container">
        <div className="form-row">
          <div className="form-column">
            <div className="compact-input">
              <label><b>Date:</b></label>
              <input 
                type="date" 
                value={billDate} 
                onChange={(e) => setBillDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-column">
            <div className="compact-input">
              <label><b>Customer Name:</b></label>
              <input 
                type="text" 
                value={customerName}
                placeholder="Enter customer name"
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <h3 className="section-title">Product Selection</h3>
        
        <div className="product-selection">
          <div className="compact-input">
            <label><b>Categories:</b></label>
            <div className="compact-option-buttons" id="categories">
              {Object.keys(productData).map(cat => (
                <button 
                  key={cat}
                  className={`option-button compact-option-button ${selectedCategory === cat ? 'selected' : ''}`}
                  onClick={() => selectCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {selectedCategory && (
            <div>
              <div className="product-options-grid">
                {productData[selectedCategory].subcategories.length > 0 && (
                  <div className="option-group">
                    <h4>Subcategories</h4>
                    <div className="compact-option-buttons" id="subcats">
                      {productData[selectedCategory].subcategories.map(s => (
                        <button 
                          key={s}
                          className={`option-button compact-option-button ${selectedOptions.subcategory === s ? 'selected' : ''}`}
                          onClick={() => setDraftField('subcategory', s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {productData[selectedCategory].colors.length > 0 && (
                  <div className="option-group">
                    <h4>Colors</h4>
                    <div className="compact-option-buttons" id="colors">
                      {productData[selectedCategory].colors.map(c => (
                        <button 
                          key={c}
                          className={`option-button compact-option-button ${selectedOptions.color === c ? 'selected' : ''}`}
                          onClick={() => setDraftField('color', c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {productData[selectedCategory].sizes.length > 0 && (
                  <div className="option-group">
                    <h4>Sizes</h4>
                    <div className="compact-option-buttons" id="sizes">
                      {productData[selectedCategory].sizes.map(s => (
                        <button 
                          key={s}
                          className={`option-button compact-option-button ${selectedOptions.size === s ? 'selected' : ''}`}
                          onClick={() => setDraftField('size', s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-column">
                  <div className="compact-input">
                    <label><b>Price:</b></label>
                    <input 
                      type="number" 
                      value={draftItem.price || productData[selectedCategory].price}
                      onChange={(e) => updateDraftPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-column">
                  <div className="compact-input">
                    <label><b>Quantity:</b></label>
                    <input 
                      type="number" 
                      value={draftItem.qty || 1}
                      min="1"
                      onChange={(e) => updateDraftQty(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button onClick={addItem}>➕ Add Item to Bill</button>
        </div>
        
        <h3 className="section-title">Bill Items</h3>
        {billItems.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Color</th>
                <th>Size</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.category}</td>
                  <td>{item.subcategory}</td>
                  <td>{item.color}</td>
                  <td>{item.size}</td>
                  <td>
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => editItem(i, 'price', e.target.value)}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={item.qty} 
                      min="1" 
                      onChange={(e) => editItem(i, 'qty', e.target.value)}
                    />
                  </td>
                  <td>₹{item.price * item.qty}</td>
                  <td>
                    <button onClick={() => removeItem(i)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items added yet.</p>
        )}
        
        <h3>Grand Total: ₹{grandTotal}</h3>
        
        <h3 className="section-title">Payment Method</h3>
        <div className="option-buttons">
          <button 
            className={`option-button ${paymentMethod === 'Cash' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('Cash')}
          >
            Cash
          </button>
          <button 
            className={`option-button ${paymentMethod === 'UPI' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('UPI')}
          >
            UPI
          </button>
        </div>
        
        {paymentMethod && <h3>Payment Method: {paymentMethod}</h3>}
        
        <button onClick={saveBill}>💾 Save Bill</button>
        <button className="back-btn" onClick={() => setCurrentSection('dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </>
  );
};

const ViewBills = ({ setCurrentSection, bills }) => {
  return (
    <>
      <div className="welcome-section">
        <h2>Saved Bills</h2>
        <p>All your saved bills are displayed below.</p>
        <button className="back-btn" onClick={() => setCurrentSection('dashboard')}>
          Back to Dashboard
        </button>
      </div>
      
      {bills.length === 0 ? (
        <div className="form-container"><p>No bills saved yet.</p></div>
      ) : (
        bills.map(bill => (
          <div key={bill.id} className="form-container">
            <div className="bill-box">
              <div className="bill-header">Bill ID: {bill.id}</div>
              <p><b>Date:</b> {bill.date}</p>
              <p><b>Customer:</b> {bill.customer}</p>
              <p><b>Payment Method:</b> {bill.paymentMethod}</p>
              <p><b>Total:</b> ₹{bill.total}</p>
              
              <h4>Products</h4>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.category}</td>
                      <td>{item.subcategory}</td>
                      <td>{item.color}</td>
                      <td>{item.size}</td>
                      <td>₹{item.price}</td>
                      <td>{item.qty}</td>
                      <td>₹{item.price * item.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </>
  );
};

const Analytics = ({ setCurrentSection, bills }) => {
  const [chart, setChart] = useState(null);

  useEffect(() => {
    let productCount = {};

    bills.forEach(bill => {
      bill.items.forEach(item => {
        productCount[item.category] = (productCount[item.category] || 0) + item.qty;
      });
    });

    const labels = Object.keys(productCount);
    const data = Object.values(productCount);

    const ctx = document.getElementById('analyticsChart');
    if (ctx) {
      if (chart) {
        chart.destroy();
      }

      const newChart = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Product Sales Count',
            data: data,
            backgroundColor: 'rgba(138, 76, 118, 0.7)',
            borderColor: 'rgba(138, 76, 118, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });

      setChart(newChart);
    }

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [bills, chart]);

  return (
    <>
      <div className="welcome-section">
        <h2>Analytics</h2>
        <p>Sales analytics based on your billing data.</p>
        <button className="back-btn" onClick={() => setCurrentSection('dashboard')}>
          Back to Dashboard
        </button>
      </div>
      <div className="form-container">
        <canvas id="analyticsChart" width="400" height="200"></canvas>
      </div>
    </>
  );
};

// Render the app
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Home />);

export default Home;