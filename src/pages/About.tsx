export default function About() {
  return (
    <section className="py-5 mt-5">
      <div className="container py-5">
        {/* Hero */}
        <div className="text-center mb-5">
          <h2 className="section-title">About <span className="gradient-text">SlideCast Pro</span></h2>
          <p className="section-subtitle">
            Empowering educators and content creators to transform presentations into professional videos
          </p>
        </div>

        {/* Mission */}
        <div className="row align-items-center mb-5">
          <div className="col-lg-6 mb-4">
            <h3 className="text-light mb-3">Our Mission</h3>
            <p className="text-secondary mb-3">
              SlideCast Pro was founded with a simple belief: great educational content shouldn't require 
              expensive video production tools. We've built a platform that lets anyone with a PowerPoint 
              presentation create professional-quality video content in minutes.
            </p>
            <p className="text-secondary mb-3">
              Whether you're a university lecturer creating online course materials, a corporate trainer 
              developing training videos, or a content creator sharing knowledge — our platform handles 
              the technical complexity so you can focus on what matters: your content.
            </p>
            <div className="d-flex gap-4 mt-4">
              <div>
                <div className="fs-3 fw-bold" style={{ color: '#6366f1' }}>50K+</div>
                <small className="text-secondary">Videos Created</small>
              </div>
              <div>
                <div className="fs-3 fw-bold" style={{ color: '#0ea5e9' }}>10K+</div>
                <small className="text-secondary">Active Users</small>
              </div>
              <div>
                <div className="fs-3 fw-bold" style={{ color: '#10b981' }}>150+</div>
                <small className="text-secondary">Institutions</small>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card-custom text-center p-5">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-3 rounded-3" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <i className="fas fa-university fa-2x mb-2" style={{ color: '#6366f1' }}></i>
                    <div className="text-light small fw-bold">Education</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3" style={{ background: 'rgba(14,165,233,0.1)' }}>
                    <i className="fas fa-briefcase fa-2x mb-2" style={{ color: '#0ea5e9' }}></i>
                    <div className="text-light small fw-bold">Corporate</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3" style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <i className="fas fa-graduation-cap fa-2x mb-2" style={{ color: '#f59e0b' }}></i>
                    <div className="text-light small fw-bold">Students</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 rounded-3" style={{ background: 'rgba(16,185,129,0.1)' }}>
                    <i className="fas fa-video fa-2x mb-2" style={{ color: '#10b981' }}></i>
                    <div className="text-light small fw-bold">Creators</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-5">
          <h3 className="text-light text-center mb-4">Technology & Architecture</h3>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card-custom h-100">
                <div className="card-icon purple">
                  <i className="fas fa-code"></i>
                </div>
                <h5 className="text-light">Frontend</h5>
                <ul className="list-unstyled text-secondary small">
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Bootstrap 5.3</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Responsive Design</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Modern UI/UX</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Progressive Enhancement</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-custom h-100">
                <div className="card-icon blue">
                  <i className="fas fa-server"></i>
                </div>
                <h5 className="text-light">Backend</h5>
                <ul className="list-unstyled text-secondary small">
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Procedural PHP 8.x</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>MySQLi (Procedural)</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>FFmpeg Video Processing</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Queue-based Rendering</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card-custom h-100">
                <div className="card-icon green">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h5 className="text-light">Infrastructure</h5>
                <ul className="list-unstyled text-secondary small">
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Installable System</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Auto-upgrade Support</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Database Versioning</li>
                  <li className="mb-1"><i className="fas fa-check text-success me-2"></i>Secure Authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Installable & Upgradeable */}
        <div className="card-custom mb-5 p-5" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05), rgba(14,165,233,0.05))' }}>
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h3 className="text-light mb-3">
                <i className="fas fa-download me-2" style={{ color: '#6366f1' }}></i>
                Installable & Upgradeable
              </h3>
              <p className="text-secondary mb-3">
                SlideCast Pro is designed as a self-hosted, installable platform. Deploy it on your own 
                server with our simple installer. The system includes automatic version checking and 
                one-click upgrades to keep your installation current.
              </p>
              <ul className="list-unstyled text-secondary">
                <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>One-click installer with system requirements check</li>
                <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>Database migration system for upgrades</li>
                <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>Configuration management panel</li>
                <li className="mb-2"><i className="fas fa-check-circle text-success me-2"></i>Backup and restore utilities</li>
              </ul>
            </div>
            <div className="col-lg-4 text-center">
              <div className="p-4 rounded-3" style={{ background: 'rgba(15,23,42,0.5)' }}>
                <i className="fas fa-server fa-4x mb-3" style={{ color: '#6366f1' }}></i>
                <div className="text-light fw-bold">v2.1.0</div>
                <small className="text-secondary">Latest Stable Release</small>
                <div className="mt-3">
                  <span className="badge bg-success">Stable</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="text-center mb-5">
          <h3 className="text-light mb-4">Our Team</h3>
          <div className="row g-4 justify-content-center">
            {[
              { name: 'Sarah Chen', role: 'CEO & Founder', emoji: '👩‍💼' },
              { name: 'Marcus Johnson', role: 'CTO', emoji: '👨‍💻' },
              { name: 'Dr. Emily Park', role: 'Head of Education', emoji: '👩‍🔬' },
              { name: 'Alex Rivera', role: 'Lead Developer', emoji: '🧑‍💻' },
            ].map(member => (
              <div key={member.name} className="col-lg-3 col-md-6">
                <div className="card-custom text-center">
                  <div className="fs-1 mb-3">{member.emoji}</div>
                  <h6 className="text-light mb-1">{member.name}</h6>
                  <small className="text-secondary">{member.role}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
