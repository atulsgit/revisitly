'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const PLAN_DETAILS = {
  starter: { label: 'Starter', color: '#8888aa', limit: '50 customers/mo' },
  growth:  { label: 'Growth',  color: '#00e5a0', limit: '200 customers/mo' },
  pro:     { label: 'Pro',     color: '#7c6cff', limit: 'Unlimited customers' },
  cancelled: { label: 'Cancelled', color: '#ff8080', limit: 'No active plan' },
  inactive:  { label: 'Inactive',  color: '#ff8080', limit: 'No active plan' },
}

export default function Dashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [business, setBusiness] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', notes: '' })
  const [adding, setAdding] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      showToast('🎉 Payment successful! Welcome to Revisitly!', 'success')
      window.history.replaceState({}, '', '/dashboard')
    }
    loadData()
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data: biz } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setBusiness(biz)

    if (biz) {
      const { data: custs } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false })
      setCustomers(custs || [])
    }
    setLoading(false)
  }

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    setAdding(true)
    const { data, error } = await supabase
      .from('customers')
      .insert({
        business_id: business.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        notes: newCustomer.notes,
        last_visit: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (!error && data) {
      setCustomers([data, ...customers])
      setNewCustomer({ name: '', email: '', phone: '', notes: '' })
      setShowAddForm(false)
      showToast('Customer added successfully!')
    } else {
      showToast(error.message, 'error')
    }
    setAdding(false)
  }

  const handleSendFollowUp = async (customer) => {
    if (!customer.email) { showToast('No email address for this customer', 'error'); return }
    setSendingEmail(customer.id)

    const res = await fetch('/api/followup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        businessName: business.name,
      }),
    })

    if (res.ok) {
      setCustomers(customers.map(c =>
        c.id === customer.id
          ? { ...c, followup_sent: true, followup_sent_at: new Date().toISOString() }
          : c
      ))
      showToast(`Follow-up sent to ${customer.name}!`)
    } else {
      showToast('Failed to send email. Check your Resend API key.', 'error')
    }
    setSendingEmail(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const currentPlan = PLAN_DETAILS[business?.plan] || PLAN_DETAILS['starter']
  const totalCustomers = customers.length
  const followupsSent = customers.filter(c => c.followup_sent).length
  const reviewsRequested = customers.filter(c => c.review_requested).length
  const thisMonth = customers.filter(c => {
    const d = new Date(c.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={s.spinner} />
        <p style={{ color: '#8888aa', marginTop: 16 }}>Loading your dashboard...</p>
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
          <div style={{ ...s.navItem, ...s.navItemActive }}>
            <span>📊</span> Dashboard
          </div>
          <div style={s.navItem} onClick={() => setShowAddForm(true)}>
            <span>➕</span> Add Customer
          </div>
          <div style={s.navItem}>
            <span>📧</span> Email Logs
          </div>
          <div style={s.navItem}>
            <span>⚙️</span> Settings
          </div>
          <a href="/pricing" style={{ ...s.navItem, textDecoration: 'none' }}>
            <span>⭐</span> Change Plan
          </a>
        </nav>

        <div style={s.sidebarBottom}>
          {/* Plan Badge */}
          <div style={s.planBadge}>
            <div style={s.planBadgeTop}>
              <span style={s.planBadgeLabel}>Current Plan</span>
              <span style={{
                ...s.planBadgeName,
                color: currentPlan.color,
                borderColor: currentPlan.color,
                background: `${currentPlan.color}15`,
              }}>
                {currentPlan.label}
              </span>
            </div>
            <div style={s.planBadgeLimit}>{currentPlan.limit}</div>
            {(business?.plan === 'starter' || !business?.plan) && (
              <a href="/pricing" style={s.upgradeBtn}>Upgrade Plan →</a>
            )}
          </div>

          <div style={s.bizInfo}>
            <div style={s.bizAvatar}>
              {business?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={s.bizName}>{business?.name}</div>
              <div style={s.bizEmail}>{business?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>Log out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <p style={s.pageSubtitle}>Manage your customers and follow-ups</p>
          </div>
          <button style={s.btnPrimary} onClick={() => setShowAddForm(!showAddForm)}>
            + Add Customer
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Total Customers</div>
            <div style={s.statValue}>{totalCustomers}</div>
            <div style={s.statSub}>{thisMonth} added this month</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Follow-ups Sent</div>
            <div style={{ ...s.statValue, color: '#00e5a0' }}>{followupsSent}</div>
            <div style={s.statSub}>of {totalCustomers} customers</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Reviews Requested</div>
            <div style={{ ...s.statValue, color: '#7c6cff' }}>{reviewsRequested}</div>
            <div style={s.statSub}>Google review requests</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Pending Follow-up</div>
            <div style={{ ...s.statValue, color: '#ffd166' }}>
              {customers.filter(c => !c.followup_sent && c.email).length}
            </div>
            <div style={s.statSub}>awaiting outreach</div>
          </div>
        </div>

        {/* Add Customer Form */}
        {showAddForm && (
          <div style={s.formCard}>
            <h2 style={s.formTitle}>Add New Customer</h2>
            <form onSubmit={handleAddCustomer} style={s.form}>
              <div style={s.formGrid}>
                <div style={s.field}>
                  <label style={s.label}>Full Name *</label>
                  <input style={s.input} value={newCustomer.name}
                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    placeholder="e.g. Sarah Johnson" required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Email Address</label>
                  <input style={s.input} type="email" value={newCustomer.email}
                    onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="sarah@example.com" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Phone Number</label>
                  <input style={s.input} value={newCustomer.phone}
                    onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="(555) 000-0000" />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Notes</label>
                  <input style={s.input} value={newCustomer.notes}
                    onChange={e => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                    placeholder="e.g. Prefers morning appointments" />
                </div>
              </div>
              <div style={s.formActions}>
                <button type="button" style={s.btnSecondary} onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" style={s.btnPrimary} disabled={adding}>
                  {adding ? 'Adding...' : 'Add Customer →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Customer Table */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h2 style={s.tableTitle}>Your Customers</h2>
            <span style={s.tableCount}>{totalCustomers} total</span>
          </div>

          {customers.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>👥</div>
              <p style={s.emptyTitle}>No customers yet</p>
              <p style={s.emptyText}>Add your first customer to get started</p>
              <button style={s.btnPrimary} onClick={() => setShowAddForm(true)}>+ Add First Customer</button>
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Customer', 'Contact', 'Added', 'Follow-up', 'Actions'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={c.id} style={{ ...s.tr, ...(i % 2 === 0 ? s.trEven : {}) }}>
                      <td style={s.td}>
                        <div style={s.custName}>{c.name}</div>
                        {c.notes && <div style={s.custNotes}>{c.notes}</div>}
                      </td>
                      <td style={s.td}>
                        {c.email && <div style={s.contactItem}>✉ {c.email}</div>}
                        {c.phone && <div style={s.contactItem}>📱 {c.phone}</div>}
                        {!c.email && !c.phone && <span style={s.noContact}>—</span>}
                      </td>
                      <td style={s.td}>
                        <div style={s.dateText}>
                          {new Date(c.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td style={s.td}>
                        {c.followup_sent
                          ? <span style={s.tagSent}>✓ Sent</span>
                          : <span style={s.tagPending}>Pending</span>}
                      </td>
                      <td style={s.td}>
                        <button
                          style={{ ...s.actionBtn, ...(c.followup_sent ? s.actionBtnDone : {}) }}
                          onClick={() => !c.followup_sent && handleSendFollowUp(c)}
                          disabled={c.followup_sent || sendingEmail === c.id || !c.email}
                          title={!c.email ? 'No email address' : ''}
                        >
                          {sendingEmail === c.id ? 'Sending...' : c.followup_sent ? '✓ Sent' : '✉ Send Follow-up'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

const s = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif" },
  loadingPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' },
  spinner: { width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00e5a0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
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
  planBadge: { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px' },
  planBadgeTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  planBadgeLabel: { color: '#8888aa', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  planBadgeName: { fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 100, border: '1px solid', textTransform: 'capitalize' },
  planBadgeLimit: { color: '#8888aa', fontSize: '0.75rem' },
  upgradeBtn: { display: 'block', marginTop: 10, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00e5a0', borderRadius: 8, padding: '7px 12px', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center' },
  bizInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  bizAvatar: { width: 36, height: 36, background: 'linear-gradient(135deg, #00e5a0, #7c6cff)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#000', flexShrink: 0 },
  bizName: { color: '#f0f0f8', fontSize: '0.85rem', fontWeight: 600 },
  bizEmail: { color: '#8888aa', fontSize: '0.72rem' },
  logoutBtn: { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.07)', color: '#8888aa', borderRadius: 10, padding: '9px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  main: { flex: 1, padding: '36px 40px', overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#f0f0f8', letterSpacing: '-0.5px' },
  pageSubtitle: { color: '#8888aa', fontSize: '0.9rem', marginTop: 4 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px' },
  statLabel: { color: '#8888aa', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 },
  statValue: { fontFamily: "'Syne', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#f0f0f8' },
  statSub: { color: '#8888aa', fontSize: '0.75rem', marginTop: 4 },
  formCard: { background: '#13131a', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 16, padding: 28, marginBottom: 24 },
  formTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#f0f0f8', marginBottom: 20 },
  form: {},
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { color: '#f0f0f8', fontSize: '0.82rem', fontWeight: 600 },
  input: { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#f0f0f8', padding: '11px 14px', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", outline: 'none', width: '100%' },
  formActions: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  btnPrimary: { background: '#00e5a0', color: '#000', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnSecondary: { background: 'transparent', color: '#8888aa', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '11px 22px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  tableCard: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' },
  tableHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  tableTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#f0f0f8' },
  tableCount: { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', color: '#8888aa', padding: '4px 12px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600 },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#8888aa', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '12px 24px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  tr: { transition: 'background 0.15s' },
  trEven: { background: 'rgba(255,255,255,0.015)' },
  td: { padding: '14px 24px', fontSize: '0.88rem', verticalAlign: 'middle' },
  custName: { color: '#f0f0f8', fontWeight: 600 },
  custNotes: { color: '#8888aa', fontSize: '0.78rem', marginTop: 3 },
  contactItem: { color: '#8888aa', fontSize: '0.82rem', marginBottom: 2 },
  noContact: { color: '#8888aa' },
  dateText: { color: '#8888aa', fontSize: '0.82rem' },
  tagSent: { background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00e5a0', padding: '3px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 },
  tagPending: { background: 'rgba(255,209,102,0.1)', border: '1px solid rgba(255,209,102,0.2)', color: '#ffd166', padding: '3px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 },
  actionBtn: { background: 'rgba(0,229,160,0.08)', border: '1px solid rgba(0,229,160,0.2)', color: '#00e5a0', padding: '7px 14px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' },
  actionBtnDone: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#8888aa', cursor: 'default' },
  emptyState: { textAlign: 'center', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyIcon: { fontSize: '3rem', marginBottom: 8 },
  emptyTitle: { color: '#f0f0f8', fontWeight: 700, fontSize: '1.1rem', fontFamily: "'Syne', sans-serif" },
  emptyText: { color: '#8888aa', fontSize: '0.88rem', maxWidth: 320 },
}