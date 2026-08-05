import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EmailsTable from './EmailsTable'

export default async function EmailsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Fetch email logs joined with candidates
  const { data: emailLogs } = await supabase
    .from('email_logs')
    .select(`
      *,
      candidates:candidate_id (full_name)
    `)
    .order('sent_at', { ascending: false })

  return (
    <div>
      <div className="page-title-section">
        <div>
          <h1 className="page-title">Email Transmission Logs</h1>
          <p className="page-subtitle">Inspect SMTP transmission records, response message IDs, and delivery errors</p>
        </div>
      </div>

      <EmailsTable 
        initialLogs={emailLogs || []} 
        userRole={profile?.role || 'HR Executive'} 
      />
    </div>
  )
}
