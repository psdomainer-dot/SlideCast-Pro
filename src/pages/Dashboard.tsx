import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App';
import { FileVideo, Download, Clock, CheckCircle, AlertCircle, BarChart3, CreditCard, Settings, LogOut, Plus } from 'lucide-react';

interface PastJob {
  id: string;
  filename: string;
  date: string;
  status: 'completed' | 'processing' | 'failed';
  resolution: string;
  size: string;
  duration: string;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
          <p className="text-gray-600 mb-8">Please sign in to access your dashboard.</p>
          <Link to="/login" className="block w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const pastJobs: PastJob[] = [
    { id: '1', filename: 'Marketing_Strategy_Q4.pptx', date: '2026-01-15', status: 'completed', resolution: '1080p', size: '245 MB', duration: '18:32' },
    { id: '2', filename: 'Intro_to_Physics.pptx', date: '2026-01-14', status: 'completed', resolution: '720p', size: '189 MB', duration: '42:15' },
    { id: '3', filename: 'Team_Onboarding_2026.pptx', date: '2026-01-13', status: 'completed', resolution: '1080p', size: '312 MB', duration: '25:48' },
    { id: '4', filename: 'Data_Science_Basics.pptx', date: '2026-01-12', status: 'failed', resolution: '1080p', size: '0 MB', duration: '-' },
    { id: '5', filename: 'Product_Launch_Pitch.pptx', date: '2026-01-10', status: 'completed', resolution: '480p', size: '98 MB', duration: '12:05' },
  ];

  const stats = [
    { label: 'Total Conversions', value: '47', icon: <FileVideo className="w-5 h-5" />, change: '+5 this week', color: 'bg-blue-50 text-blue-600' },
    { label: 'Credits Remaining', value: user?.credits?.toString() || '3', icon: <CreditCard className="w-5 h-5" />, change: 'Standard plan', color: 'bg-green-50 text-green-600' },
    { label: 'Storage Used', value: '2.4 GB', icon: <BarChart3 className="w-5 h-5" />, change: 'of 10 GB', color: 'bg-purple-50 text-purple-600' },
    { label: 'Avg. Render Time', value: '3.2 min', icon: <Clock className="w-5 h-5" />, change: '-12% faster', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-[80vh] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name || 'User'}!</p>
          </div>
          <Link
            to="/upload"
            className="mt-4 md:mt-0 inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Conversion
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xs text-indigo-600 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 border border-gray-200 mb-6 w-fit">
          {['overview', 'history', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Conversions</h3>
              <div className="space-y-3">
                {pastJobs.slice(0, 4).map(job => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        job.status === 'completed' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {job.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{job.filename}</p>
                        <p className="text-xs text-gray-500">{job.date} • {job.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{job.resolution}</span>
                      {job.status === 'completed' && (
                        <button className="text-indigo-600 hover:text-indigo-700">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/upload" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors group">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <Plus className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New Conversion</p>
                    <p className="text-xs text-gray-500">Upload a PPTX file</p>
                  </div>
                </Link>
                <Link to="/pricing" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors group">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Buy Credits</p>
                    <p className="text-xs text-gray-500">Add more conversion credits</p>
                  </div>
                </Link>
                <button className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group w-full text-left">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Settings</p>
                    <p className="text-xs text-gray-500">Manage your account</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">File</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Resolution</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastJobs.map(job => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate max-w-[200px]">{job.filename}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{job.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{job.resolution}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{job.duration}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{job.size}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {job.status === 'completed' && (
                          <button className="text-indigo-600 hover:text-indigo-700">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
            <h3 className="font-semibold text-gray-900 mb-6">Account Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" defaultValue={user?.name || 'John Doe'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" defaultValue={user?.email || 'john@example.com'} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">{user?.plan || 'Free'}</span>
                  <Link to="/pricing" className="text-sm text-indigo-600 hover:text-indigo-700">Change plan</Link>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  Save Changes
                </button>
                <button className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
