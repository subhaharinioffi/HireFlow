import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditCandidateForm from './EditCandidateForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface EditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'HR Executive'

  // Fetch candidate
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (!candidate) {
    redirect('/dashboard/candidates')
  }

  // Role authorization check
  if (userRole === 'HR Executive' && candidate.approval_status !== 'Draft' && candidate.approval_status !== 'Pending Approval') {
    redirect('/dashboard/candidates')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/candidates" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          <ArrowLeft size={14} /> Back to Directory
        </Link>
        <h1 className="page-title">Edit Candidate</h1>
        <p className="page-subtitle">Update record details for candidate <strong>{candidate.full_name}</strong></p>
      </div>

      <div className="card">
        <EditCandidateForm candidate={candidate} />
      </div>
    </div>
  )
}
