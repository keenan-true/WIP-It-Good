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
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-calendar-check me-2"></i>
            WIP-It-Good
          </span>
          <div className="navbar-nav ms-auto">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-grid-3x3-gap me-1"></i>
              Allocations
            </NavLink>
            <NavLink to="/staff" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-people me-1"></i>
              Staff
            </NavLink>
            <NavLink to="/managers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-person-badge me-1"></i>
              Managers
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-box me-1"></i>
              Products
            </NavLink>
            <NavLink to="/initiatives" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <i className="bi bi-flag me-1"></i>
              Initiatives
            </NavLink>
          </div>
        </div>
      </nav>
      
      <div className="container-fluid py-4">
        <Routes>
          <Route path="/" element={<AllocationsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/managers" element={<ManagersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/initiatives" element={<InitiativesPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
