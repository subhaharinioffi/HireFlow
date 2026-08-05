import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuditLogsTable from './AuditLogsTable'

export default async function AuditLogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all audit logs joined with user profiles
  const { data: logs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:user_id (full_name, email, role)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="page-title-section">
        <div>
          <h1 className="page-title">Platform Audit Logs</h1>
          <p className="page-subtitle">Historical registry of administrator actions, document generations, and email dispatches</p>
        </div>
      </div>

      <AuditLogsTable initialLogs={logs || []} />
    </div>
  )
}
