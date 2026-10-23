import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  const { isAuthenticated, user, logout } = useContext(AppContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top navbar-custom ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link className="navbar-brand navbar-brand-custom" to="/">
          <i className="fas fa-film me-2"></i>SlideCast Pro
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${mobileOpen ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link className={`nav-link nav-link-custom ${isActive('/') ? 'active' : ''}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link nav-link-custom ${isActive('/upload') ? 'active' : ''}`} to="/upload">
                <i className="fas fa-upload me-1"></i> Convert
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link nav-link-custom ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link nav-link-custom ${isActive('/pricing') ? 'active' : ''}`} to="/pricing">
                Pricing
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link nav-link-custom ${isActive('/about') ? 'active' : ''}`} to="/about">
                About
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-light">
                  <i className="fas fa-coins text-warning me-1"></i>
                  {user?.credits} credits
                </span>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-light rounded-pill dropdown-toggle" data-bs-toggle="dropdown">
                    <i className="fas fa-user-circle me-1"></i> {user?.name}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" style={{ background: '#0f172a', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <li><Link className="dropdown-item text-light" to="/dashboard">Dashboard</Link></li>
                    <li><hr className="dropdown-divider" style={{ borderColor: 'rgba(99,102,241,0.2)' }} /></li>
                    <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline-custom rounded-pill">Login</Link>
                <Link to="/register" className="btn btn-sm btn-primary-custom rounded-pill">Sign Up Free</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
