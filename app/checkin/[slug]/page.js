'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function CheckinPage() {
  const { slug } = useParams()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', referral: ''
  })

  useEffect(() => {
    if (!slug) return

    fetch(`/api/get-business?slug=${slug}`)
      .then(res => res.json())
      .then(json => {
        if (json?.data) {
          setBusiness(json.data)
        } else {
          setNotFound(true)
        }
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [slug])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
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
    } catch {
      alert('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

//   const serviceOptions = {
//     salon: ['Haircut', 'Colour', 'Blowdry', 'Treatment', 'Extensions', 'Other'],
//     clinic: ['Consultation', 'Treatment', 'Follow-up', 'Procedure', 'Other'],
//     trade: ['Repair', 'Installation', 'Maintenance', 'Inspection', 'Quote', 'Other'],
//     spa: ['Massage', 'Facial', 'Body Treatment', 'Manicure', 'Pedicure', 'Other'],
//     other: ['Service', 'Consultation', 'Appointment', 'Other'],
//   }
const serviceOptions = {
  salon: ['Haircut', 'Colour', 'Blowdry', 'Treatment', 'Extensions', 'Other'],
  restaurant: ['Dine In', 'Takeout', 'Delivery', 'Private Event', 'Other'],  // ← Add
  takeout: ['Pickup', 'Delivery', 'Catering', 'Other'],                       // ← Add
  clinic: ['Consultation', 'Treatment', 'Follow-up', 'Procedure', 'Other'],
  trade: ['Repair', 'Installation', 'Maintenance', 'Inspection', 'Quote', 'Other'],
  spa: ['Massage', 'Facial', 'Body Treatment', 'Manicure', 'Pedicure', 'Other'],
  other: ['Service', 'Consultation', 'Appointment', 'Other'],
}

  const services = serviceOptions[business?.business_type] || serviceOptions.other

  // LOADING
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00e5a0', borderRadius: '50%' }} />
      </div>
    )
  }

  // NOT FOUND
  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', textAlign: 'center', padding: 24 }}>
        <div>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <h2 style={{ color: '#f0f0f8', fontSize: '1.5rem', marginBottom: 8 }}>Business Not Found</h2>
          <p style={{ color: '#8888aa' }}>This check-in link doesn't exist or has been deactivated.</p>
        </div>
      </div>
    )
  }

  // SUCCESS
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: 24 }}>
        <div style={{ background: '#13131a', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
          <h2 style={{ color: '#f0f0f8', fontFamily: 'sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Thank You!</h2>
          <p style={{ color: '#8888aa', lineHeight: 1.7, marginBottom: 12 }}>
            Thanks for checking in at <strong style={{ color: '#00e5a0' }}>{business.name}</strong>!
          </p>
          <p style={{ color: '#8888aa', fontSize: '0.9rem', marginBottom: 28 }}>
            We'll be in touch soon with something special for you 😊
          </p>
          {business.google_review_url && (
            <a href={business.google_review_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: '#00e5a0', color: '#000', padding: '14px 28px', borderRadius: 100, fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
              ⭐ Leave Us a Google Review
            </a>
          )}
        </div>
      </div>
    )
  }

  // FORM
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: '#7c6cff', filter: 'blur(140px)', opacity: 0.1, top: -100, right: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 350, height: 350, borderRadius: '50%', background: '#00e5a0', filter: 'blur(140px)', opacity: 0.08, bottom: -100, left: -100, pointerEvents: 'none' }} />

      <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 460, position: 'relative', zIndex: 1, boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #00e5a0, #7c6cff)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 800, color: '#000', margin: '0 auto 16px' }}>
            {business.name.charAt(0).toUpperCase()}
          </div>
          <h1 style={{ color: '#f0f0f8', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
            {business.name}
          </h1>
          <p style={{ color: '#8888aa', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Join our VIP list and get exclusive offers & updates!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ color: '#f0f0f8', fontSize: '0.82rem', fontWeight: 600 }}>Full Name *</label>
            <input
              style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#f0f0f8', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ color: '#f0f0f8', fontSize: '0.82rem', fontWeight: 600 }}>Email Address *</label>
            <input
              type="email"
              style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#f0f0f8', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ color: '#f0f0f8', fontSize: '0.82rem', fontWeight: 600 }}>Phone Number</label>
            <input
              type="tel"
              style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#f0f0f8', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="(555) 000-0000"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ color: '#f0f0f8', fontSize: '0.82rem', fontWeight: 600 }}>Service Today</label>
            <select
              style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#f0f0f8', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', width: '100%' }}
              value={form.service}
              onChange={e => setForm({ ...form, service: e.target.value })}
            >
              <option value="">Select a service...</option>
              {services.map(sv => <option key={sv} value={sv}>{sv}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <label style={{ color: '#f0f0f8', fontSize: '0.82rem', fontWeight: 600 }}>How did you hear about us?</label>
            <select
              style={{ background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#f0f0f8', padding: '13px 16px', fontSize: '0.95rem', outline: 'none', width: '100%' }}
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
            disabled={submitting}
            style={{ background: submitting ? '#8888aa' : '#00e5a0', color: '#000', border: 'none', borderRadius: 12, padding: '15px', fontWeight: 700, fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', marginTop: 8 }}
          >
            {submitting ? 'Checking in...' : 'Check In →'}
          </button>

          <p style={{ color: '#8888aa', fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.6 }}>
            🔒 Your details are safe with us. Unsubscribe anytime.
          </p>
        </form>

        <div style={{ textAlign: 'center', color: '#8888aa', fontSize: '0.75rem', marginTop: 24 }}>
          Powered by <a href="/" style={{ color: '#00e5a0', textDecoration: 'none', fontWeight: 600 }}>Revisitly</a>
        </div>
      </div>
    </div>
  )
}