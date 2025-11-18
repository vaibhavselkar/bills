import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BillForm from './components/BillForm';
import ViewBills from './components/ViewBills';
import Invoice from './components/Invoice.js';
import ProductManager from "./components/ProductManager";
import Analytics from './components/Analytics';
import AdminAnalytics from './components/AdminAnalytics';
import AdminDashboard from './components/AdminDashboard';
import Tables from './components/TopSells.js';
import Login from './components/Login.js';
import Register from './components/Register';
import { ForgetPassword, ResetPassword } from "./components/ForgetResetPassword";
import UserDashboard from './components/UserDashboard';
import Logout from "./components/Logout";
import UserTable from "./components/UserTable";
import UserBill from "./components/UserBill";
import EachUserBill from "./components/EachUserBill";
import Occasion from './components/Occasion';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes without sidebar */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/invoice/:id" element={<Invoice />} />

        {/* User routes without sidebar */}
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/bill" element={<BillForm />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/user-bills" element={<UserBill />} />
        <Route path="/each-bills/:userId" element={<EachUserBill />} />
        <Route path="/occasion" element={<Occasion />} />
        <Route path="/products" element={<ProductManager />} />
    
        <Route path="/view" element={<ViewBills />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />
        <Route path="top-sells" element={<Tables />} /> 
        <Route path="/admin-dashboard" element={<AdminDashboard />} />       
        <Route path="/users" element={<UserTable />} />
      </Routes>
    </Router>
  );
}

export default App;
