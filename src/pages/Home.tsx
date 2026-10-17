import { Link } from 'react-router-dom';
import { Upload, Play, Download, Shield, Clock, Users, Star, ArrowRight, CheckCircle, Zap, FileVideo, MonitorPlay } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/90">Trusted by 50,000+ educators worldwide</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Turn Presentations<br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Into Videos</span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload your PPTX presentations with narration, and we'll render them into professional-quality MP4 videos in 480p, 720p, or 1080p resolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                <Upload className="w-5 h-5 mr-2" />
                Start Converting
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                View Pricing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-6 text-indigo-200 text-sm">
              <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-green-400" /> No credit card required</span>
              <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-green-400" /> 3 free conversions</span>
              <span className="hidden sm:flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-green-400" /> Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Convert your presentations to video in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload className="w-8 h-8" />,
                step: '01',
                title: 'Upload Your PPTX',
                desc: 'Upload your PowerPoint presentation with embedded narration, animations, and transitions intact.',
                color: 'from-blue-500 to-indigo-600',
              },
              {
                icon: <Play className="w-8 h-8" />,
                step: '02',
                title: 'We Render It',
                desc: 'Our cloud engine processes each slide with timing, narration, and effects into a seamless video.',
                color: 'from-purple-500 to-pink-600',
              },
              {
                icon: <Download className="w-8 h-8" />,
                step: '03',
                title: 'Download MP4',
                desc: 'Download your video in 480p, 720p, or 1080p resolution. Share on any platform instantly.',
                color: 'from-orange-500 to-red-600',
              },
            ].map((item) => (
              <div key={item.step} className="relative group">
                <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-indigo-400 mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create professional presentation videos
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <FileVideo className="w-6 h-6" />, title: 'PPTX Support', desc: 'Full support for PowerPoint 2007-2021 formats with animations and transitions.' },
              { icon: <MonitorPlay className="w-6 h-6" />, title: 'Multiple Resolutions', desc: 'Export in 480p, 720p, or 1080p HD. Perfect for any screen size.' },
              { icon: <Clock className="w-6 h-6" />, title: 'Fast Rendering', desc: 'Cloud-based rendering engine processes your files in minutes, not hours.' },
              { icon: <Shield className="w-6 h-6" />, title: 'Secure Processing', desc: 'Files are encrypted and auto-deleted after 24 hours. Your content stays private.' },
              { icon: <Users className="w-6 h-6" />, title: 'Team Collaboration', desc: 'Share projects with your team. Perfect for educational institutions.' },
              { icon: <Star className="w-6 h-6" />, title: 'Batch Processing', desc: 'Convert multiple presentations at once. Save time on large projects.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built For You</h2>
            <p className="text-lg text-gray-600">Who uses SlideCast Pro?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '👨‍🏫', title: 'Lecturers', desc: 'Create video lectures from your slide decks for online courses and flipped classrooms.' },
              { emoji: '🎓', title: 'Students', desc: 'Turn study notes into video presentations for group projects and submissions.' },
              { emoji: '🏋️', title: 'Trainers', desc: 'Produce training videos from corporate presentations for employee onboarding.' },
              { emoji: '🎬', title: 'Content Creators', desc: 'Generate video content from your presentations for YouTube, courses, and social media.' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by Educators</h2>
            <p className="text-lg text-gray-600">See what our users say</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Dr. Sarah Chen', role: 'University Professor', text: 'SlideCast Pro has transformed how I deliver online lectures. My students love the video format!', rating: 5 },
              { name: 'Marcus Johnson', role: 'Corporate Trainer', text: 'We converted 200+ training decks in a week. The quality is outstanding and the process is seamless.', rating: 5 },
              { name: 'Aisha Patel', role: 'YouTube Educator', text: 'I use this for all my course content. The 1080p output is crystal clear and the rendering is fast.', rating: 5 },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Convert Your First Presentation?</h2>
          <p className="text-lg text-indigo-100 mb-8">
            Start with 3 free conversions. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
