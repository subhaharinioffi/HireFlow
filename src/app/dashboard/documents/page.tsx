import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DocumentsTable from './DocumentsTable'

export default async function DocumentsPage() {
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

  // Fetch documents joined with candidates
  const { data: documents } = await supabase
    .from('documents')
    .select(`
      *,
      candidates:candidate_id (full_name, candidate_id)
    `)
    .order('generated_at', { ascending: false })

  return (
    <div>
      <div className="page-title-section">
        <div>
          <h1 className="page-title">Issued Documents</h1>
          <p className="page-subtitle">Inspect, download, and review security credentials of generated offer letters and certificates</p>
        </div>
      </div>

      <DocumentsTable 
        initialDocuments={documents || []} 
        userRole={profile?.role || 'HR Executive'} 
      />
    </div>
  )
}
