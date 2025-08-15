import React, { useState, useEffect } from "react";

const productData = {
  "Adult T-shirt": {
    price: 350,
    subcategories: ["Square", "Circle", "Rectangle", "Skull"],
    colors: ["Black", "White", "Lavender", "Blue", "Grey", "Sandle Wood"],
    sizes: ["S", "M", "L", "XL"],
  },
  "Kids T-shirts": {
    price: 300,
    subcategories: ["Lion", "Tiger", "Wolf"],
    colors: ["Black", "White", "Lavender", "Blue", "Grey"],
    sizes: ["60", "65", "70", "75", "80", "85"],
  },
  Cups: {
    price: 250,
    subcategories: ["Lion", "Tiger", "Wolf"],
    colors: [],
    sizes: [],
  },
  Print: {
    price: 150,
    subcategories: ["Babasaheb"],
    colors: [],
    sizes: [],
  },
  Frame: {
    price: 400,
    subcategories: ["Babasaheb"],
    colors: [],
    sizes: [],
  },
  Bag: {
    price: 500,
    subcategories: [],
    colors: [],
    sizes: [],
  },
};

function App() {
  const [section, setSection] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState([]);
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [savedBills, setSavedBills] = useState([]);

  useEffect(() => {
    const storedBills = JSON.parse(localStorage.getItem("bills") || "[]");
    setSavedBills(storedBills);
  }, []);

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubcategory("");
    setSelectedColor("");
    setSelectedSize("");
    setPrice(productData[cat].price);
  };

  const addToBill = () => {
    if (!selectedCategory) return alert("Select category");
    const total = price * quantity;
    const newItem = {
      category: selectedCategory,
      subcategory: selectedSubcategory,
      color: selectedColor,
      size: selectedSize,
      price,
      qty: quantity,
      total,
    };
    setBillItems([...billItems, newItem]);
  };

  const saveBill = () => {
    if (!billDate || !customerName) return alert("Enter date & customer name");
    if (billItems.length === 0) return alert("Add items to bill");

    const newBill = {
      id: Date.now(),
      date: billDate,
      customer: customerName,
      items: billItems,
      total: billItems.reduce((s, i) => s + i.total, 0),
    };

    const updatedBills = [...savedBills, newBill];
    setSavedBills(updatedBills);
    localStorage.setItem("bills", JSON.stringify(updatedBills));
    setBillItems([]);
    setCustomerName("");
    alert("Bill saved");
  };

  const printBill = (items = billItems, bill = null) => {
    if (items.length === 0) return alert("No items to print");

    let table = `<table border="1" style="width:100%;border-collapse:collapse;text-align:center">
      <tr><th>Category</th><th>Subcategory</th><th>Color</th><th>Size</th><th>Price</th><th>Qty</th><th>Total</th></tr>`;

    items.forEach((item) => {
      table += `<tr>
        <td>${item.category}</td>
        <td>${item.subcategory}</td>
        <td>${item.color}</td>
        <td>${item.size}</td>
        <td>${item.price}</td>
        <td>${item.qty}</td>
        <td>${item.total}</td>
      </tr>`;
    });

table += `</table><h3>Grand Total: ₹${items.reduce((s, i) => s + i.total, 0)}</h3>`;

    const w = window.open("", "", "width=800,height=600");
    if (bill) {
      w.document.write(`<h2>Sanghamitra</h2>
      <h3>Bill ID: ${bill.id}</h3>
      <p>Date: ${bill.date}</p>
      <p>Customer: ${bill.customer}</p>`);
    }
    w.document.write(table);
    w.document.close();
    w.print();
  };

  return (
    <div className="app">
      <header>Sanghamitra</header>
      <div className="sidebar">
          <button
            onClick={() => setSection("dashboard")}
            style={{ background: "none", border: "none", padding: 0, color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setSection("bill")}
            style={{ background: "none", border: "none", padding: 0, color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            Bill
          </button>
          <button
            onClick={() => setSection("viewBills")}
            style={{ background: "none", border: "none", padding: 0, color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            View Bills
          </button>
          <button
            onClick={() => setSection("login")}
            style={{ background: "none", border: "none", padding: 0, color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            Login
          </button>
          <button
            onClick={() => setSection("analytics")}
            style={{ background: "none", border: "none", padding: 0, color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            Analytics
          </button>
          <button
            onClick={() => setSection("productManagement")}
            style={{ background: "none", border: "none", padding: 0, color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            Product Management
          </button>
          <button
            onClick={() => setSection("adminDashboard")}
            style={{ background: "none", border: "none", padding: 0, color: "blue", cursor: "pointer", textDecoration: "underline" }}
          >
            Admin Dashboard
          </button>
      </div>

      <div className="main">
        {section === "dashboard" && <h2>Dashboard</h2>}

        {section === "bill" && (
          <div>
            <h2>Create Bill</h2>
            <label>Date:</label>
            <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />

            <label>Customer Name:</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />

            <h3>Categories</h3>
            {Object.keys(productData).map((cat) => (
              <button key={cat} onClick={() => selectCategory(cat)}>
                {cat}
              </button>
            ))}

            {selectedCategory && (
              <>
                <h3>Subcategories</h3>
                {productData[selectedCategory].subcategories.map((sub) => (
                  <button key={sub} onClick={() => setSelectedSubcategory(sub)}>
                    {sub}
                  </button>
                ))}

                <h3>Colors</h3>
                {productData[selectedCategory].colors.map((c) => (
                  <button key={c} onClick={() => setSelectedColor(c)}>
                    {c}
                  </button>
                ))}

                <h3>Sizes</h3>
                {productData[selectedCategory].sizes.map((s) => (
                  <button key={s} onClick={() => setSelectedSize(s)}>
                    {s}
                  </button>
                ))}
              </>
            )}

            <h3>Price</h3>
            <input type="number" value={price} readOnly />

            <h3>Quantity</h3>
            <input type="number" value={quantity} min="1" onChange={(e) => setQuantity(parseInt(e.target.value))} />

            <button onClick={addToBill}>Add to Bill</button>
            <button onClick={saveBill}>Save Bill</button>
            <button onClick={() => printBill()}>Print Current Bill</button>

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
                {billItems.map((item, i) => (
                  <tr key={i}>
                    <td>{item.category}</td>
                    <td>{item.subcategory}</td>
                    <td>{item.color}</td>
                    <td>{item.size}</td>
                    <td>{item.price}</td>
                    <td>{item.qty}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3>Grand Total: ₹{billItems.reduce((s, i) => s + i.total, 0)}</h3>
          </div>
        )}

        {section === "viewBills" && (
          <div>
            <h2>Saved Bills</h2>
            <table>
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>{bill.id}</td>
                    <td>{bill.date}</td>
                    <td>{bill.customer}</td>
                    <td>{bill.total}</td>
                    <td>
                      <button onClick={() => printBill(bill.items, bill)}>Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === "login" && <h2>Login</h2>}
        {section === "analytics" && <h2>Analytics</h2>}
        {section === "productManagement" && <h2>Product Management</h2>}
        {section === "adminDashboard" && <h2>Admin Dashboard</h2>}
      </div>
    </div>
  );
}

export default App;