import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BillForm from './components/BillForm';
import ViewBills from './components/ViewBills';
import AdminLogin from './components/AdminLogin';
import Home from './components/Home';
import Invoice from './components/Invoice.js';
import ProductManager from "./components/ProductManager";


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
      </Routes>
    </Router>
  );
}

export default App;
