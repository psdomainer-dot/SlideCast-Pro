import { Link } from 'react-router-dom';
import { Users, Target, Shield, Globe, Award, Heart, ArrowRight } from 'lucide-react';

export default function About() {
  const team = [
    { name: 'Alex Rivera', role: 'CEO & Co-Founder', emoji: '👨‍💼' },
    { name: 'Dr. Priya Sharma', role: 'CTO & Co-Founder', emoji: '👩‍💻' },
    { name: 'James O\'Brien', role: 'Head of Engineering', emoji: '👨‍🔬' },
    { name: 'Maria Santos', role: 'Head of Design', emoji: '👩‍🎨' },
    { name: 'David Kim', role: 'Lead Developer', emoji: '👨‍💻' },
    { name: 'Sarah Thompson', role: 'Customer Success', emoji: '👩‍💼' },
  ];

  const milestones = [
    { year: '2022', event: 'SlideCast Pro founded in San Francisco' },
    { year: '2023', event: 'Launched beta with 1,000 users' },
    { year: '2024', event: 'Reached 10,000 active users' },
    { year: '2025', event: 'Enterprise plan launched' },
    { year: '2026', event: '50,000+ users worldwide' },
  ];

  return (
    <div className="min-h-[80vh]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About SlideCast Pro</h1>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
            We're on a mission to make presentation-to-video conversion accessible to everyone.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                SlideCast Pro was born from a simple observation: millions of educators, trainers, and content creators spend hours crafting beautiful presentations, but struggle to convert them into engaging video content.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                We built SlideCast Pro to bridge that gap. Our cloud-powered rendering engine takes your PPTX presentations — complete with animations, transitions, and narration — and transforms them into professional-quality MP4 videos in minutes.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Whether you're a university lecturer creating online course materials, a corporate trainer building onboarding videos, or a content creator producing educational content — SlideCast Pro is built for you.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Users className="w-8 h-8" />, value: '50,000+', label: 'Active Users', color: 'from-blue-500 to-indigo-600' },
                { icon: <Globe className="w-8 h-8" />, value: '120+', label: 'Countries', color: 'from-purple-500 to-pink-600' },
                { icon: <Award className="w-8 h-8" />, value: '2M+', label: 'Videos Created', color: 'from-orange-500 to-red-600' },
                { icon: <Heart className="w-8 h-8" />, value: '99.9%', label: 'Uptime', color: 'from-green-500 to-emerald-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mx-auto mb-3`}>
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-8 h-8" />,
                title: 'Simplicity First',
                desc: 'We believe powerful tools should be easy to use. Our platform is designed so anyone can convert presentations to video in under 2 minutes.',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Privacy & Security',
                desc: 'Your presentations contain sensitive information. We use end-to-end encryption and automatically delete files after processing.',
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: 'Education For All',
                desc: 'We offer free tiers and educational discounts because we believe quality education tools should be accessible to everyone.',
              },
            ].map((value, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
          </div>
          <div className="space-y-0">
            {milestones.map((milestone, i) => (
              <div key={i} className="flex items-start space-x-4 relative">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-indigo-600 rounded-full border-4 border-indigo-100 z-10"></div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-16 bg-indigo-100"></div>}
                </div>
                <div className="pb-8">
                  <span className="text-sm font-bold text-indigo-600">{milestone.year}</span>
                  <p className="text-gray-900 font-medium">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">The people behind SlideCast Pro</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 text-center hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">{member.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join 50,000+ Users Worldwide</h2>
          <p className="text-lg text-indigo-100 mb-8">
            Start converting your presentations into stunning videos today.
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
