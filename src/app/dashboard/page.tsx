import { createClient } from '@/lib/supabase/server'
import QuickActions from './QuickActions'
import { 
  Users, 
  Clock, 
  Send, 
  AlertTriangle, 
  ArrowRight,
  Mail,
  CheckCircle,
  XCircle,
  History
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch current user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Calculate real metrics
  const { count: totalCandidates } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })

  const { count: pendingApproval } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('approval_status', 'Pending Approval')

  const { count: documentsSent } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('send_status', 'Sent')

  const { count: emailFailures } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('send_status', 'Failed')

  // Fetch recent audit logs
  const { data: recentLogs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (full_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch email log summary counts
  const { count: sentEmails } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Sent')

  const { count: failedEmails } = await supabase
    .from('email_logs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Failed')

  const metrics = [
    { name: 'Total Candidates', value: totalCandidates || 0, icon: Users, color: 'var(--color-accent)' },
    { name: 'Pending Approval', value: pendingApproval || 0, icon: Clock, color: 'var(--color-warning)' },
    { name: 'Documents Sent', value: documentsSent || 0, icon: Send, color: 'var(--color-success)' },
    { name: 'Email Failures', value: emailFailures || 0, icon: AlertTriangle, color: 'var(--color-error)' }
  ]

  return (
    <div>
      <div className="page-title-section">
        <div>
          <h1 className="page-title">HR Operations Dashboard</h1>
          <p className="page-subtitle">Unified controls for documents, verification, and email automations</p>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)', padding: '8px 12px' }}>
          Current Role: <strong style={{ color: 'var(--color-accent)' }}>{profile?.role}</strong>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div className="card" key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--border-radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
                <Icon size={22} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{m.name}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '2px' }}>{m.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions Panel */}
      <QuickActions userRole={profile?.role || 'HR Executive'} />

      {/* Activity grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="d-lg-grid-cols-3-1">
        {/* Recent Activity */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} style={{ color: 'var(--color-accent)' }} />
              Recent System Activity
            </h2>
            <Link href="/dashboard/audit" style={{ fontSize: '12px', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
            {!recentLogs || recentLogs.length === 0 ? (
              <div style={{ padding: '40px 0', textalign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No platform activity logged yet.
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '12px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)', marginTop: '5px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{log.action}</span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{log.details}</p>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      By: {log.profiles?.full_name || 'System Auto'} ({log.profiles?.role || 'Service'})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Email Status Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} style={{ color: 'var(--color-accent)' }} />
              SMTP Delivery Status
            </h2>
            <Link href="/dashboard/emails" style={{ fontSize: '12px', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View logs <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifycontent: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '12px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Sent Successfully</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-success)' }}>{sentEmails || 0}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '12px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 'var(--border-radius)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <XCircle size={18} style={{ color: 'var(--color-error)' }} />
                <span style={{ fontSize: '13px', fontWeight: '500' }}>Dispatch Failures</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-error)' }}>{failedEmails || 0}</span>
            </div>
            
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
              💡 <strong>L&D and HR Tip:</strong> Ensure that candidate email configurations are validated before bulk distribution to minimize SMTP bounce rates.
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Three-to-one grid ratio */
        @media (min-width: 1024px) {
          .d-lg-grid-cols-3-1 {
            grid-template-columns: 2.2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
