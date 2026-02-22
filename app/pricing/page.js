'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const PLANS = [
  {
    key: 'starter',
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
  },
  {
    key: 'growth',
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
    key: 'pro',
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
  },
]

const PLAN_ORDER = { starter: 1, growth: 2, pro: 3 }

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState(null)
  const [user, setUser] = useState(null)
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setBusiness(biz)
      setCurrentPlan(biz?.plan || 'starter')
    }
    setLoading(false)
  }

  const getPlanAction = (planKey) => {
    if (!currentPlan || currentPlan === 'cancelled' || currentPlan === 'inactive') return 'subscribe'
    if (planKey === currentPlan) return 'current'
    if (PLAN_ORDER[planKey] > PLAN_ORDER[currentPlan]) return 'upgrade'
    if (PLAN_ORDER[planKey] < PLAN_ORDER[currentPlan]) return 'downgrade'
    return 'subscribe'
  }

  const handleCheckout = async (plan) => {
    if (!user) { window.location.href = '/auth'; return }
    setCheckoutLoading(plan.key)
    setError('')

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
      setCheckoutLoading(null)
    }
  }

  const getButtonLabel = (planKey) => {
    const action = getPlanAction(planKey)
    if (checkoutLoading === planKey) return 'Redirecting...'
    switch (action) {
      case 'current':   return '✓ Your Current Plan'
      case 'upgrade':   return `Upgrade to ${planKey.charAt(0).toUpperCase() + planKey.slice(1)} →`
      case 'downgrade': return `Downgrade to ${planKey.charAt(0).toUpperCase() + planKey.slice(1)}`
      case 'subscribe': return `Get Started →`
      default:          return 'Get Started →'
    }
  }

  const getActionBadge = (planKey) => {
    const action = getPlanAction(planKey)
    switch (action) {
      case 'current':   return { label: 'Current Plan', color: '#8888aa', bg: 'rgba(136,136,170,0.1)' }
      case 'upgrade':   return { label: '⬆ Upgrade', color: '#00e5a0', bg: 'rgba(0,229,160,0.1)' }
      case 'downgrade': return { label: '⬇ Downgrade', color: '#ffd166', bg: 'rgba(255,209,102,0.1)' }
      default:          return null
    }
  }

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.spinner} />
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* Nav */}
      <nav style={s.nav}>
        <a href="/" style={s.logo}>revisit<span style={s.logoAccent}>ly</span></a>
        {user && <a href="/dashboard" style={s.backLink}>← Back to Dashboard</a>}
      </nav>

      <div style={s.content}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.badge}>🎉 Launch Special — 50% Off First 3 Months</div>
          <h1 style={s.title}>
            {currentPlan && currentPlan !== 'cancelled'
              ? 'Change Your Plan'
              : 'Choose Your Plan'}
          </h1>
          <p style={s.subtitle}>
            {currentPlan && currentPlan !== 'cancelled'
              ? `You're currently on the ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan. Upgrade or downgrade anytime.`
              : 'Start free for 14 days. No credit card required.'}
          </p>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {/* Pricing Grid */}
        <div style={s.grid}>
          {PLANS.map(plan => {
            const action = getPlanAction(plan.key)
            const badge = getActionBadge(plan.key)
            const isCurrent = action === 'current'
            const isDisabled = isCurrent || !!checkoutLoading

            return (
              <div key={plan.key} style={{
                ...s.card,
                ...(plan.featured && !isCurrent ? s.cardFeatured : {}),
                ...(isCurrent ? s.cardCurrent : {}),
              }}>
                {/* Top badges */}
                <div style={s.cardTopRow}>
                  {plan.featured && !isCurrent && (
                    <span style={s.popularBadge}>Most Popular</span>
                  )}
                  {badge && (
                    <span style={{
                      ...s.actionBadge,
                      color: badge.color,
                      background: badge.bg,
                      border: `1px solid ${badge.color}30`,
                    }}>
                      {badge.label}
                    </span>
                  )}
                </div>

                <div style={s.planName}>{plan.name}</div>
                <div style={s.planDesc}>{plan.description}</div>

                {/* Price */}
                <div style={s.priceWrap}>
                  <div style={s.originalPrice}>${plan.price}/mo</div>
                  <div style={s.launchPrice}>
                    <span style={s.currency}>$</span>
                    {plan.launchPrice}
                    <span style={s.period}>/mo</span>
                  </div>
                  <div style={s.priceNote}>for first 3 months, then ${plan.price}/mo</div>
                </div>

                {/* Features */}
                <ul style={s.features}>
                  {plan.features.map(f => (
                    <li key={f} style={s.feature}>
                      <span style={{ ...s.check, color: isCurrent ? '#8888aa' : '#00e5a0' }}>✓</span>
                      <span style={s.featureText}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  style={{
                    ...s.btn,
                    ...(isCurrent ? s.btnCurrent : plan.featured ? s.btnFeatured : s.btnOutline),
                    ...(isDisabled ? s.btnDisabled : {}),
                  }}
                  onClick={() => !isCurrent && handleCheckout(plan)}
                  disabled={isDisabled}
                >
                  {getButtonLabel(plan.key)}
                </button>

                {!isCurrent && (
                  <p style={s.cardNote}>14-day free trial · Cancel anytime</p>
                )}
              </div>
            )
          })}
        </div>

        {/* Trust */}
        <div style={s.trust}>
          <div style={s.trustItem}>🔒 Secure checkout via Stripe</div>
          <div style={s.trustItem}>💳 No card charged during trial</div>
          <div style={s.trustItem}>❌ Cancel anytime</div>
          <div style={s.trustItem}>⭐ 50% off auto-applied</div>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' },
  loadingPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' },
  spinner: { width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00e5a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  orb1: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: '#7c6cff', filter: 'blur(140px)', opacity: 0.1, top: -150, right: -100, pointerEvents: 'none' },
  orb2: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#00e5a0', filter: 'blur(140px)', opacity: 0.08, bottom: -100, left: -100, pointerEvents: 'none' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1 },
  logo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#f0f0f8', textDecoration: 'none', letterSpacing: '-0.5px' },
  logoAccent: { color: '#00e5a0' },
  backLink: { color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 },
  content: { maxWidth: 1000, margin: '0 auto', padding: '60px 24px', position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: 52 },
  badge: { display: 'inline-block', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', color: '#00e5a0', padding: '6px 18px', borderRadius: 100, fontSize: '0.82rem', fontWeight: 700, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.5px' },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#f0f0f8', letterSpacing: '-1px', marginBottom: 16 },
  subtitle: { color: '#8888aa', fontSize: '1rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 },
  errorBox: { background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080', borderRadius: 12, padding: '14px 20px', fontSize: '0.88rem', marginBottom: 24, textAlign: 'center' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 },
  card: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '32px', position: 'relative', transition: 'transform 0.2s' },
  cardFeatured: { background: 'linear-gradient(135deg, rgba(0,229,160,0.06) 0%, rgba(124,108,255,0.06) 100%)', border: '1px solid rgba(0,229,160,0.25)' },
  cardCurrent: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.8 },
  cardTopRow: { display: 'flex', justifyContent: 'flex-end', marginBottom: 16, minHeight: 24 },
  popularBadge: { background: '#00e5a0', color: '#000', padding: '3px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
  actionBadge: { padding: '3px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700 },
  planName: { fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  planDesc: { color: '#8888aa', fontSize: '0.85rem', marginBottom: 24 },
  priceWrap: { marginBottom: 28 },
  originalPrice: { color: '#8888aa', fontSize: '0.9rem', textDecoration: 'line-through', marginBottom: 4 },
  launchPrice: { fontFamily: "'Syne', sans-serif", fontSize: '2.8rem', fontWeight: 800, color: '#f0f0f8', letterSpacing: '-1px', lineHeight: 1 },
  currency: { fontSize: '1.2rem', verticalAlign: 'top', marginTop: 8, display: 'inline-block' },
  period: { fontSize: '1rem', color: '#8888aa', fontWeight: 400 },
  priceNote: { color: '#8888aa', fontSize: '0.78rem', marginTop: 6 },
  features: { listStyle: 'none', marginBottom: 28 },
  feature: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem' },
  check: { fontWeight: 700, flexShrink: 0 },
  featureText: { color: '#8888aa' },
  btn: { width: '100%', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', border: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', marginBottom: 10 },
  btnFeatured: { background: '#00e5a0', color: '#000' },
  btnOutline: { background: 'transparent', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.12)' },
  btnCurrent: { background: 'rgba(255,255,255,0.04)', color: '#8888aa', border: '1px solid rgba(255,255,255,0.07)', cursor: 'default' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  cardNote: { textAlign: 'center', color: '#8888aa', fontSize: '0.75rem' },
  trust: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24, padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.07)' },
  trustItem: { color: '#8888aa', fontSize: '0.85rem', fontWeight: 500 },
}