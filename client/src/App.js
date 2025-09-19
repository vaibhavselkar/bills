import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BillForm from './components/BillForm';
import ViewBills from './components/ViewBills';
import Home from './components/Home';
import Invoice from './components/Invoice.js';
import ProductManager from "./components/ProductManager";
import Analytics from './components/Analytics';
import AdminAnalytics from './components/AdminAnalytics';
import AdminDashboard from './components/AdminDashboard';
import Tables from './components/Tables';
import Login from './components/Login.js';
import Register from './components/Register';
import { ForgetPassword, ResetPassword } from "./components/aa";
import UserDashboard from './components/UserDashboard';
import Logout from "./components/Logout";
import UserTable from "./components/UserTable";
import UserBill from "./components/UserBill";
import EachUserBill from "./components/EachUserBill";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/bill" element={<BillForm />} />
        <Route path="/view" element={<ViewBills />} />
        <Route path="/user-bills" element={<UserBill />} />
        <Route path="/each-bills/:userId" element={<EachUserBill />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/products" element={<ProductManager />} /> {/*use for commenting*/}
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin-analytics" element={<AdminAnalytics />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />       
        <Route path="/logout" element={<Logout />} />
        <Route path="/users" element={<UserTable />} />
      </Routes>
    </Router>
  );
}

export default App;
