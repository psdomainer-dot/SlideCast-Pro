import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Login() {
  const { login } = useContext(AppContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (email && password) {
        const success = login(email, password);
        if (success) {
          navigate('/dashboard');
        } else {
          setError('Invalid credentials');
        }
      } else {
        setError('Please fill in all fields');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <section className="py-5 mt-5 min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5">
            <div className="card-custom p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="fas fa-film fa-2x" style={{ color: '#6366f1' }}></i>
                </div>
                <h3 className="text-light">Welcome Back</h3>
                <p className="text-secondary">Login to your SlideCast Pro account</p>
              </div>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  <i className="fas fa-exclamation-circle me-2"></i>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', color: '#64748b' }}>
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control form-control-custom"
                      style={{ borderLeft: 'none' }}
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', color: '#64748b' }}>
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control form-control-custom"
                      style={{ borderLeft: 'none' }}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.3)' }} />
                    <label className="form-check-label text-secondary small" htmlFor="remember">Remember me</label>
                  </div>
                  <a href="#" className="text-decoration-none small" style={{ color: '#6366f1' }}>Forgot password?</a>
                </div>

                <button type="submit" className="btn btn-primary-custom w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Logging in...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt me-2"></i>Login
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-secondary">Don't have an account? </span>
                <Link to="/register" style={{ color: '#6366f1' }}>Sign up free</Link>
              </div>

              <hr style={{ borderColor: 'rgba(99,102,241,0.1)' }} />

              <div className="d-grid gap-2">
                <button className="btn btn-outline-light btn-sm">
                  <i className="fab fa-google me-2"></i>Continue with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
