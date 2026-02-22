'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

export default function CheckinPage({ params }) {
  const slug = params.slug
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    referral: '',
  })

  useEffect(() => { loadBusiness() }, [slug])

  const loadBusiness = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('id, name, business_type, google_review_url')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      setNotFound(true)
    } else {
      setBusiness(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: business.id,
        businessName: business.name,
        ...form,
      }),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      alert('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  const serviceOptions = {
    salon: ['Haircut', 'Colour', 'Blowdry', 'Treatment', 'Extensions', 'Other'],
    clinic: ['Consultation', 'Treatment', 'Follow-up', 'Procedure', 'Other'],
    trade: ['Repair', 'Installation', 'Maintenance', 'Inspection', 'Quote', 'Other'],
    spa: ['Massage', 'Facial', 'Body Treatment', 'Manicure', 'Pedicure', 'Other'],
    other: ['Service', 'Consultation', 'Appointment', 'Other'],
  }

  const services = serviceOptions[business?.business_type] || serviceOptions.other

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.spinner} />
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={s.loadingPage}>
        <div style={s.notFound}>
          <div style={s.notFoundIcon}>🔍</div>
          <h2 style={s.notFoundTitle}>Business Not Found</h2>
          <p style={s.notFoundText}>This check-in link doesn't exist or has been deactivated.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={s.successPage}>
        <div style={s.orb1} />
        <div style={s.orb2} />
        <div style={s.successCard}>
          <div style={s.successIcon}>🎉</div>
          <h2 style={s.successTitle}>Thank You!</h2>
          <p style={s.successText}>
            Thanks for checking in at <strong style={{ color: '#00e5a0' }}>{business.name}</strong>!
            We hope you had a wonderful experience.
          </p>
          <p style={s.successSub}>
            We'll be in touch soon with a little something special for you. 😊
          </p>
          {business.google_review_url && (
            <a href={business.google_review_url} target="_blank" rel="noopener noreferrer" style={s.reviewBtn}>
              ⭐ Leave Us a Google Review
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      <div style={s.card}>
        {/* Header */}
        <div style={s.cardHeader}>
          <div style={s.bizAvatar}>
            {business.name.charAt(0).toUpperCase()}
          </div>
          <h1 style={s.bizName}>{business.name}</h1>
          <p style={s.cardSubtitle}>
            Join our VIP list and get exclusive offers & updates!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>

          <div style={s.field}>
            <label style={s.label}>Full Name *</label>
            <input
              style={s.input}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Email Address *</label>
            <input
              style={s.input}
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Phone Number</label>
            <input
              style={s.input}
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="(555) 000-0000"
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Service Today</label>
            <select
              style={s.input}
              value={form.service}
              onChange={e => setForm({ ...form, service: e.target.value })}
            >
              <option value="">Select a service...</option>
              {services.map(sv => (
                <option key={sv} value={sv}>{sv}</option>
              ))}
            </select>
          </div>

          <div style={s.field}>
            <label style={s.label}>How did you hear about us?</label>
            <select
              style={s.input}
              value={form.referral}
              onChange={e => setForm({ ...form, referral: e.target.value })}
            >
              <option value="">Select an option...</option>
              <option value="google">Google Search</option>
              <option value="google_maps">Google Maps</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="friend">Friend / Family</option>
              <option value="walked_past">Walked Past</option>
              <option value="returning">Returning Customer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ ...s.btnSubmit, ...(submitting ? s.btnDisabled : {}) }}
            disabled={submitting}
          >
            {submitting ? 'Checking in...' : 'Check In →'}
          </button>

          <p style={s.privacyNote}>
            🔒 Your details are safe with us. We'll only contact you with
            relevant updates and offers. Unsubscribe anytime.
          </p>
        </form>

        <div style={s.poweredBy}>
          Powered by <a href="/" style={s.poweredByLink}>Revisitly</a>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' },
  loadingPage: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" },
  successPage: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif", position: 'relative', overflow: 'hidden' },
  orb1: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: '#7c6cff', filter: 'blur(140px)', opacity: 0.12, top: -150, right: -100, pointerEvents: 'none' },
  orb2: { position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#00e5a0', filter: 'blur(140px)', opacity: 0.1, bottom: -100, left: -100, pointerEvents: 'none' },
  spinner: { width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00e5a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  notFound: { textAlign: 'center', color: '#f0f0f8' },
  notFoundIcon: { fontSize: '3rem', marginBottom: 16 },
  notFoundTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 },
  notFoundText: { color: '#8888aa' },
  card: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 460, position: 'relative', zIndex: 1, boxShadow: '0 40px 100px rgba(0,0,0,0.5)' },
  cardHeader: { textAlign: 'center', marginBottom: 32 },
  bizAvatar: { width: 64, height: 64, background: 'linear-gradient(135deg, #00e5a0, #7c6cff)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.6rem', color: '#000', margin: '0 auto 16px' },
  bizName: { fontFamily: "'Syne', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f8', letterSpacing: '-0.5px', marginBottom: 8 },
  cardSubtitle: { color: '#8888aa', fontSize: '0.9rem', lineHeight: 1.6 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { color: '#f0f0f8', fontSize: '0.82rem', fontWeight: 600 },
  input: { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#f0f0f8', padding: '13px 16px', fontSize: '0.95rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' },
  btnSubmit: { background: '#00e5a0', color: '#000', border: 'none', borderRadius: 12, padding: '15px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: 8, transition: 'opacity 0.2s' },
  btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  privacyNote: { color: '#8888aa', fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.6 },
  poweredBy: { textAlign: 'center', color: '#8888aa', fontSize: '0.75rem', marginTop: 24 },
  poweredByLink: { color: '#00e5a0', textDecoration: 'none', fontWeight: 600 },
  successCard: { background: '#13131a', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 24, padding: '48px 40px', width: '100%', maxWidth: 440, textAlign: 'center', position: 'relative', zIndex: 1 },
  successIcon: { fontSize: '3.5rem', marginBottom: 20 },
  successTitle: { fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#f0f0f8', letterSpacing: '-0.5px', marginBottom: 16 },
  successText: { color: '#8888aa', fontSize: '1rem', lineHeight: 1.7, marginBottom: 12 },
  successSub: { color: '#8888aa', fontSize: '0.9rem', marginBottom: 28 },
  reviewBtn: { display: 'inline-block', background: '#00e5a0', color: '#000', padding: '14px 28px', borderRadius: 100, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' },
}