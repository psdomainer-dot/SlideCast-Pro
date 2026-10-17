import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function Register() {
  const { register } = useContext(AppContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const success = register(name, email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Registration failed. Please try again.');
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
                <h3 className="text-light">Create Account</h3>
                <p className="text-secondary">Start converting presentations for free</p>
              </div>

              {error && (
                <div className="alert alert-danger fade show" role="alert" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  <i className="fas fa-exclamation-circle me-2"></i>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label text-secondary small">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-control-custom"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">Email Address</label>
                  <input
                    type="email"
                    className="form-control form-control-custom"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">I am a...</label>
                  <select
                    className="form-control form-control-custom"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="lecturer">Lecturer / Professor</option>
                    <option value="student">Student</option>
                    <option value="trainer">Corporate Trainer</option>
                    <option value="creator">Content Creator</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label text-secondary small">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-secondary small">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control form-control-custom"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="terms" required style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.3)' }} />
                  <label className="form-check-label text-secondary small" htmlFor="terms">
                    I agree to the <a href="#" style={{ color: '#6366f1' }}>Terms of Service</a> and <a href="#" style={{ color: '#6366f1' }}>Privacy Policy</a>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary-custom w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Creating account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>Create Free Account
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-secondary">Already have an account? </span>
                <Link to="/login" style={{ color: '#6366f1' }}>Login</Link>
              </div>

              <div className="text-center mt-2">
                <small className="text-secondary">
                  <i className="fas fa-gift me-1"></i> Get 5 free credits when you sign up!
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
