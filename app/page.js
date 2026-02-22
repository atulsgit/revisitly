'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const observerRef = useRef(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = '1'
              entry.target.style.transform = 'translateY(0)'
            }, i * 80)
          }
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px)'
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease'
      observerRef.current.observe(el)
    })
    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div style={s.page}>
      {/* Background */}
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.grid} />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <a href="/" style={s.logo}>revisit<span style={s.logoAccent}>ly</span></a>
          <div style={s.navLinks}>
            <a href="#how" style={s.navLink}>How it works</a>
            <a href="#features" style={s.navLink}>Features</a>
            <a href="#pricing" style={s.navLink}>Pricing</a>
          </div>
          <div style={s.navCtas}>
            <Link href="/auth" style={s.btnNavGhost}>Log in</Link>
            <Link href="/auth" style={s.btnNavPrimary}>Start Free Trial →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero}>
        <div style={s.heroBadge}>
          <span style={s.badgeDot} />
          Now in Early Access — 14 Days Free
        </div>
        <h1 style={s.heroTitle}>
          More Reviews.<br />
          More Return Visits.<br />
          <span style={s.heroHighlight}>Zero Effort.</span>
        </h1>
        <p style={s.heroSub}>
          Revisitly automatically follows up with your customers after every visit —
          collecting 5-star Google reviews and bringing them back before they forget you.
          Built for salons, clinics, and trades.
        </p>
        <div style={s.heroCtas}>
          <Link href="/auth" style={s.btnPrimary}>Start Free — No Card Needed →</Link>
          <a href="#how" style={s.btnSecondary}>See How It Works</a>
        </div>
        <p style={s.heroNote}>
          ⚡ Setup takes under <strong style={{ color: '#00e5a0' }}>5 minutes</strong> · No tech skills needed
        </p>

        {/* Dashboard Preview */}
        <div style={s.previewWrap}>
          <div style={s.previewCard}>
            <div style={s.previewBar}>
              <div style={{ ...s.dot, background: '#ff5f57' }} />
              <div style={{ ...s.dot, background: '#febc2e' }} />
              <div style={{ ...s.dot, background: '#28c840' }} />
              <span style={s.previewUrl}>revisitly.app/dashboard</span>
            </div>
            <div style={s.previewContent}>
              <div style={s.previewStats}>
                {[
                  { label: 'Reviews This Month', value: '47', change: '↑ 23 vs last month', color: '#00e5a0' },
                  { label: 'Follow-ups Sent', value: '128', change: '94% open rate', color: '#7c6cff' },
                  { label: 'Repeat Bookings', value: '31', change: 'Est. $2,480 recovered', color: '#ffd166' },
                ].map(stat => (
                  <div key={stat.label} style={s.previewStat}>
                    <div style={s.previewStatLabel}>{stat.label}</div>
                    <div style={{ ...s.previewStatValue, color: stat.color }}>{stat.value}</div>
                    <div style={s.previewStatChange}>{stat.change}</div>
                  </div>
                ))}
              </div>
              <div style={s.previewList}>
                {[
                  { name: 'Sarah M.', biz: 'Glow Hair Studio', tag: '⭐ Review Left', tagColor: '#00e5a0', tagBg: 'rgba(0,229,160,0.1)' },
                  { name: 'James R.', biz: 'ProFix Plumbing', tag: '✉ Follow-up Sent', tagColor: '#7c6cff', tagBg: 'rgba(124,108,255,0.1)' },
                  { name: 'Linda K.', biz: 'ClearSkin Clinic', tag: '⏳ 30-Day Reminder', tagColor: '#ffd166', tagBg: 'rgba(255,209,102,0.1)' },
                ].map(item => (
                  <div key={item.name} style={s.previewRow}>
                    <div>
                      <div style={s.previewName}>{item.name}</div>
                      <div style={s.previewBiz}>{item.biz}</div>
                    </div>
                    <span style={{ ...s.previewTag, color: item.tagColor, background: item.tagBg, border: `1px solid ${item.tagColor}30` }}>
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT FOR */}
      <section style={s.builtFor} className="reveal">
        <p style={s.builtForLabel}>Built for local businesses like yours</p>
        <div style={s.bizTypes}>
          {[
            { icon: '💇', label: 'Hair & Beauty Salons' },
            { icon: '🔧', label: 'Plumbers & Electricians' },
            { icon: '🏥', label: 'Clinics & Physios' },
            { icon: '🛠', label: 'Contractors & Trades' },
            { icon: '💆', label: 'Spas & Wellness' },
          ].map(b => (
            <div key={b.label} style={s.bizType}>
              <span>{b.icon}</span> {b.label}
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section style={s.problem} id="how">
        <div style={s.problemInner}>
          <div style={s.problemLeft}>
            <p style={s.sectionLabel} className="reveal">The Problem</p>
            <h2 style={s.sectionTitle} className="reveal">
              Happy customers forget to leave reviews.<br />
              And they don't come back.
            </h2>
            <p style={s.problemText} className="reveal">
              You do great work. Your customers leave happy. But life gets busy —
              they forget to leave that Google review, and they forget to rebook.
              That's lost revenue and lost reputation, every single day.
            </p>
            <p style={s.problemText} className="reveal">
              Chasing customers for reviews feels awkward. Manually following up takes
              time you don't have. So nothing happens — and your competitors with
              more reviews get chosen instead.
            </p>
          </div>
          <div style={s.problemRight}>
            {[
              { stat: '72%', text: 'of customers would leave a review if asked — but only 12% are ever asked' },
              { stat: '5x', text: 'cheaper to retain an existing customer than acquire a new one' },
              { stat: '88%', text: 'of consumers trust online reviews as much as personal recommendations' },
            ].map(item => (
              <div key={item.stat} style={s.statBlock} className="reveal">
                <div style={s.statBig}>{item.stat}</div>
                <div style={s.statText}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={s.how}>
        <p style={s.sectionLabel} className="reveal">How It Works</p>
        <h2 style={{ ...s.sectionTitle, textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }} className="reveal">
          Three steps to more reviews and repeat customers
        </h2>
        <div style={s.steps}>
          {[
            { num: '01', icon: '➕', title: 'Add a Customer', desc: 'After a job or appointment, enter the customer\'s name and email or phone. Takes 10 seconds from your dashboard.' },
            { num: '02', icon: '✉️', title: 'We Follow Up Automatically', desc: 'A friendly thank-you message goes out with a direct link to leave a Google review. No chasing, no awkward asks.' },
            { num: '03', icon: '🔄', title: 'Bring Them Back', desc: 'After 30 or 60 days, we automatically send a re-engagement offer to bring customers back before they forget you.' },
          ].map(step => (
            <div key={step.num} style={s.stepCard} className="reveal">
              <div style={s.stepNum}>{step.num}</div>
              <div style={s.stepIcon}>{step.icon}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={s.features} id="features">
        <p style={s.sectionLabel} className="reveal">Features</p>
        <h2 style={{ ...s.sectionTitle, textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }} className="reveal">
          Everything you need. Nothing you don't.
        </h2>
        <div style={s.featuresGrid}>
          {[
            { icon: '⭐', title: 'Automated Review Requests', desc: 'Send a review link to every customer automatically. Watch your Google rating climb without any manual effort.' },
            { icon: '🔁', title: 'Repeat Customer Campaigns', desc: 'Smart follow-up sequences re-engage past customers at exactly the right time with personalised offers.' },
            { icon: '📊', title: 'Simple Dashboard', desc: 'See every customer, every follow-up, and every review in one clean place. No spreadsheets. No complexity.' },
            { icon: '📱', title: 'SMS & Email', desc: 'Reach customers where they actually read — SMS open rates are over 90% vs 20% for email.' },
            { icon: '⚡', title: '5-Minute Setup', desc: 'No tech knowledge needed. If you can use a smartphone, you can use Revisitly.' },
            { icon: '🔒', title: 'GDPR & CAN-SPAM Ready', desc: 'All messages include proper opt-out links. Your business stays compliant with zero extra work.' },
          ].map(f => (
            <div key={f.title} style={s.featureCard} className="reveal">
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={s.testimonials}>
        <p style={s.sectionLabel} className="reveal">Early Feedback</p>
        <h2 style={{ ...s.sectionTitle, textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }} className="reveal">
          Local businesses are already loving it
        </h2>
        <div style={s.testiGrid}>
          {[
            { initials: 'MR', color: '#00e5a0', textColor: '#000', name: 'Maria R.', role: 'Owner, Luxe Hair Studio', text: 'We went from 12 Google reviews to 58 in one month. Customers were always happy to leave one — we just never had a good way to ask. This does it perfectly.' },
            { initials: 'DK', color: '#7c6cff', textColor: '#fff', name: 'Dave K.', role: 'Owner, DK Plumbing Services', text: 'As a plumber I never had time to chase reviews or follow ups. Set this up in 10 minutes and it just runs. Already got 3 callbacks from customers I\'d forgotten about.' },
            { initials: 'SP', color: '#ffd166', textColor: '#000', name: 'Sarah P.', role: 'Manager, ClearSkin Clinic', text: 'Our clinic was relying on word of mouth. Patients get a lovely follow-up message and it feels very professional without us doing anything.' },
          ].map(t => (
            <div key={t.name} style={s.testiCard} className="reveal">
              <div style={s.stars}>★★★★★</div>
              <p style={s.testiText}>"{t.text}"</p>
              <div style={s.testiAuthor}>
                <div style={{ ...s.avatar, background: t.color, color: t.textColor }}>{t.initials}</div>
                <div>
                  <div style={s.testiName}>{t.name}</div>
                  <div style={s.testiRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={s.pricingSection} id="pricing">
        <p style={s.sectionLabel} className="reveal">Pricing</p>
        <h2 style={{ ...s.sectionTitle, textAlign: 'center', maxWidth: 600, margin: '0 auto 16px' }} className="reveal">
          Simple pricing. Cancel anytime.
        </h2>
        <p style={{ ...s.heroSub, textAlign: 'center', marginBottom: 52 }} className="reveal">
          🎉 Launch special — 50% off your first 3 months
        </p>
        <div style={s.pricingGrid}>
          {[
            { name: 'Starter', price: 29, launch: 14.50, featured: false, features: ['50 customers/month', 'Email follow-ups', 'Review requests', 'Basic dashboard', 'Email support'] },
            { name: 'Growth', price: 49, launch: 24.50, featured: true, features: ['200 customers/month', 'Email + SMS', '30 & 60-day re-engagement', 'Full analytics', 'Custom templates', 'Priority support'] },
            { name: 'Pro', price: 79, launch: 39.50, featured: false, features: ['Unlimited customers', 'Email + SMS + WhatsApp', 'Multi-location', 'White-label messages', 'API access', 'Dedicated onboarding'] },
          ].map(plan => (
            <div key={plan.name} style={{ ...s.priceCard, ...(plan.featured ? s.priceCardFeatured : {}) }} className="reveal">
              {plan.featured && <div style={s.popularBadge}>Most Popular</div>}
              <div style={s.planName}>{plan.name}</div>
              <div style={s.planOriginal}>${plan.price}/mo</div>
              <div style={s.planLaunch}>
                <span style={{ fontSize: '1.2rem', verticalAlign: 'top', marginTop: 8, display: 'inline-block' }}>$</span>
                {plan.launch}
                <span style={{ fontSize: '1rem', color: '#8888aa', fontWeight: 400 }}>/mo</span>
              </div>
              <div style={s.planNote}>for 3 months, then ${plan.price}/mo</div>
              <ul style={s.planFeatures}>
                {plan.features.map(f => (
                  <li key={f} style={s.planFeature}>
                    <span style={{ color: '#00e5a0', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth" style={{ ...s.planBtn, ...(plan.featured ? s.planBtnFeatured : s.planBtnOutline) }}>
                Start Free Trial →
              </Link>
              <p style={{ textAlign: 'center', color: '#8888aa', fontSize: '0.75rem', marginTop: 10 }}>
                14-day free trial · Cancel anytime
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={s.ctaSection}>
        <div style={s.ctaBox} className="reveal">
          <h2 style={s.ctaTitle}>Start Getting More Reviews<br />This Week</h2>
          <p style={s.ctaSub}>Join local businesses already using Revisitly. 14-day free trial, no credit card required.</p>
          <Link href="/auth" style={s.btnPrimary}>Create Your Free Account →</Link>
          <p style={{ color: '#8888aa', fontSize: '0.8rem', marginTop: 16 }}>
            Free for 14 days · No credit card · Cancel anytime
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <a href="/" style={s.logo}>revisit<span style={s.logoAccent}>ly</span></a>
          <div style={s.footerLinks}>
            <a href="#" style={s.footerLink}>Privacy Policy</a>
            <a href="#" style={s.footerLink}>Terms of Service</a>
            <a href="mailto:hello@revisitly.com" style={s.footerLink}>hello@revisitly.com</a>
          </div>
          <p style={s.footerCopy}>© 2025 Revisitly. Built for local businesses.</p>
        </div>
      </footer>
    </div>
  )
}

const s = {
  page: { background: '#0a0a0f', color: '#f0f0f8', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden', position: 'relative' },
  orb1: { position: 'fixed', width: 600, height: 600, borderRadius: '50%', background: '#7c6cff', filter: 'blur(140px)', opacity: 0.12, top: -200, right: -100, pointerEvents: 'none', zIndex: 0 },
  orb2: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: '#00e5a0', filter: 'blur(140px)', opacity: 0.08, bottom: '10%', left: -150, pointerEvents: 'none', zIndex: 0 },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,15,0.8)' },
  navInner: { maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#f0f0f8', textDecoration: 'none', letterSpacing: '-0.5px' },
  logoAccent: { color: '#00e5a0' },
  navLinks: { display: 'flex', gap: 32, alignItems: 'center' },
  navLink: { color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 },
  navCtas: { display: 'flex', gap: 12, alignItems: 'center' },
  btnNavGhost: { color: '#8888aa', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, padding: '8px 16px' },
  btnNavPrimary: { background: '#00e5a0', color: '#000', padding: '9px 20px', borderRadius: 100, fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' },
  hero: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 80px', position: 'relative', zIndex: 1 },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', color: '#00e5a0', padding: '6px 16px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 28 },
  badgeDot: { width: 6, height: 6, background: '#00e5a0', borderRadius: '50%', display: 'inline-block' },
  heroTitle: { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', maxWidth: 900, marginBottom: 24 },
  heroHighlight: { background: 'linear-gradient(135deg, #00e5a0 0%, #7c6cff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroSub: { color: '#8888aa', fontSize: 'clamp(1rem, 2vw, 1.15rem)', maxWidth: 580, marginBottom: 40, lineHeight: 1.75 },
  heroCtas: { display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  btnPrimary: { background: '#00e5a0', color: '#000', padding: '16px 36px', borderRadius: 100, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 },
  btnSecondary: { background: 'transparent', color: '#f0f0f8', padding: '16px 36px', borderRadius: 100, fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center' },
  heroNote: { color: '#8888aa', fontSize: '0.85rem' },
  previewWrap: { marginTop: 70, maxWidth: 900, width: '100%' },
  previewCard: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 120px rgba(0,0,0,0.6)' },
  previewBar: { background: '#1c1c28', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' },
  dot: { width: 10, height: 10, borderRadius: '50%' },
  previewUrl: { color: '#8888aa', fontSize: '0.78rem', marginLeft: 8 },
  previewContent: { padding: 24 },
  previewStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 },
  previewStat: { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16 },
  previewStatLabel: { color: '#8888aa', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 },
  previewStatValue: { fontFamily: "'Syne', sans-serif", fontSize: '1.8rem', fontWeight: 800 },
  previewStatChange: { color: '#8888aa', fontSize: '0.72rem', marginTop: 4 },
  previewList: { display: 'flex', flexDirection: 'column', gap: 8 },
  previewRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10 },
  previewName: { color: '#f0f0f8', fontWeight: 600, fontSize: '0.88rem' },
  previewBiz: { color: '#8888aa', fontSize: '0.75rem' },
  previewTag: { padding: '4px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600 },
  builtFor: { padding: '48px 24px', textAlign: 'center', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  builtForLabel: { color: '#8888aa', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 },
  bizTypes: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  bizType: { display: 'flex', alignItems: 'center', gap: 10, color: '#8888aa', fontSize: '0.9rem', fontWeight: 500, padding: '10px 20px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 100 },
  problem: { padding: '100px 24px', position: 'relative', zIndex: 1 },
  problemInner: { maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' },
  problemLeft: {},
  problemRight: { display: 'flex', flexDirection: 'column', gap: 20 },
  sectionLabel: { color: '#00e5a0', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 },
  sectionTitle: { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 24 },
  problemText: { color: '#8888aa', fontSize: '1rem', lineHeight: 1.75, marginBottom: 16 },
  statBlock: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 },
  statBig: { fontFamily: "'Syne', sans-serif", fontSize: '3rem', fontWeight: 800, color: '#00e5a0', letterSpacing: '-2px', marginBottom: 8 },
  statText: { color: '#8888aa', fontSize: '0.9rem', lineHeight: 1.6 },
  how: { padding: '100px 24px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  stepCard: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32, position: 'relative' },
  stepNum: { fontFamily: "'Syne', sans-serif", fontSize: '3.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.04)', position: 'absolute', top: 16, right: 24, lineHeight: 1 },
  stepIcon: { width: 48, height: 48, background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 20 },
  stepTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.1rem', fontWeight: 700, marginBottom: 10 },
  stepDesc: { color: '#8888aa', fontSize: '0.92rem', lineHeight: 1.7 },
  features: { padding: '100px 24px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' },
  featureCard: { background: '#0a0a0f', padding: 36 },
  featureIcon: { fontSize: '1.8rem', marginBottom: 16 },
  featureTitle: { fontFamily: "'Syne', sans-serif", fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 },
  featureDesc: { color: '#8888aa', fontSize: '0.88rem', lineHeight: 1.65 },
  testimonials: { padding: '100px 24px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 },
  testiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 },
  testiCard: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32 },
  stars: { color: '#ffd166', fontSize: '1rem', marginBottom: 16, letterSpacing: 2 },
  testiText: { color: '#8888aa', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' },
  testiAuthor: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 },
  testiName: { fontWeight: 600, fontSize: '0.9rem' },
  testiRole: { color: '#8888aa', fontSize: '0.8rem' },
  pricingSection: { padding: '100px 24px', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 },
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  priceCard: { background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '36px 32px', position: 'relative' },
  priceCardFeatured: { background: 'linear-gradient(135deg, rgba(0,229,160,0.06) 0%, rgba(124,108,255,0.06) 100%)', border: '1px solid rgba(0,229,160,0.25)' },
  popularBadge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#00e5a0', color: '#000', padding: '4px 16px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  planName: { fontFamily: "'Syne', sans-serif", fontSize: '0.85rem', fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  planOriginal: { color: '#8888aa', fontSize: '0.9rem', textDecoration: 'line-through', marginBottom: 4 },
  planLaunch: { fontFamily: "'Syne', sans-serif", fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: 4 },
  planNote: { color: '#8888aa', fontSize: '0.78rem', marginBottom: 24 },
  planFeatures: { listStyle: 'none', marginBottom: 28 },
  planFeature: { color: '#8888aa', fontSize: '0.88rem', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8 },
  planBtn: { display: 'block', width: '100%', textAlign: 'center', padding: '14px', borderRadius: 12, fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', cursor: 'pointer' },
  planBtnFeatured: { background: '#00e5a0', color: '#000' },
  planBtnOutline: { background: 'transparent', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.12)' },
  ctaSection: { padding: '100px 24px', textAlign: 'center', position: 'relative', zIndex: 1 },
  ctaBox: { maxWidth: 680, margin: '0 auto', background: 'linear-gradient(135deg, rgba(0,229,160,0.07) 0%, rgba(124,108,255,0.07) 100%)', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 32, padding: '70px 48px' },
  ctaTitle: { fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 16, lineHeight: 1.1 },
  ctaSub: { color: '#8888aa', fontSize: '1rem', marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' },
  footer: { borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px 24px', position: 'relative', zIndex: 1 },
  footerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  footerLinks: { display: 'flex', gap: 24 },
  footerLink: { color: '#8888aa', textDecoration: 'none', fontSize: '0.85rem' },
  footerCopy: { color: '#8888aa', fontSize: '0.8rem' },
}