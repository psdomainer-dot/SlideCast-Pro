import { useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { Upload as UploadIcon, FileVideo, CheckCircle, AlertCircle, X, Loader2, Download, Monitor, Smartphone, Tablet } from 'lucide-react';

interface ConversionJob {
  id: string;
  filename: string;
  fileSize: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  resolutions: { label: string; value: string; ready: boolean }[];
}

export default function Upload() {
  const { isAuthenticated, user } = useContext(AppContext);
  const [dragActive, setDragActive] = useState(false);
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>(['720p', '1080p']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const simulateConversion = (jobId: string) => {
    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        // Move to processing
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'processing', progress: 0 } : j));
        
        // Simulate rendering
        let renderProgress = 0;
        const renderInterval = setInterval(() => {
          renderProgress += Math.random() * 8;
          if (renderProgress >= 100) {
            renderProgress = 100;
            clearInterval(renderInterval);
            setJobs(prev => prev.map(j => j.id === jobId ? { 
              ...j, 
              status: 'completed', 
              progress: 100,
              resolutions: j.resolutions.map(r => ({ ...r, ready: selectedResolutions.includes(r.value) }))
            } : j));
          } else {
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, progress: Math.min(renderProgress, 99) } : j));
          }
        }, 300);
      } else {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, progress: Math.min(progress, 99) } : j));
      }
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!isAuthenticated) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
        const newJob: ConversionJob = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          filename: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          status: 'uploading',
          progress: 0,
          resolutions: [
            { label: '480p', value: '480p', ready: false },
            { label: '720p HD', value: '720p', ready: false },
            { label: '1080p Full HD', value: '1080p', ready: false },
          ],
        };
        setJobs(prev => [newJob, ...prev]);
        simulateConversion(newJob.id);
      }
    });
  };

  const removeJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const toggleResolution = (res: string) => {
    setSelectedResolutions(prev => 
      prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UploadIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Sign In Required</h2>
          <p className="text-gray-600 mb-8">Please sign in or create an account to start converting your presentations.</p>
          <div className="space-y-3">
            <Link
              to="/register"
              className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="block w-full px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Convert PPTX to MP4</h1>
          <p className="text-gray-600 text-lg">Upload your presentation and we'll render it into a professional video</p>
        </div>

        {/* Credits Info */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileVideo className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Credits Available: <span className="text-indigo-600">{user?.credits || 3}</span></p>
              <p className="text-sm text-gray-500">Each conversion costs 1 credit</p>
            </div>
          </div>
          <Link to="/pricing" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Buy more credits →
          </Link>
        </div>

        {/* Resolution Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Output Resolution</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { value: '480p', label: '480p SD', icon: <Smartphone className="w-4 h-4" />, desc: 'Mobile' },
              { value: '720p', label: '720p HD', icon: <Tablet className="w-4 h-4" />, desc: 'Tablet/Laptop' },
              { value: '1080p', label: '1080p Full HD', icon: <Monitor className="w-4 h-4" />, desc: 'Desktop/TV' },
            ].map(res => (
              <button
                key={res.value}
                onClick={() => toggleResolution(res.value)}
                className={`flex items-center space-x-3 px-5 py-3 rounded-xl border-2 transition-all ${
                  selectedResolutions.includes(res.value)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {res.icon}
                <div className="text-left">
                  <div className="font-semibold text-sm">{res.label}</div>
                  <div className="text-xs opacity-70">{res.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.ppt"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadIcon className={`w-8 h-8 text-indigo-600 ${dragActive ? 'animate-bounce' : ''}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {dragActive ? 'Drop your files here!' : 'Drag & drop your PPTX files'}
          </h3>
          <p className="text-gray-500 mb-4">or click to browse your computer</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <span>Supports .pptx, .ppt</span>
            <span>•</span>
            <span>Max 500MB per file</span>
          </div>
        </div>

        {/* Jobs List */}
        {jobs.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Conversion Jobs</h3>
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      job.status === 'completed' ? 'bg-green-100' : 
                      job.status === 'error' ? 'bg-red-100' : 'bg-indigo-100'
                    }`}>
                      {job.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : job.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{job.filename}</p>
                      <p className="text-sm text-gray-500">{job.fileSize}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeJob(job.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar */}
                {(job.status === 'uploading' || job.status === 'processing') && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {job.status === 'uploading' ? 'Uploading...' : 'Rendering video...'}
                      </span>
                      <span className="font-medium text-indigo-600">{Math.round(job.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          job.status === 'uploading' ? 'bg-blue-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Download Options */}
                {job.status === 'completed' && (
                  <div className="flex flex-wrap gap-3">
                    {job.resolutions.map(res => (
                      <button
                        key={res.value}
                        disabled={!res.ready}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          res.ready
                            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        {res.label} {res.ready ? '✓' : '(skipped)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
