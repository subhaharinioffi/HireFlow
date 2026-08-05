import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsForm from './SettingsForm'
import { Settings, ShieldCheck, Mail, ShieldAlert, Globe } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const smtpHost = process.env.SMTP_HOST || 'Not Configured'
  const smtpPort = process.env.SMTP_PORT || 'Not Configured'
  const smtpUser = process.env.SMTP_USER || 'Not Configured'
  const fromEmail = process.env.SMTP_FROM || 'Not Configured'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const companyName = process.env.COMPANY_NAME || 'Not Configured'
  const companyEmail = process.env.COMPANY_EMAIL || 'Not Configured'
  const companyAddress = process.env.COMPANY_ADDRESS || 'Not Configured'

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-title-section">
        <div>
          <h1 className="page-title">Settings & Configuration</h1>
          <p className="page-subtitle">Configure your profile details and inspect platform environment settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="d-md-grid-cols-2">
        {/* Left column: Profile Settings */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <Settings size={18} style={{ color: 'var(--color-accent)' }} />
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>User Profile Settings</h2>
          </div>
          
          <SettingsForm initialName={profile?.full_name || ''} email={user.email || ''} role={profile?.role || 'HR Executive'} />
        </div>

        {/* Right column: SMTP Configuration Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* SMTP Credentials reference */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <Mail size={18} style={{ color: 'var(--color-success)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: '600' }}>SMTP NodeMailer Reference</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>SMTP Host:</span>
                <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{smtpHost}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>SMTP Port:</span>
                <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{smtpPort}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Username:</span>
                <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{smtpUser}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Sender (From):</span>
                <span style={{ fontWeight: '500', fontFamily: 'monospace' }}>{fromEmail}</span>
              </div>
              
              <div style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', padding: '12px', borderRadius: 'var(--border-radius-sm)', marginTop: '8px', display: 'flex', gap: '8px' }}>
                <ShieldAlert size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  SMTP authentication credentials are encrypted and stored inside server-side environment variables. They are never exposed to browser scripts.
                </span>
              </div>
            </div>
          </div>

          {/* Company Details reference */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <Globe size={18} style={{ color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '15px', fontWeight: '600' }}>Corporate Metadata</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Company Name:</span>
                <span style={{ fontWeight: '500' }}>{companyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Operations Email:</span>
                <span style={{ fontWeight: '500' }}>{companyEmail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>HQ Address:</span>
                <span style={{ fontWeight: '500', background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>{companyAddress}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Application URL:</span>
                <span style={{ fontWeight: '500', fontFamily: 'monospace', color: 'var(--color-accent)' }}>{appUrl}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) {
          .d-md-grid-cols-2 {
            grid-template-columns: 1.2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
