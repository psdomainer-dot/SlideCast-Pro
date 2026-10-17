import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const mockConversions = [
  { id: 'JOB-001', filename: 'Biology_Lecture_Week5.pptx', slides: 24, status: 'completed', resolutions: ['720p', '1080p'], date: '2026-01-15', size: '145 MB' },
  { id: 'JOB-002', filename: 'Marketing_Strategy_Q1.pptx', slides: 18, status: 'processing', resolutions: ['720p'], date: '2026-01-15', size: '89 MB' },
  { id: 'JOB-003', filename: 'History_101_Chapter3.pptx', slides: 32, status: 'completed', resolutions: ['480p', '720p', '1080p'], date: '2026-01-14', size: '312 MB' },
  { id: 'JOB-004', filename: 'Training_Safety_Protocol.pptx', slides: 15, status: 'queued', resolutions: ['720p'], date: '2026-01-14', size: '67 MB' },
  { id: 'JOB-005', filename: 'Physics_Lab_Results.pptx', slides: 20, status: 'failed', resolutions: ['1080p'], date: '2026-01-13', size: '0 MB' },
  { id: 'JOB-006', filename: 'Art_History_Renaissance.pptx', slides: 28, status: 'completed', resolutions: ['480p', '720p'], date: '2026-01-12', size: '198 MB' },
];

export default function Dashboard() {
  const { isAuthenticated, user } = useContext(AppContext);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <section className="py-5 mt-5">
        <div className="container py-5">
          <div className="card-custom text-center p-5 mx-auto" style={{ maxWidth: 600 }}>
            <i className="fas fa-lock fa-3x mb-4" style={{ color: '#6366f1' }}></i>
            <h3 className="text-light mb-3">Login Required</h3>
            <p className="text-secondary mb-4">Please login to access your dashboard.</p>
            <div className="d-flex gap-3 justify-content-center">
              <button onClick={() => navigate('/login')} className="btn btn-primary-custom">Login</button>
              <button onClick={() => navigate('/register')} className="btn btn-outline-custom">Sign Up</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const completedCount = mockConversions.filter(c => c.status === 'completed').length;
  const processingCount = mockConversions.filter(c => c.status === 'processing' || c.status === 'queued').length;

  return (
    <section className="py-5 mt-5">
      <div className="container py-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
          <div>
            <h2 className="section-title mb-1">Welcome back, <span className="gradient-text">{user?.name}</span></h2>
            <p className="text-secondary mb-0">Manage your conversions and account</p>
          </div>
          <Link to="/upload" className="btn btn-primary-custom">
            <i className="fas fa-plus me-2"></i>New Conversion
          </Link>
        </div>

        {/* Stats */}
        <div className="row g-4 mb-5">
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-secondary">Total Conversions</small>
                  <div className="stat-value">24</div>
                </div>
                <div className="card-icon purple mb-0" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                  <i className="fas fa-video"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-secondary">Credits Remaining</small>
                  <div className="stat-value">{user?.credits}</div>
                </div>
                <div className="card-icon amber mb-0" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                  <i className="fas fa-coins"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-secondary">Completed</small>
                  <div className="stat-value">{completedCount}</div>
                </div>
                <div className="card-icon green mb-0" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <small className="text-secondary">In Progress</small>
                  <div className="stat-value">{processingCount}</div>
                </div>
                <div className="card-icon blue mb-0" style={{ width: 40, height: 40, fontSize: '1rem' }}>
                  <i className="fas fa-spinner"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Plan */}
        <div className="card-custom mb-5">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 className="text-light mb-1">Current Plan: <span style={{ color: '#6366f1' }}>{user?.plan}</span></h5>
              <p className="text-secondary mb-0">
                {user?.plan === 'Free' ? 'Upgrade for more credits and features' : 'Your plan is active'}
              </p>
            </div>
            <Link to="/pricing" className="btn btn-outline-custom btn-sm">
              {user?.plan === 'Free' ? 'Upgrade Plan' : 'Manage Plan'}
            </Link>
          </div>
        </div>

        {/* Conversion History */}
        <div className="card-custom p-0 overflow-hidden">
          <div className="p-4 border-bottom" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
            <h5 className="text-light mb-0">
              <i className="fas fa-history me-2"></i>Conversion History
            </h5>
          </div>
          <div className="table-responsive">
            <table className="table table-custom mb-0">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>File Name</th>
                  <th>Slides</th>
                  <th>Resolutions</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockConversions.map(job => (
                  <tr key={job.id}>
                    <td><code className="text-primary">{job.id}</code></td>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-file-powerpoint me-2" style={{ color: '#e84d31' }}></i>
                        <span className="text-light small">{job.filename}</span>
                      </div>
                    </td>
                    <td><span className="text-secondary">{job.slides}</span></td>
                    <td>
                      {job.resolutions.map(r => (
                        <span key={r} className="badge bg-dark me-1">{r}</span>
                      ))}
                    </td>
                    <td>
                      <span className={`status-badge status-${job.status}`}>
                        {job.status === 'completed' && <i className="fas fa-check me-1"></i>}
                        {job.status === 'processing' && <i className="fas fa-spinner fa-spin me-1"></i>}
                        {job.status === 'queued' && <i className="fas fa-clock me-1"></i>}
                        {job.status === 'failed' && <i className="fas fa-times me-1"></i>}
                        {job.status}
                      </span>
                    </td>
                    <td><span className="text-secondary small">{job.date}</span></td>
                    <td>
                      {job.status === 'completed' ? (
                        <button className="btn btn-sm btn-primary-custom" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                          <i className="fas fa-download me-1"></i>Download
                        </button>
                      ) : job.status === 'failed' ? (
                        <button className="btn btn-sm btn-outline-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                          <i className="fas fa-redo me-1"></i>Retry
                        </button>
                      ) : (
                        <span className="text-secondary small">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
