// components/AdminDashboard.js - Add organization name display in header
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Building2 } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://bills-welding.vercel.app/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const userData = await res.json();
        setTenantId(userData.tenantId);
        setOrganizationName(userData.organizationName || "");
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://bills-welding.vercel.app/api/", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        processDefaultData(data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchBills();
  }, []);

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

  const fetchCustomRange = () => {
    if (!startDate || !endDate) return;

    fetch(`https://bills-welding.vercel.app/api/?startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        setBillData(data);
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

  const copyRegistrationLink = () => {
    const registrationLink = `${window.location.origin}/register?tenantCode=${tenantId}`;
    navigator.clipboard.writeText(registrationLink).then(() => {
      setCopySuccess("Link copied!");
      setTimeout(() => setCopySuccess(""), 3000);
    });
  };

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
    filteredBills = billData;
  }

  const paymentBreakdown = filteredBills.reduce(
    (acc, bill) => {
      if (bill.paymentMethod === "Cash") acc.cash += bill.totalAmount;
      else if (bill.paymentMethod === "Online") acc.online += bill.totalAmount;
      return acc;
    },
    { cash: 0, online: 0 }
  );

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

  const mainContentStyles = {
    marginTop: "70px",
    marginLeft: isSidebarOpen ? "280px" : "0",
    transition: "margin-left 0.3s ease",
    padding: "30px",
    minHeight: "calc(100vh - 70px)",
    background: "linear-gradient(135deg, #2E8B57 0%, #20B2AA 100%)",
  };

  const contentContainerStyles = {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
    minHeight: "calc(100vh - 130px)"
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        onItemClick={handleSidebarItemClick}
      />
      
      <main style={mainContentStyles}>
        <div style={contentContainerStyles}>
          {/* Organization Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={32} color="white" />
              </div>
              <div>
                <h2 style={{ margin: '0 0 5px 0', color: '#1f2937', fontSize: '28px', fontWeight: '700' }}>
                  {organizationName || 'Dashboard'}
                </h2>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                  Organization Analytics & Management
                </p>
              </div>
            </div>
          </div>

          {/* Registration Link Section */}
          <div style={{ 
            marginBottom: "30px", 
            padding: "20px", 
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", 
            borderRadius: "12px",
            border: "2px solid #bae6fd"
          }}>
            <h3 style={{ marginBottom: "10px", color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} />
              Employee Registration
            </h3>
            <p style={{ marginBottom: "12px", fontSize: "14px", color: "#075985" }}>
              Share this link with employees to join <strong>{organizationName}</strong>:
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input 
                type="text" 
                readOnly 
                value={`${window.location.origin}/register?tenantCode=${tenantId}`}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "2px solid #7dd3fc",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "white",
                  color: '#0c4a6e'
                }}
              />
              <button 
                onClick={copyRegistrationLink}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                Copy Link
              </button>
            </div>
            {copySuccess && (
              <p style={{ 
                marginTop: "10px", 
                color: "#15803d", 
                fontSize: "14px",
                fontWeight: "600" 
              }}>
                ✓ {copySuccess}
              </p>
            )}
            <p style={{ marginTop: "12px", fontSize: "13px", color: "#0369a1" }}>
              Organization Code: <strong style={{ 
                padding: '4px 8px', 
                background: 'white', 
                borderRadius: '4px',
                border: '1px solid #7dd3fc'
              }}>{tenantId}</strong>
            </p>
          </div>

          <div className="time-selector" style={{ marginBottom: "20px" }}>
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

          {selected === "custom" && (
            <div className="custom-date-filter" style={{ marginBottom: "20px" }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <button onClick={fetchCustomRange} disabled={!startDate || !endDate}>
                Apply
              </button>
            </div>
          )}

          <div className="stats" style={{ marginBottom: "30px" }}>
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
