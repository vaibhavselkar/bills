// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Check if user is authenticated
const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get user role
const getUserRole = () => {
  return localStorage.getItem('role');
};

// Protected Route - requires authentication
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Admin Route - requires admin role
const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  if (getUserRole() !== 'admin') {
    return <Navigate to="/user-dashboard" replace />;
  }
  
  return children;
};

// User Route - requires user role
const UserRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  if (getUserRole() !== 'user') {
    return <Navigate to="/admin-dashboard" replace />;
  }
  
  return children;
};

// Public Route - redirect if already logged in
const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    const role = getUserRole();
    return <Navigate to={role === 'admin' ? '/admin-dashboard' : '/user-dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgetPassword />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/reset-password/:token" 
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } 
        />

        {/* ========== LOGOUT ROUTE ========== */}
        <Route path="/logout" element={<Logout />} />

        {/* ========== ADMIN ONLY ROUTES ========== */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/view" 
          element={
            <AdminRoute>
              <ViewBills />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin-analytics" 
          element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/top-sells" 
          element={
            <AdminRoute>
              <Tables />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <AdminRoute>
              <UserTable />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/each-bills/:userId" 
          element={
            <AdminRoute>
              <EachUserBill />
            </AdminRoute>
          } 
        />

        {/* ========== USER ONLY ROUTES ========== */}
        <Route 
          path="/user-dashboard" 
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          } 
        />
        
        <Route 
          path="/analytics" 
          element={
            <UserRoute>
              <Analytics />
            </UserRoute>
          } 
        />
        
        <Route 
          path="/user-bills" 
          element={
            <UserRoute>
              <UserBill />
            </UserRoute>
          } 
        />

        {/* ========== SHARED ROUTES (Admin + User) ========== */}
        <Route 
          path="/bill" 
          element={
            <ProtectedRoute>
              <BillForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductManager />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/occasion" 
          element={
            <ProtectedRoute>
              <Occasion />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/invoice/:id" 
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          } 
        />

        {/* ========== CATCH ALL - REDIRECT ========== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;