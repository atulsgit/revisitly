'use client'

import { useState, useEffect } from 'react'

export default function QRCodeCard({ business, appUrl }) {
  const [copied, setCopied] = useState(false)
  const checkinUrl = `${appUrl}/checkin/${business?.slug}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkinUrl)}&bgcolor=13131a&color=00e5a0&qzone=2`

  const handleCopy = () => {
    navigator.clipboard.writeText(checkinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!business?.slug) return null

  return (
    <div style={s.card}>
      <div style={s.header}>
        <div>
          <h3 style={s.title}>📱 Customer Check-in QR Code</h3>
          <p style={s.subtitle}>Print this and place it on your counter. Customers scan to join your VIP list.</p>
        </div>
      </div>

      <div style={s.body}>
        {/* QR Code */}
        <div style={s.qrWrap}>
          <img src={qrUrl} alt="Check-in QR Code" style={s.qr} />
          <p style={s.qrLabel}>Scan to Check In</p>
          <p style={s.qrBiz}>{business.name}</p>
        </div>

        {/* URL + Actions */}
        <div style={s.actions}>
          <div style={s.urlBox}>
            <span style={s.urlLabel}>Your check-in link:</span>
            <span style={s.url}>{checkinUrl}</span>
          </div>

          <div style={s.btns}>
            <button style={s.btnCopy} onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>
            <a
              href={qrUrl}
              download="checkin-qr.png"
              style={s.btnDownload}
            >
              ⬇ Download QR
            </a>
            <a
              href={checkinUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={s.btnPreview}
            >
              👁 Preview Page
            </a>
          </div>

          <div style={s.tip}>
            💡 <strong>Tip:</strong> Print the QR code and laminate it. Place it at your reception desk, payment counter, or waiting area.
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  card: { background: '#13131a', border: '1px solid rgba(0,229,160,0.2)', borderRadius: 16, padding: '24px 28px', marginBottom: 24 },
  header: { marginBottom: 20 },
  title: { fontFamily: "'Syne', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#f0f0f8', marginBottom: 6 },
  subtitle: { color: '#8888aa', fontSize: '0.85rem', lineHeight: 1.6 },
  body: { display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' },
  qrWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 20, flexShrink: 0 },
  qr: { width: 160, height: 160, borderRadius: 8 },
  qrLabel: { color: '#8888aa', fontSize: '0.78rem', marginTop: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  qrBiz: { color: '#f0f0f8', fontSize: '0.85rem', fontWeight: 700, marginTop: 4 },
  actions: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16 },
  urlBox: { background: '#1c1c28', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' },
  urlLabel: { color: '#8888aa', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 },
  url: { color: '#00e5a0', fontSize: '0.85rem', wordBreak: 'break-all' },
  btns: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  btnCopy: { background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.2)', color: '#00e5a0', padding: '9px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  btnDownload: { background: 'rgba(124,108,255,0.1)', border: '1px solid rgba(124,108,255,0.2)', color: '#a99fff', padding: '9px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' },
  btnPreview: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f8', padding: '9px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' },
  tip: { background: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.15)', color: '#8888aa', borderRadius: 10, padding: '12px 16px', fontSize: '0.82rem', lineHeight: 1.6 },
}