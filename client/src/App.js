import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BillForm from './components/BillForm';
import ViewBills from './components/ViewBills';
import AdminLogin from './components/AdminLogin';
import Home from './components/Home';
import Invoice from './components/Invoice.js';
import ProductManager from "./components/ProductManager";
import Analytics from './components/Analytics';
import AdminDashboard from './components/AdminDashboard';
import Tables from './components/Tables';
import UserDashboard from './components/UserDashboard.js';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bill" element={<BillForm />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/view" element={<ViewBills />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/products" element={<ProductManager />} /> {/*use for commenting*/}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />     
      </Routes>
    </Router>
  );
}

export default App;
