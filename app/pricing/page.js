'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const plans = [
  {
    name: 'Starter',
    price: 29,
    launchPrice: 14.50,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    description: 'Perfect for getting started',
    features: [
      'Up to 50 customers/month',
      'Automated email follow-ups',
      'Google review requests',
      'Basic dashboard',
      'Email support',
    ],
    featured: false,
  },
  {
    name: 'Growth',
    price: 49,
    launchPrice: 24.50,
    priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID,
    description: 'Most popular for growing businesses',
    features: [
      'Up to 200 customers/month',
      'Email + SMS follow-ups',
      '30 & 60-day re-engagement',
      'Full analytics dashboard',
      'Custom message templates',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Pro',
    price: 79,
    launchPrice: 39.50,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    description: 'For multi-location businesses',
    features: [
      'Unlimited customers',
      'Email + SMS + WhatsApp',
      'Multi-location support',
      'White-label messages',
      'API access',
      'Dedicated onboarding',
    ],
    featured: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  const handleCheckout = async (plan) => {
    setLoading(plan.name)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth'
      return
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('name, email')
      .eq('user_id', user.id)
      .single()

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: plan.priceId,
        userId: user.id,
        email: user.email,
        businessName: business?.name || user.email,
      }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setError(data.error || 'Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* Nav */}
      <nav style={s.nav}>
        <a href="/" style={s.logo}>revisit<span style={s.logoAccent}>ly</span></a>
        <a href="/dashboard" style={s.backLink}>← Back to Dashboard</a>
      </nav>

      <div style={s.content}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.badge}>🎉 Launch Special — Limited Time</div>
          <h1 style={s.title}>50% Off Your First 3 Months</h1>
          <p style={s.subtitle}>
            Join our first 100 founding customers and get half off for 3 months.
            Lock in your rate today before prices go up.
          </p>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {/* Pricing Cards */}
        <div style={s.grid}>
          {plans.map(plan => (
            <div
              key={plan.name}
              style={{ ...s.card, ...(plan.featured ? s.cardFeatured : {}) }}
            >
              {plan.featured && (
                <div style={s.popularBadge}>Most Popular</div>
              )}

              <div style={s.planName}>{plan.name}</div>
              <div style={s.planDesc}>{plan.description}</div>

              {/* Price */}
              <div style={s.priceWrap}>
                <div style={s.originalPrice}>${plan.price}/mo</div>
                <div style={s.launchPrice}>
                  <span style={s.priceCurrency}>$</span>
                  {plan.launchPrice}
                  <span style={s.pricePeriod}>/mo</span>
                </div>
                <div style={s.priceNote}>for first 3 months, then ${plan.price}/mo</div>
              </div>

              {/* Features */}
              <ul style={s.features}>
                {plan.features.map(f => (
                  <li key={f} style={s.feature}>
                    <span style={s.check}>✓</span>
                    <span style={s.featureText}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                style={{
                  ...s.btn,
                  ...(plan.featured ? s.btnFeatured : s.btnOutline),
                  ...(loading === plan.name ? s.btnLoading : {}),
                }}
                onClick={() => handleCheckout(plan)}
                disabled={!!loading}
              >
                {loading === plan.name
                  ? 'Redirecting to checkout...'
                  : `Start Free Trial — $${plan.launchPrice}/mo →`}
              </button>

              <p style={s.cardNote}>14-day free trial · Cancel anytime</p>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div style={s.trust}>
          <div style={s.trustItem}>🔒 Secure checkout via Stripe</div>
          <div style={s.trustItem}>💳 No card charged during trial</div>
          <div style={s.trustItem}>❌ Cancel anytime, no questions</div>
          <div style={s.trustItem}>⭐ 50% off auto-applied at checkout</div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    fontFamily: "'DM Sans', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'fixed', width: 500, height: 500,
    borderRadius: '50%', background: '#7c6cff',
    filter: 'blur(140px)', opacity: 0.1,
    top: -150, right: -100, pointerEvents: 'none',
  },
  orb2: {
    position: 'fixed', width: 400, height: 400,
    borderRadius: '50%', background: '#00e5a0',
    filter: 'blur(140px)', opacity: 0.08,
    bottom: -100, left: -100, pointerEvents: 'none',
  },
  nav: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    position: 'relative', zIndex: 1,
  },
  logo: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800,
    fontSize: '1.4rem', color: '#f0f0f8',
    textDecoration: 'none', letterSpacing: '-0.5px',
  },
  logoAccent: { color: '#00e5a0' },
  backLink: {
    color: '#8888aa', textDecoration: 'none',
    fontSize: '0.9rem', fontWeight: 500,
  },
  content: {
    maxWidth: 1000, margin: '0 auto',
    padding: '60px 24px', position: 'relative', zIndex: 1,
  },
  header: { textAlign: 'center', marginBottom: 52 },
  badge: {
    display: 'inline-block',
    background: 'rgba(0,229,160,0.1)',
    border: '1px solid rgba(0,229,160,0.25)',
    color: '#00e5a0', padding: '6px 18px',
    borderRadius: 100, fontSize: '0.82rem',
    fontWeight: 700, marginBottom: 20,
    textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 'clamp(2rem, 4vw, 3rem)',
    fontWeight: 800, color: '#f0f0f8',
    letterSpacing: '-1px', marginBottom: 16,
  },
  subtitle: {
    color: '#8888aa', fontSize: '1rem',
    maxWidth: 520, margin: '0 auto', lineHeight: 1.7,
  },
  errorBox: {
    background: 'rgba(255,80,80,0.1)',
    border: '1px solid rgba(255,80,80,0.25)',
    color: '#ff8080', borderRadius: 12,
    padding: '14px 20px', fontSize: '0.88rem',
    marginBottom: 24, textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20, marginBottom: 40,
  },
  card: {
    background: '#13131a',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 24, padding: '36px 32px',
    position: 'relative', transition: 'transform 0.2s',
  },
  cardFeatured: {
    background: 'linear-gradient(135deg, rgba(0,229,160,0.06) 0%, rgba(124,108,255,0.06) 100%)',
    border: '1px solid rgba(0,229,160,0.25)',
  },
  popularBadge: {
    position: 'absolute', top: -12,
    left: '50%', transform: 'translateX(-50%)',
    background: '#00e5a0', color: '#000',
    padding: '4px 16px', borderRadius: 100,
    fontSize: '0.72rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  planName: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '0.85rem', fontWeight: 700,
    color: '#8888aa', textTransform: 'uppercase',
    letterSpacing: 1, marginBottom: 6,
  },
  planDesc: { color: '#8888aa', fontSize: '0.85rem', marginBottom: 24 },
  priceWrap: { marginBottom: 28 },
  originalPrice: {
    color: '#8888aa', fontSize: '0.9rem',
    textDecoration: 'line-through', marginBottom: 4,
  },
  launchPrice: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '2.8rem', fontWeight: 800,
    color: '#f0f0f8', letterSpacing: '-1px',
    lineHeight: 1,
  },
  priceCurrency: { fontSize: '1.2rem', verticalAlign: 'top', marginTop: 8, display: 'inline-block' },
  pricePeriod: { fontSize: '1rem', color: '#8888aa', fontWeight: 400 },
  priceNote: { color: '#8888aa', fontSize: '0.78rem', marginTop: 6 },
  features: { listStyle: 'none', marginBottom: 28 },
  feature: {
    display: 'flex', alignItems: 'flex-start',
    gap: 10, padding: '7px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '0.88rem',
  },
  check: { color: '#00e5a0', fontWeight: 700, flexShrink: 0 },
  featureText: { color: '#8888aa' },
  btn: {
    width: '100%', padding: '14px',
    borderRadius: 12, fontWeight: 700,
    fontSize: '0.88rem', cursor: 'pointer',
    border: 'none', fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s', marginBottom: 10,
  },
  btnFeatured: { background: '#00e5a0', color: '#000' },
  btnOutline: {
    background: 'transparent', color: '#f0f0f8',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  btnLoading: { opacity: 0.6, cursor: 'not-allowed' },
  cardNote: {
    textAlign: 'center', color: '#8888aa',
    fontSize: '0.75rem',
  },
  trust: {
    display: 'flex', flexWrap: 'wrap',
    justifyContent: 'center', gap: 24,
    padding: '24px 0',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  trustItem: { color: '#8888aa', fontSize: '0.85rem', fontWeight: 500 },
}