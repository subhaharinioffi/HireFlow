import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, ShieldAlert, Award, Calendar, Building, Hash, GraduationCap } from 'lucide-react'
import Link from 'next/link'

interface VerifyPageProps {
  params: Promise<{
    certificateId: string
  }>
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { certificateId } = await params
  const supabase = createClient()
  const companyName = process.env.COMPANY_NAME || 'HireFlow Corp'

  // Call security definer function to bypass RLS securely
  const { data, error } = await supabase.rpc('verify_certificate', { 
    cert_id: certificateId 
  })

  const record = data && data.length > 0 ? data[0] : null
  const isValid = !!record

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(circle at center, #111827 0%, #0B0F19 100%)' }}>
      
      {/* Brand logo */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
          Hire<span style={{ color: 'var(--color-accent)' }}>Flow</span>
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Secure Document Verification
        </p>
      </div>

      {/* Main card */}
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '36px', background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {isValid ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'inline-flex', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldCheck size={32} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>Document Verified</h2>
              <span className="badge badge-approved" style={{ fontSize: '11px', padding: '4px 12px' }}>
                Authentic Credential
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <Award size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Document Type</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{record.document_type}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <GraduationCap size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Recipients Name</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{record.candidate_name}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Award size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Role or Course Designation</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{record.role_course}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Calendar size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Issue Date</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>
                    {new Date(record.generated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Building size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Issuing Authority</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{companyName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Hash size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Certificate ID</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'monospace', color: '#fff' }}>
                    {record.certificate_id}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: 'var(--color-error)', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldAlert size={32} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Verification Failed</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              The certificate reference <strong>{certificateId}</strong> was not found in our records or has been revoked. Please check the ID and try again.
            </p>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                If you believe this is an error, please contact the issuing authority at hr@company.com.
              </span>
            </div>
          </div>
        )}

      </div>

      <div style={{ marginTop: '24px' }}>
        <Link href="/" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Back to HireFlow Landing
        </Link>
      </div>
    </div>
  )
}
