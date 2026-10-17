import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Star, Building2 } from 'lucide-react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free',
      icon: <Zap className="w-6 h-6" />,
      price: { monthly: 0, yearly: 0 },
      credits: 3,
      description: 'Perfect for trying out SlideCast Pro',
      color: 'border-gray-200',
      buttonColor: 'bg-gray-900 hover:bg-gray-800 text-white',
      features: [
        '3 conversions total',
        '720p max resolution',
        '50MB file size limit',
        'Standard rendering speed',
        'Email support',
      ],
      popular: false,
    },
    {
      name: 'Pro',
      icon: <Star className="w-6 h-6" />,
      price: { monthly: 19, yearly: 15 },
      credits: 50,
      description: 'For educators and content creators',
      color: 'border-indigo-500',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      features: [
        '50 credits per month',
        '1080p Full HD resolution',
        '500MB file size limit',
        'Priority rendering queue',
        'Batch processing (up to 5)',
        'Priority email support',
        'Custom watermarks',
        'API access',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      icon: <Building2 className="w-6 h-6" />,
      price: { monthly: 79, yearly: 59 },
      credits: -1,
      description: 'For teams and institutions',
      color: 'border-purple-500',
      buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
      features: [
        'Unlimited conversions',
        '1080p Full HD resolution',
        '2GB file size limit',
        'Instant rendering',
        'Unlimited batch processing',
        'Dedicated account manager',
        'Custom branding',
        'Full API access',
        'SSO & team management',
        'SLA guarantee',
      ],
      popular: false,
    },
  ];

  const creditPacks = [
    { credits: 10, price: 9, label: 'Starter' },
    { credits: 25, price: 19, label: 'Popular', popular: true },
    { credits: 50, price: 34, label: 'Value' },
    { credits: 100, price: 59, label: 'Bulk' },
  ];

  return (
    <div className="min-h-[80vh] bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core conversion features.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-white rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly <span className="text-xs ml-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 ${plan.color} p-8 transition-all hover:shadow-xl ${
                plan.popular ? 'shadow-lg scale-[1.02]' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  plan.popular ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                </span>
                {plan.price.monthly > 0 && (
                  <span className="text-gray-500 ml-1">/month</span>
                )}
                {plan.price.monthly === 0 && (
                  <span className="text-gray-500 ml-1">forever</span>
                )}
              </div>

              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  {plan.credits === -1 ? 'Unlimited' : `${plan.credits}`} conversions
                  {plan.credits > 0 && billingCycle === 'yearly' ? '/month' : plan.credits > 0 ? '/month' : ' total'}
                </p>
              </div>

              <Link
                to="/register"
                className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all ${plan.buttonColor}`}
              >
                {plan.price.monthly === 0 ? 'Get Started Free' : 'Start Free Trial'}
              </Link>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Need More Credits?</h2>
            <p className="text-gray-600">Purchase additional conversion credits anytime. No subscription required.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPacks.map((pack) => (
              <div
                key={pack.credits}
                className={`relative bg-white rounded-xl border p-6 text-center transition-all hover:shadow-lg ${
                  pack.popular ? 'border-indigo-500 shadow-md' : 'border-gray-200'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-0.5 rounded-full">
                      BEST VALUE
                    </span>
                  </div>
                )}
                <p className="text-3xl font-bold text-gray-900">{pack.credits}</p>
                <p className="text-sm text-gray-500 mb-3">credits</p>
                <p className="text-2xl font-bold text-indigo-600 mb-4">${pack.price}</p>
                <p className="text-xs text-gray-400 mb-4">${(pack.price / pack.credits).toFixed(2)} per conversion</p>
                <Link
                  to="/register"
                  className={`block w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    pack.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Buy Now
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What counts as one conversion?', a: 'Each PPTX file you convert to MP4 counts as one conversion, regardless of the number of resolution options you select.' },
              { q: 'Can I upgrade or downgrade my plan?', a: 'Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing cycle.' },
              { q: 'Do credits expire?', a: 'Monthly subscription credits reset each month. Purchased credit packs never expire.' },
              { q: 'Is there a free trial for paid plans?', a: 'Yes, all paid plans come with a 7-day free trial. No credit card required to start.' },
              { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.' },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
