import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out the platform',
    credits: 5,
    features: [
      '5 conversion credits/month',
      '480p output only',
      'Max 20 slides per file',
      'Standard processing queue',
      'Email support',
    ],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Professional',
    price: '$19',
    period: '/month',
    description: 'For educators and regular users',
    credits: 50,
    features: [
      '50 conversion credits/month',
      '480p, 720p & 1080p output',
      'Unlimited slides per file',
      'Priority processing queue',
      'Narration sync optimization',
      'Priority email support',
      'API access',
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '$79',
    period: '/month',
    description: 'For teams and institutions',
    credits: 200,
    features: [
      '200 conversion credits/month',
      'All resolutions up to 4K',
      'Unlimited slides & file size',
      'Instant processing queue',
      'Advanced narration AI',
      'Dedicated account manager',
      'Custom branding on videos',
      'Team collaboration tools',
      'SSO & admin controls',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

const creditPacks = [
  { credits: 10, price: '$9', perCredit: '$0.90' },
  { credits: 25, price: '$19', perCredit: '$0.76', popular: true },
  { credits: 50, price: '$35', perCredit: '$0.70' },
  { credits: 100, price: '$59', perCredit: '$0.59' },
];

export default function Pricing() {
  return (
    <section className="py-5 mt-5">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
          <p className="section-subtitle">
            Choose the plan that fits your needs. All plans include core conversion features.
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="row g-4 mb-5">
          {plans.map(plan => (
            <div key={plan.name} className="col-lg-4">
              <div className={`pricing-card h-100 ${plan.featured ? 'featured' : ''}`}>
                {plan.featured && <span className="pricing-badge">Most Popular</span>}
                <h4 className="text-light mb-2">{plan.name}</h4>
                <p className="text-secondary small mb-3">{plan.description}</p>
                <div className="mb-4">
                  <span className="fs-1 fw-bold text-light">{plan.price}</span>
                  <span className="text-secondary">{plan.period}</span>
                </div>
                <div className="mb-4">
                  <span className="badge bg-primary px-3 py-2">
                    <i className="fas fa-coins me-1"></i> {plan.credits} credits/month
                  </span>
                </div>
                <ul className="list-unstyled mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="mb-2 text-secondary">
                      <i className="fas fa-check me-2" style={{ color: '#10b981' }}></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`btn w-100 ${plan.featured ? 'btn-primary-custom' : 'btn-outline-custom'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <div className="text-center mb-5 mt-5 pt-5">
          <h3 className="text-light mb-2">Need More Credits?</h3>
          <p className="text-secondary">Purchase credit packs anytime — no subscription required</p>
        </div>

        <div className="row g-4">
          {creditPacks.map(pack => (
            <div key={pack.credits} className="col-lg-3 col-md-6">
              <div className={`card-custom text-center h-100 ${pack.popular ? 'glow-purple' : ''}`} style={pack.popular ? { borderColor: 'rgba(99,102,241,0.3)' } : {}}>
                {pack.popular && (
                  <span className="badge bg-primary mb-3">Best Value</span>
                )}
                <h3 className="text-light">{pack.credits}</h3>
                <small className="text-secondary d-block mb-2">credits</small>
                <div className="fs-2 fw-bold text-light mb-1">{pack.price}</div>
                <small className="text-secondary">{pack.perCredit}/credit</small>
                <hr style={{ borderColor: 'rgba(99,102,241,0.1)' }} />
                <Link to="/register" className="btn btn-outline-custom btn-sm w-100">
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-5 pt-5">
          <div className="text-center mb-5">
            <h3 className="text-light mb-2">Frequently Asked Questions</h3>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="pricingFAQ">
                {[
                  { q: 'How are credits consumed?', a: 'Each resolution output consumes credits: 480p = 1 credit, 720p = 2 credits, 1080p = 3 credits. If you select multiple resolutions, credits are consumed for each.' },
                  { q: 'Do unused credits roll over?', a: 'Subscription credits do not roll over to the next month. Credit packs you purchase separately never expire.' },
                  { q: 'Can I upgrade or downgrade my plan?', a: 'Yes! You can change your plan anytime. Upgrades take effect immediately, and downgrades apply at the next billing cycle.' },
                  { q: 'Is there a file size limit?', a: 'Free plan: 50MB max. Professional: 200MB. Enterprise: No limit. All plans support up to 100 slides per presentation.' },
                  { q: 'Do you offer educational discounts?', a: 'Yes! We offer 50% off for verified educational institutions. Contact our sales team for details.' },
                ].map((item, i) => (
                  <div key={i} className="accordion-item mb-3" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 12, overflow: 'hidden' }}>
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed text-light" type="button" data-bs-toggle="collapse" data-bs-target={`#faq${i}`}
                        style={{ background: 'transparent', boxShadow: 'none' }}>
                        {item.q}
                      </button>
                    </h2>
                    <div id={`faq${i}`} className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                      <div className="accordion-body text-secondary">
                        {item.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
