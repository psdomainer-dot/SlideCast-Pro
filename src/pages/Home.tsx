import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-6 animate-slide-up">
              <div className="mb-3">
                <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                  <i className="fas fa-bolt me-1"></i> Now with AI-powered narration sync
                </span>
              </div>
              <h1 className="hero-title">
                Transform Your{' '}
                <span className="gradient-text">Presentations</span>{' '}
                Into Stunning Videos
              </h1>
              <p className="hero-subtitle">
                Upload your PPTX files with embedded narration and convert them into 
                professional MP4 videos in 480p, 720p, or 1080p. Perfect for lecturers, 
                students, trainers, and content creators.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/upload" className="btn btn-primary-custom btn-lg">
                  <i className="fas fa-rocket me-2"></i>Start Converting
                </Link>
                <Link to="/pricing" className="btn btn-outline-custom btn-lg">
                  View Pricing
                </Link>
              </div>
              <div className="d-flex gap-4 mt-4">
                <div className="text-center">
                  <div className="fs-4 fw-bold text-light">50K+</div>
                  <small className="text-secondary">Conversions</small>
                </div>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-light">10K+</div>
                  <small className="text-secondary">Users</small>
                </div>
                <div className="text-center">
                  <div className="fs-4 fw-bold text-light">99.9%</div>
                  <small className="text-secondary">Uptime</small>
                </div>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="position-relative animate-float">
                <div className="card-custom text-center p-5" style={{ background: 'rgba(99,102,241,0.05)' }}>
                  <div className="mb-4">
                    <i className="fas fa-file-powerpoint fa-5x" style={{ color: '#e84d31' }}></i>
                  </div>
                  <div className="d-flex justify-content-center align-items-center my-4">
                    <div className="progress-custom w-75">
                      <div className="progress-bar" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <p className="text-secondary mb-3">Converting presentation...</p>
                  <div className="d-flex justify-content-center gap-3">
                    <span className="badge bg-primary">480p</span>
                    <span className="badge bg-info">720p</span>
                    <span className="badge bg-success">1080p</span>
                  </div>
                  <div className="mt-4">
                    <i className="fas fa-film fa-4x" style={{ color: '#6366f1' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5" style={{ background: 'rgba(15,23,42,0.5)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="section-title">Why Choose <span className="gradient-text">SlideCast Pro</span>?</h2>
            <p className="section-subtitle">
              Everything you need to turn your presentations into engaging video content
            </p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="card-custom h-100">
                <div className="card-icon purple">
                  <i className="fas fa-upload"></i>
                </div>
                <h5 className="text-light mb-2">Easy Upload</h5>
                <p className="text-secondary mb-0">Drag & drop your PPTX files with embedded narration audio tracks.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card-custom h-100">
                <div className="card-icon blue">
                  <i className="fas fa-magic"></i>
                </div>
                <h5 className="text-light mb-2">Smart Rendering</h5>
                <p className="text-secondary mb-0">AI-powered rendering preserves all animations, transitions, and timing.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card-custom h-100">
                <div className="card-icon amber">
                  <i className="fas fa-video"></i>
                </div>
                <h5 className="text-light mb-2">Multi-Resolution</h5>
                <p className="text-secondary mb-0">Download in 480p, 720p, or 1080p HD quality MP4 format.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card-custom h-100">
                <div className="card-icon green">
                  <i className="fas fa-microphone"></i>
                </div>
                <h5 className="text-light mb-2">Narration Sync</h5>
                <p className="text-secondary mb-0">Perfect audio synchronization with each slide transition.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
            <p className="section-subtitle">Three simple steps to convert your presentations</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="text-center">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4 animate-pulse-glow"
                  style={{ width: 80, height: 80, background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)' }}>
                  <span className="fs-3 fw-bold" style={{ color: '#6366f1' }}>1</span>
                </div>
                <h5 className="text-light">Upload PPTX</h5>
                <p className="text-secondary">Upload your PowerPoint file with embedded narration audio.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4 animate-pulse-glow"
                  style={{ width: 80, height: 80, background: 'rgba(14,165,233,0.15)', border: '2px solid rgba(14,165,233,0.3)', animationDelay: '1s' }}>
                  <span className="fs-3 fw-bold" style={{ color: '#0ea5e9' }}>2</span>
                </div>
                <h5 className="text-light">Choose Quality</h5>
                <p className="text-secondary">Select your preferred output resolution: 480p, 720p, or 1080p.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-center">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4 animate-pulse-glow"
                  style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)', animationDelay: '2s' }}>
                  <span className="fs-3 fw-bold" style={{ color: '#10b981' }}>3</span>
                </div>
                <h5 className="text-light">Download Video</h5>
                <p className="text-secondary">Get your MP4 video ready to share anywhere.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-5" style={{ background: 'rgba(15,23,42,0.5)' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="section-title">Built For <span className="gradient-text">You</span></h2>
            <p className="section-subtitle">Designed for professionals who need quality video content</p>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="card-custom text-center h-100">
                <div className="fs-1 mb-3">👨‍🏫</div>
                <h5 className="text-light">Lecturers</h5>
                <p className="text-secondary small mb-0">Create video lectures from your slide decks for online courses and distance learning.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card-custom text-center h-100">
                <div className="fs-1 mb-3">🎓</div>
                <h5 className="text-light">Students</h5>
                <p className="text-secondary small mb-0">Convert class presentations into shareable video submissions.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card-custom text-center h-100">
                <div className="fs-1 mb-3">🏋️</div>
                <h5 className="text-light">Trainers</h5>
                <p className="text-secondary small mb-0">Produce training videos from corporate presentations efficiently.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="card-custom text-center h-100">
                <div className="fs-1 mb-3">🎬</div>
                <h5 className="text-light">Content Creators</h5>
                <p className="text-secondary small mb-0">Turn informational slides into engaging video content for social media.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5">
        <div className="container py-5">
          <div className="card-custom text-center p-5" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(14,165,233,0.1))' }}>
            <h2 className="text-light mb-3">Ready to Transform Your Presentations?</h2>
            <p className="text-secondary mb-4">Join thousands of educators and content creators who trust SlideCast Pro.</p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/register" className="btn btn-primary-custom btn-lg">
                <i className="fas fa-user-plus me-2"></i>Create Free Account
              </Link>
              <Link to="/pricing" className="btn btn-outline-custom btn-lg">
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
