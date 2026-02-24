'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    business_type: 'salon',
    google_review_url: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => { loadData() }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data: biz } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (biz) {
      setBusiness(biz)
      setForm({
        name: biz.name || '',
        email: biz.email || '',
        phone: biz.phone || '',
        business_type: biz.business_type || 'salon',
        google_review_url: biz.google_review_url || '',
      })
    }
    setLoading(false)
  }

//   const handleSave = async (e) => {
//     e.preventDefault()
//     setSaving(true)

//     const { error } = await supabase
//       .from('businesses')
//       .update({
//         name: form.name,
//         phone: form.phone,
//         business_type: form.business_type,
//         google_review_url: form.google_review_url,
//       })
//       .eq('id', business.id)

//     if (!error) {
//       showToast('Settings saved successfully!')
//       setBusiness({ ...business, ...form })
//     } else {
//       showToast(error.message, 'error')
//     }
//     setSaving(false)
//   }
const handleSave = async (e) => {
  e.preventDefault()
  setSaving(true)

  // Generate slug from business name
  const slug = form.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const { error } = await supabase
    .from('businesses')
    .update({
      name: form.name,
      phone: form.phone,
      business_type: form.business_type,
      google_review_url: form.google_review_url,
      slug: slug,
    })
    .eq('id', business.id)

  if (!error) {
    showToast('Settings saved successfully!')
    setBusiness({ ...business, ...form, slug })
  } else {
    showToast(error.message, 'error')
  }
  setSaving(false)
}
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    })
    if (!error) {
      showToast('Password updated successfully!')
      setPasswordForm({ newPassword: '', confirmPassword: '' })
    } else {
      showToast(error.message, 'error')
    }
    setSaving(false)
  }

  const handleManageBilling = async () => {
    setCancelLoading(true)
    const res = await fetch('/api/billing-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: business.stripe_customer_id }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      showToast('Could not open billing portal. Please try again.', 'error')
    }
    setCancelLoading(false)
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
      {toast && (
        <div style={{ ...s.toast, ...(toast.type === 'error' ? s.toastError : s.toastSuccess) }}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <a href="/" style={s.logo}>revisit<span style={s.logoAccent}>ly</span></a>
        <nav style={s.nav}>
          <a href="/dashboard" style={{ ...s.navItem, textDecoration: 'none' }}><span>📊</span> Dashboard</a>
          <div style={s.navItem} ><span>➕</span> Add Customer</div>
          <div style={s.navItem}><span>📧</span> Email Logs</div>
          <div style={{ ...s.navItem, ...s.navItemActive }}><span>⚙️</span> Settings</div>
          <a href="/pricing" style={{ ...s.navItem, textDecoration: 'none' }}><span>⭐</span> Change Plan</a>
        </nav>
        <div style={s.sidebarBottom}>
          <div style={s.bizInfo}>
            <div style={s.bizAvatar}>{business?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div style={s.bizName}>{business?.name}</div>
              <div style={s.bizPlan}>{business?.plan} plan</div>
            </div>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} style={s.logoutBtn}>
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.header}>
          <h1 style={s.pageTitle}>Settings</h1>
          <p style={s.pageSubtitle}>Manage your business profile and account</p>
        </div>

        {/* Business Profile */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Business Profile</h2>
          <p style={s.sectionDesc}>This information is used in your follow-up emails to customers.</p>
          <form onSubmit={handleSave} style={s.form}>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Business Name *</label>
                <input style={s.input} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Glow Hair Studio" required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Business Type</label>
                <select style={s.input} value={form.business_type}
                  onChange={e => setForm({ ...form, business_type: e.target.value })}>
                  <option value="salon">Hair & Beauty Salon</option>
                  <option value="clinic">Clinic / Healthcare</option>
                  <option value="trade">Trade (Plumber, Electrician, etc.)</option>
                  <option value="spa">Spa & Wellness</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Contact Email</label>
                <input style={{ ...s.input, ...s.inputDisabled }} value={form.email} disabled />
                <span style={s.fieldHint}>Email cannot be changed here</span>
              </div>
              <div style={s.field}>
                <label style={s.label}>Phone Number</label>
                <input style={s.input} value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="(555) 000-0000" />
              </div>
            </div>

            {/* Google Review URL - Important */}
            <div style={{ ...s.field, marginTop: 8 }}>
              <label style={s.label}>
                Google Review Link
                <span style={s.importantBadge}>Important</span>
              </label>
              <input style={s.input} value={form.google_review_url}
                onChange={e => setForm({ ...form, google_review_url: e.target.value })}
                placeholder="https://g.page/r/your-google-review-link" />
              <span style={s.fieldHint}>
                This link is included in every follow-up email. Get yours from Google Business Profile → Get more reviews → Share review form.
              </span>
            </div>

            <div style={s.formActions}>
              <button type="submit" style={s.btnPrimary} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes →'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Change Password</h2>
          <p style={s.sectionDesc}>Choose a strong password of at least 8 characters.</p>
          <form onSubmit={handlePasswordChange} style={s.form}>
            <div style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>New Password</label>
                <input style={s.input} type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Min. 8 characters" minLength={8} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Confirm New Password</label>
                <input style={s.input} type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat password" required />
              </div>
            </div>
            <div style={s.formActions}>
              <button type="submit" style={s.btnSecondary} disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Billing */}
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Billing & Subscription</h2>
          <p style={s.sectionDesc}>Manage your plan, view invoices, update payment method, or cancel your subscription.</p>
          <div style={s.billingInfo}>
            <div style={s.billingRow}>
              <span style={s.billingLabel}>Current Plan</span>
              <span style={{ ...s.billingValue, color: '#00e5a0', textTransform: 'capitalize' }}>
                {business?.plan || 'Starter'}
              </span>
            </div>
            <div style={s.billingRow}>
              <span style={s.billingLabel}>Billing</span>
              <span style={s.billingValue}>Monthly</span>
            </div>
            <div style={s.billingRow}>
              <span style={s.billingLabel}>Invoices</span>
              <span style={s.billingValue}>Emailed automatically after each payment</span>
            </div>
          </div>
          <div style={s.formActions}>
            <button style={s.btnSecondary} onClick={handleManageBilling} disabled={cancelLoading}>
              {cancelLoading ? 'Opening...' : '📋 Manage Billing & Invoices →'}
            </button>
            <a href="/pricing" style={s.btnPrimary}>⭐ Change Plan →</a>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ ...s.section, ...s.dangerSection }}>
          <h2 style={{ ...s.sectionTitle, color: '#ff8080' }}>Danger Zone</h2>
          <p style={s.sectionDesc}>These actions are permanent and cannot be undone.</p>
          <button
            style={s.btnDanger}
            onClick={() => setShowCancelConfirm(true)}
          >
            Cancel Subscription
          </button>
        </div>

        {/* Cancel Confirm Modal */}
        {showCancelConfirm && (
          <div style={s.modalOverlay}>
            <div style={s.modal}>
              <h3 style={s.modalTitle}>Cancel Subscription?</h3>
              <p style={s.modalText}>
                Your subscription will remain active until the end of your current billing period.
                After that, you'll lose access to all paid features.
              </p>
              <div style={s.modalActions}>
                <button style={s.btnSecondary} onClick={() => setShowCancelConfirm(false)}>
                  Keep Subscription
                </button>
                <button style={s.btnDanger} onClick={() => { setShowCancelConfirm(false); handleManageBilling() }}>
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif" },
  loadingPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' },
  spinner: { width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00e5a0', borderRadius: '50%' },
  toast: { position: 'fixed', top: 24, right: 24, padding: '14px 20px', borderRadius: 12, fontWeight: 600, fontSize: '0.9rem', zIndex: 1000, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  toastSuccess: { background: 'rgba(0,229,160,0.15)', border: '1px solid rgba(0,229,160,0.3)', color: '#00e5a0' },
  toastError: { background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff8080' },
  sidebar: { width: 240, background: '#13131a', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', padding: '28px 16px', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 },
  logo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#f0f0f8', textDecoration: 'none', letterSpacing: '-0.5px', paddingLeft: 12, marginBottom: 36, display: 'block' },
  logoAccent: { color: '#00e5a0' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, color: '#8888aa', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' },
  navItemActive: { background: 'rgba(0,229,160,0.08)', color: '#00e5a0', border: '1px solid rgba(0,229,160,0.15)' },
  sidebarBottom: { borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  bizInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  bizAvatar: { width: 36, height: 36, background: 'linear-gradient(135deg, #00e5a0, #7c6cff)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#000', flexShrink: 0 },
  bizName: { color: '#f0f0f8', fontSize: '0.85rem', fontWeight: 600 },
  bizPlan: { color: '#8888aa', fontSize: '0.75rem', textTransform: 'capitalize' },
  logoutBtn: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', color: '#8888aa', borderRadius: 10, padding: '9px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, padding: '36px 40px', overflowY: 'auto', maxWidth: 800 },
  header: { marginBottom: 36 },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#f0f0f8', letterSpacing: '-0.5px' },
  pageSubtitle: { color: '#8888aa', fontSize: '0.9rem', marginTop: 4 },
  section: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '28px 32px', marginBottom: 20 },
  dangerSection: { border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.03)' },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#f0f0f8', marginBottom: 6 },
  sectionDesc: { color: '#8888aa', fontSize: '0.88rem', marginBottom: 24 },
  form: {},
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { color: '#f0f0f8', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 },
  importantBadge: { background: 'rgba(255,209,102,0.15)', border: '1px solid rgba(255,209,102,0.3)', color: '#ffd166', padding: '2px 8px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 },
  input: { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f0f0f8', padding: '11px 14px', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '100%', boxSizing: 'border-box' },
  inputDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  fieldHint: { color: '#8888aa', fontSize: '0.75rem', lineHeight: 1.5 },
  formActions: { display: 'flex', gap: 12, marginTop: 20 },
  btnPrimary: { background: '#00e5a0', color: '#000', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', display: 'inline-flex', alignItems: 'center' },
  btnSecondary: { background: 'transparent', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '11px 22px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif' " },
  btnDanger: { background: 'rgba(255,80,80,0.1)', color: '#ff8080', border: '1px solid rgba(255,80,80,0.25)', borderRadius: 10, padding: '11px 22px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  billingInfo: { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  billingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  billingLabel: { color: '#8888aa', fontSize: '0.88rem' },
  billingValue: { color: '#f0f0f8', fontSize: '0.88rem', fontWeight: 500 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#13131a', border: '1px solid rgba(255,80,80,0.2)', borderRadius: 20, padding: 40, maxWidth: 420, width: '90%' },
  modalTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.2rem', fontWeight: 700, color: '#f0f0f8', marginBottom: 12 },
  modalText: { color: '#8888aa', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 28 },
  modalActions: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
}