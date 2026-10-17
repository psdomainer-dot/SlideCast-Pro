import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 mb-4">
            <h5 className="navbar-brand-custom mb-3">
              <i className="fas fa-film me-2"></i>SlideCast Pro
            </h5>
            <p className="text-secondary mb-4">
              Transform your PowerPoint presentations into stunning videos with embedded narration. 
              Perfect for lecturers, students, trainers, and content creators.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary fs-5"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-secondary fs-5"><i className="fab fa-linkedin"></i></a>
              <a href="#" className="text-secondary fs-5"><i className="fab fa-github"></i></a>
              <a href="#" className="text-secondary fs-5"><i className="fab fa-youtube"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="text-light mb-3">Platform</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/upload" className="footer-link">Convert PPTX</Link></li>
              <li className="mb-2"><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
              <li className="mb-2"><Link to="/pricing" className="footer-link">Pricing</Link></li>
              <li className="mb-2"><Link to="/backend" className="footer-link">PHP Backend</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="text-light mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="footer-link">Documentation</a></li>
              <li className="mb-2"><a href="#" className="footer-link">API Reference</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Tutorials</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Blog</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="text-light mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/about" className="footer-link">About Us</Link></li>
              <li className="mb-2"><a href="#" className="footer-link">Careers</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Contact</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Press Kit</a></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6 className="text-light mb-3">Legal</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="footer-link">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Terms of Service</a></li>
              <li className="mb-2"><a href="#" className="footer-link">Cookie Policy</a></li>
              <li className="mb-2"><a href="#" className="footer-link">GDPR</a></li>
            </ul>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(99,102,241,0.1)' }} />

        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="text-secondary mb-0 small">
              © 2026 SlideCast Pro. All rights reserved. Built with ❤️ for educators.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <span className="badge bg-success me-2">v2.1.0</span>
            <span className="text-secondary small">Installable & Upgradeable Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
