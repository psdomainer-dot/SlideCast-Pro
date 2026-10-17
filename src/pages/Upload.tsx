import { useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

interface ConversionJob {
  id: string;
  filename: string;
  slides: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  resolutions: string[];
  timestamp: string;
}

export default function Upload() {
  const { isAuthenticated, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [selectedResolutions, setSelectedResolutions] = useState(['720p']);
  const [completedJob, setCompletedJob] = useState<ConversionJob | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.name.endsWith('.pptx')) {
        setFile(f);
      } else {
        alert('Please upload a .pptx file');
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toggleResolution = (res: string) => {
    setSelectedResolutions(prev =>
      prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]
    );
  };

  const startConversion = () => {
    if (!file || selectedResolutions.length === 0) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setConverting(true);
    setProgress(0);

    const steps = [
      'Analyzing presentation structure...',
      'Extracting slides and media...',
      'Processing narration audio...',
      'Rendering slides at selected resolution...',
      'Synchronizing audio with slides...',
      'Encoding final video...',
      'Optimizing output quality...',
      'Finalizing conversion...'
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 12 + 3;
        if (next >= 100) {
          clearInterval(interval);
          setConverting(false);
          setCompletedJob({
            id: 'JOB-' + Date.now(),
            filename: file.name,
            slides: Math.floor(Math.random() * 30) + 10,
            status: 'completed',
            progress: 100,
            resolutions: selectedResolutions,
            timestamp: new Date().toLocaleString(),
          });
          return 100;
        }
        const newStepIndex = Math.floor((next / 100) * steps.length);
        if (newStepIndex !== stepIndex && newStepIndex < steps.length) {
          stepIndex = newStepIndex;
          setCurrentStep(steps[stepIndex]);
        }
        return next;
      });
    }, 500);

    setCurrentStep(steps[0]);
  };

  const resetUpload = () => {
    setFile(null);
    setConverting(false);
    setProgress(0);
    setCurrentStep('');
    setCompletedJob(null);
  };

  if (!isAuthenticated) {
    return (
      <section className="py-5 mt-5">
        <div className="container py-5">
          <div className="card-custom text-center p-5 mx-auto" style={{ maxWidth: 600 }}>
            <i className="fas fa-lock fa-3x mb-4" style={{ color: '#6366f1' }}></i>
            <h3 className="text-light mb-3">Login Required</h3>
            <p className="text-secondary mb-4">Please login or create an account to convert your presentations.</p>
            <div className="d-flex gap-3 justify-content-center">
              <button onClick={() => navigate('/login')} className="btn btn-primary-custom">Login</button>
              <button onClick={() => navigate('/register')} className="btn btn-outline-custom">Sign Up</button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 mt-5">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">Convert <span className="gradient-text">PPTX to MP4</span></h2>
          <p className="section-subtitle">Upload your presentation and convert it to video in seconds</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Upload Zone */}
            {!file && !converting && !completedJob && (
              <div
                className={`upload-zone ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  type="file"
                  id="fileInput"
                  accept=".pptx"
                  className="d-none"
                  onChange={handleFileInput}
                />
                <i className="fas fa-cloud-upload-alt"></i>
                <h4 className="text-light mt-3">Drag & Drop your PPTX file here</h4>
                <p className="text-secondary mb-3">or click to browse files</p>
                <span className="badge bg-dark px-3 py-2">
                  <i className="fas fa-info-circle me-1"></i> Supports .pptx files up to 500MB
                </span>
              </div>
            )}

            {/* File Selected */}
            {file && !converting && !completedJob && (
              <div className="card-custom">
                <div className="d-flex align-items-center mb-4">
                  <div className="card-icon purple me-3 mb-0">
                    <i className="fas fa-file-powerpoint"></i>
                  </div>
                  <div>
                    <h5 className="text-light mb-0">{file.name}</h5>
                    <small className="text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                  <button className="btn btn-sm btn-outline-danger ms-auto" onClick={resetUpload}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                {/* Resolution Selection */}
                <div className="mb-4">
                  <h6 className="text-light mb-3">
                    <i className="fas fa-sliders-h me-2"></i>Select Output Resolution
                  </h6>
                  <div className="d-flex gap-3 flex-wrap">
                    {[
                      { res: '480p', label: '480p SD', desc: '854×480 • ~50MB', credits: 1 },
                      { res: '720p', label: '720p HD', desc: '1280×720 • ~120MB', credits: 2 },
                      { res: '1080p', label: '1080p Full HD', desc: '1920×1080 • ~250MB', credits: 3 },
                    ].map(item => (
                      <div
                        key={item.res}
                        className={`resolution-badge flex-grow-1 ${selectedResolutions.includes(item.res) ? 'active' : ''}`}
                        onClick={() => toggleResolution(item.res)}
                        style={{ background: selectedResolutions.includes(item.res) ? 'rgba(99,102,241,0.1)' : 'rgba(15,23,42,0.5)', borderRadius: 12, padding: '1rem' }}
                      >
                        <div className="text-center w-100">
                          <div className="fw-bold text-light">{item.label}</div>
                          <small className="text-secondary">{item.desc}</small>
                          <div className="mt-1">
                            <span className="badge bg-warning text-dark">{item.credits} credit{item.credits > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Credits Info */}
                <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3" style={{ background: 'rgba(99,102,241,0.05)' }}>
                  <span className="text-secondary">
                    <i className="fas fa-coins text-warning me-2"></i>
                    Your balance: <strong className="text-light">{user?.credits} credits</strong>
                  </span>
                  <span className="text-secondary">
                    Total cost: <strong className="text-light">{selectedResolutions.length} credit{selectedResolutions.length !== 1 ? 's' : ''}</strong>
                  </span>
                </div>

                <button
                  className="btn btn-primary-custom w-100 btn-lg"
                  onClick={startConversion}
                  disabled={selectedResolutions.length === 0}
                >
                  <i className="fas fa-play me-2"></i>Start Conversion
                </button>
              </div>
            )}

            {/* Converting */}
            {converting && (
              <div className="card-custom text-center">
                <div className="mb-4">
                  <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                  <h4 className="text-light">Converting Your Presentation</h4>
                  <p className="text-secondary">{currentStep}</p>
                </div>
                <div className="progress-custom mb-3">
                  <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="text-secondary">{file?.name}</small>
                  <small className="text-light fw-bold">{Math.round(progress)}%</small>
                </div>
                <div className="mt-3">
                  <span className="badge bg-dark me-2">
                    <i className="fas fa-clock me-1"></i> Est. {Math.max(1, Math.round((100 - progress) / 10))} min remaining
                  </span>
                </div>
              </div>
            )}

            {/* Completed */}
            {completedJob && (
              <div className="card-custom text-center">
                <div className="mb-4">
                  <i className="fas fa-check-circle fa-4x text-success mb-3"></i>
                  <h4 className="text-light">Conversion Complete!</h4>
                  <p className="text-secondary">Your video is ready for download</p>
                </div>

                <div className="d-flex gap-3 justify-content-center flex-wrap mb-4">
                  {completedJob.resolutions.map(res => (
                    <button key={res} className="btn btn-primary-custom">
                      <i className="fas fa-download me-2"></i>Download {res}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-3 text-start" style={{ background: 'rgba(15,23,42,0.5)' }}>
                  <div className="row">
                    <div className="col-6">
                      <small className="text-secondary">File</small>
                      <div className="text-light small">{completedJob.filename}</div>
                    </div>
                    <div className="col-6">
                      <small className="text-secondary">Slides</small>
                      <div className="text-light small">{completedJob.slides} slides</div>
                    </div>
                    <div className="col-6 mt-2">
                      <small className="text-secondary">Job ID</small>
                      <div className="text-light small">{completedJob.id}</div>
                    </div>
                    <div className="col-6 mt-2">
                      <small className="text-secondary">Completed</small>
                      <div className="text-light small">{completedJob.timestamp}</div>
                    </div>
                  </div>
                </div>

                <button className="btn btn-outline-custom mt-4" onClick={resetUpload}>
                  <i className="fas fa-plus me-2"></i>Convert Another
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
