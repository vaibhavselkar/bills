import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar"; // import the navbar
import "../styles/Dashboard.css";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [sales, setSales] = useState({ today: 0, month: 0, year: 0, custom: 0 });
  const [revenue, setRevenue] = useState({ today: 0, month: 0, year: 0, custom: 0 });
  const [customers, setCustomers] = useState({ today: 0, month: 0, year: 0, custom: 0 });
  const [selected, setSelected] = useState("year");
  const [billData, setBillData] = useState([]);

  // For custom date filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch all data (for Today/Month/Year)
  useEffect(() => {
    fetch("https://billing-app-server.vercel.app/api/")
      .then((res) => res.json())
      .then((data) => processDefaultData(data))
      .catch((err) => console.error("Error fetching dashboard data:", err));
  }, []);

  // Process Today/Month/Year data
  const processDefaultData = (data) => {
    setBillData(data);
    const now = new Date();

    const filtered = data.reduce(
      (acc, bill) => {
        const date = new Date(bill.date || bill.createdAt);
        const sameDay = date.toDateString() === now.toDateString();
        const sameMonth =
          date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        const sameYear = date.getFullYear() === now.getFullYear();

        const inc = (key) => {
          acc.sales[key]++;
          acc.revenue[key] += bill.totalAmount || 0;
          if (!acc.customersSet[key].has(bill.customerName)) {
            acc.customers[key]++;
            acc.customersSet[key].add(bill.customerName);
          }
        };

        if (sameDay) inc("today");
        if (sameMonth) inc("month");
        if (sameYear) inc("year");

        return acc;
      },
      {
        sales: { today: 0, month: 0, year: 0, custom: 0 },
        revenue: { today: 0, month: 0, year: 0, custom: 0 },
        customers: { today: 0, month: 0, year: 0, custom: 0 },
        customersSet: { today: new Set(), month: new Set(), year: new Set(), custom: new Set() },
      }
    );

    setSales(filtered.sales);
    setRevenue(filtered.revenue);
    setCustomers(filtered.customers);
  };

  // Fetch Custom Range
  const fetchCustomRange = () => {
    if (!startDate || !endDate) return;

    fetch(`https://billing-app-server.vercel.app/api/?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        setBillData(data); // use only custom bills
        let customSales = data.length;
        let customRevenue = data.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        let customCustomers = new Set(data.map((b) => b.customerName)).size;

        setSales((prev) => ({ ...prev, custom: customSales }));
        setRevenue((prev) => ({ ...prev, custom: customRevenue }));
        setCustomers((prev) => ({ ...prev, custom: customCustomers }));

        setSelected("custom");
      })
      .catch((err) => console.error("Error fetching custom range data:", err));
  };

  // Bills to show in charts
  const now = new Date();
  let filteredBills = [];
  if (selected === "today") {
    filteredBills = billData.filter(
      (b) => new Date(b.date || b.createdAt).toDateString() === now.toDateString()
    );
  } else if (selected === "month") {
    filteredBills = billData.filter((b) => {
      const d = new Date(b.date || b.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } else if (selected === "year") {
    filteredBills = billData.filter(
      (b) => new Date(b.date || b.createdAt).getFullYear() === now.getFullYear()
    );
  } else if (selected === "custom") {
    filteredBills = billData; // already filtered by API
  }

  // Payment breakdown
  const paymentBreakdown = filteredBills.reduce(
    (acc, bill) => {
      if (bill.paymentMethod === "Cash") acc.cash += bill.totalAmount;
      else if (bill.paymentMethod === "Online") acc.online += bill.totalAmount;
      return acc;
    },
    { cash: 0, online: 0 }
  );

  // Revenue by product type
  const categoryTotals = {};
  filteredBills.forEach((bill) => {
    bill.products.forEach((p) => {
      categoryTotals[p.product] = (categoryTotals[p.product] || 0) + p.total;
    });
  });

  const categoryChartData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: key,
    value: parseFloat(value.toFixed(2)),
  }));

  const COLORS = [
    "#45722dff",
    "#003366",
    "#b69044ff",
    "#b66035ff",
    "#368f7fff",
    "#8a6e31ff",
    "#235d8fff",
  ];

  return (
    <div className="dashboard">
      <Sidebar /> {/* Use Navbar component */}

        <main className="dashboard-main">
          <h2>Dashboard</h2>

          {/* Time Selector */}
          <div className="time-selector">
            <button onClick={() => setSelected("year")} className={selected === "year" ? "active" : ""}>
              This Year
            </button>
            <button onClick={() => setSelected("month")} className={selected === "month" ? "active" : ""}>
              This Month
            </button>
            <button onClick={() => setSelected("today")} className={selected === "today" ? "active" : ""}>
              Today
            </button>
            <button onClick={() => setSelected("custom")} className={selected === "custom" ? "active" : ""}>
              Custom
            </button>
          </div>

          {/* Custom Date Picker */}
          <div className="custom-date-filter">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button onClick={fetchCustomRange} disabled={!startDate || !endDate}>
              Apply
            </button>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="stat-card">
              <div className="icon">🛒</div>
              <div className="stat-value">{sales[selected]}</div>
              <div className="stat-label">Sales</div>
            </div>
            <div className="stat-card">
              <div className="icon">₹</div>
              <div className="stat-value">₹{revenue[selected].toFixed(2)}</div>
              <div className="stat-label">Revenue</div>
            </div>
            <div className="stat-card">
              <div className="icon">👥</div>
              <div className="stat-value">{customers[selected]}</div>
              <div className="stat-label">Customers</div>
            </div>
          </div>

          {/* Graphs */}
          <div className="analytics-container">
            <h2>Payment Method Distribution ({selected})</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: "Cash", value: paymentBreakdown.cash },
                    { name: "Online", value: paymentBreakdown.online },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {[
                    { name: "Cash", value: paymentBreakdown.cash },
                    { name: "Online", value: paymentBreakdown.online },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <h2>Revenue by Product Type ({selected})</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#352261ff" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
    </div>
  );
};

export default Dashboard;
