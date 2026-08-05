import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CandidatesTable from './CandidatesTable'
import { Plus } from 'lucide-react'

export default async function CandidatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Fetch candidates
  const { data: candidates } = await supabase
    .from('candidates')
    .select(`
      *,
      profiles:created_by (full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="page-title-section">
        <div>
          <h1 className="page-title">Candidate Directory</h1>
          <p className="page-subtitle">Manage candidate records, document statuses, and dispatch logs</p>
        </div>
        <Link href="/dashboard/candidates/new" className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={16} />
          Add Candidate
        </Link>
      </div>

      <CandidatesTable 
        initialCandidates={candidates || []} 
        userRole={profile?.role || 'HR Executive'} 
        userId={user.id}
      />
    </div>
  )
}
