import { Routes, Route, NavLink } from 'react-router-dom';
import ManagersPage from './pages/ManagersPage';
import StaffPage from './pages/StaffPage';
import ProductsPage from './pages/ProductsPage';
import InitiativesPage from './pages/InitiativesPage';
import AllocationsPage from './pages/AllocationsPage';
import './App.css';

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <NavLink to="/">Allocations</NavLink>
        <NavLink to="/staff">Staff</NavLink>
        <NavLink to="/managers">Managers</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/initiatives">Initiatives</NavLink>
      </nav>
      
      <Routes>
        <Route path="/" element={<AllocationsPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/managers" element={<ManagersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/initiatives" element={<InitiativesPage />} />
      </Routes>
    </div>
  );
}

export default App;
