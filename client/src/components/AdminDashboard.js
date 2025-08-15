import React, { useEffect, useState } from 'react';
import '../styles/Dashboard.css'; // Add styles here if needed
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const Dashboard = () => {
  const [sales, setSales] = useState({ today: 0, month: 0, year: 0 });
  const [revenue, setRevenue] = useState({ today: 0, month: 0, year: 0 });
  const [customers, setCustomers] = useState({ today: 0, month: 0, year: 0 });
  const [selected, setSelected] = useState('today');
  const [billData, setBillData] = useState([]);
  

  useEffect(() => {
    fetch('http://localhost:8080/api/')
      .then(res => res.json())
      .then(data => {
        setBillData(data);
        const now = new Date();

        const filtered = data.reduce((acc, bill) => {
          const date = new Date(bill.date || bill.createdAt);
          const sameDay = date.toDateString() === now.toDateString();
          const sameMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          const sameYear = date.getFullYear() === now.getFullYear();

          const inc = (key) => {
            acc.sales[key]++;
            acc.revenue[key] += bill.totalAmount || 0;
            if (!acc.customersSet[key].has(bill.customerName)) {
              acc.customers[key]++;
              acc.customersSet[key].add(bill.customerName);
            }
          };

          if (sameDay) inc('today');
          if (sameMonth) inc('month');
          if (sameYear) inc('year');

          return acc;
        }, {
          sales: { today: 0, month: 0, year: 0 },
          revenue: { today: 0, month: 0, year: 0 },
          customers: { today: 0, month: 0, year: 0 },
          customersSet: { today: new Set(), month: new Set(), year: new Set() }
        });

        setSales(filtered.sales);
        setRevenue(filtered.revenue);
        setCustomers(filtered.customers);
      })
      .catch(err => console.error('Error fetching dashboard data:', err));
  }, []);

  const paymentBreakdown = billData.reduce(
    (acc, bill) => {
      if (bill.paymentMethod === 'Cash') acc.cash += bill.totalAmount;
      else if (bill.paymentMethod === 'Online') acc.online += bill.totalAmount;
      return acc;
    },
    { cash: 0, online: 0 }
  );

  const categoryTotals = {};
  billData.forEach(bill => {
    bill.products.forEach(p => {
      const key = `${p.product}`;
      if (!categoryTotals[key]) {
        categoryTotals[key] = p.total;
      } else {
        categoryTotals[key] += p.total;
      }
    });
  });

  const categoryChartData = Object.entries(categoryTotals).map(([key, value]) => ({
    name: key,
    value: parseFloat(value.toFixed(2))
  }));

  const COLORS = ['#56b423', '#003366', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#0088FE'];



  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h3>Sanghamitra Admin</h3>
        <nav>
          <a href="/dashboard" className="active">📈 Dashboard</a>
          <a href="/">🏠 Home</a>
          <a href="/tables">🧾 Tables</a>
          <a href="/view">📄 View Bills</a>
          <a href="/analytics">📊 Analytics</a>
          <a href="/products">📦 Products</a>
        </nav>
      </aside>

      <main className="dashboard-main">
        <h2>Dashboard</h2>
        <div className="time-selector">
          <button onClick={() => setSelected('today')} className={selected === 'today' ? 'active' : ''}>Today</button>
          <button onClick={() => setSelected('month')} className={selected === 'month' ? 'active' : ''}>This Month</button>
          <button onClick={() => setSelected('year')} className={selected === 'year' ? 'active' : ''}>This Year</button>
        </div>
        <div className="stats">
          <div className="stat-card">
            <div className="icon">🛒</div>
            <div className="stat-value">{sales[selected]}</div>
            <div className="stat-label">Sales</div>
          </div>
          <div className="stat-card">
            <div className="icon">💲</div>
            <div className="stat-value">₹{revenue[selected].toFixed(2)}</div>
            <div className="stat-label">Revenue</div>
          </div>
          <div className="stat-card">
            <div className="icon">👥</div>
            <div className="stat-value">{customers[selected]}</div>
            <div className="stat-label">Customers</div>
          </div>
        </div>

        <div className="analytics-container">
              <h2>Payment Method Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={[
                      { name: 'Cash', value: paymentBreakdown.cash },
                      { name: 'Online', value: paymentBreakdown.online }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {[
                      { name: 'Cash', value: paymentBreakdown.cash },
                      { name: 'Online', value: paymentBreakdown.online }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
      
              <h2>Revenue by Product Type</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#56b423" />
                </BarChart>
              </ResponsiveContainer>
            </div>
      </main>
    </div>
  );
};

export default Dashboard;
