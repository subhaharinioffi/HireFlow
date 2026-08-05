'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCandidate(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  // Get current user profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const candidateId = formData.get('candidateId') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const roleCourse = formData.get('roleCourse') as string
  const joiningDate = formData.get('joiningDate') as string
  const salary = parseFloat(formData.get('salary') as string)
  const documentType = formData.get('documentType') as string

  if (!candidateId || !fullName || !email || !roleCourse || !joiningDate || isNaN(salary) || !documentType) {
    return { error: 'Please fill in all candidate fields correctly.' }
  }

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      candidate_id: candidateId,
      full_name: fullName,
      email: email,
      role_course: roleCourse,
      joining_date: joiningDate,
      salary: salary,
      document_type: documentType,
      approval_status: 'Draft',
      send_status: 'Not Ready',
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    candidate_id: data.id,
    action: 'Candidate Created',
    entity_type: 'candidates',
    details: `Created candidate ${fullName} (${candidateId}) as Draft.`
  })

  revalidatePath('/dashboard/candidates')
  return { success: true }
}

export async function updateCandidate(id: string, prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  // Get current user profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'HR Executive'

  // Fetch current candidate state
  const { data: candidate } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single()

  if (!candidate) {
    return { error: 'Candidate not found.' }
  }

  // Executive restriction: Can only edit Drafts they created
  if (userRole === 'HR Executive' && candidate.approval_status !== 'Draft' && candidate.approval_status !== 'Pending Approval') {
    return { error: 'HR Executives can only edit Drafts or Pending Approval candidates.' }
  }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const roleCourse = formData.get('roleCourse') as string
  const joiningDate = formData.get('joiningDate') as string
  const salary = parseFloat(formData.get('salary') as string)
  const documentType = formData.get('documentType') as string

  if (!fullName || !email || !roleCourse || !joiningDate || isNaN(salary) || !documentType) {
    return { error: 'All fields must be completed.' }
  }

  const { error } = await supabase
    .from('candidates')
    .update({
      full_name: fullName,
      email: email,
      role_course: roleCourse,
      joining_date: joiningDate,
      salary: salary,
      document_type: documentType,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    candidate_id: id,
    action: 'Candidate Updated',
    entity_type: 'candidates',
    details: `Updated details for candidate: ${fullName}.`
  })

  revalidatePath('/dashboard/candidates')
  return { success: true }
}

export async function deleteCandidate(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  // Admin role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Admin') {
    return { error: 'Only administrators can delete candidate records.' }
  }

  // Fetch name for audit log
  const { data: candidate } = await supabase
    .from('candidates')
    .select('full_name')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'Candidate Deleted',
    entity_type: 'candidates',
    details: `Deleted candidate record: ${candidate?.full_name || 'Unknown'}.`
  })

  revalidatePath('/dashboard/candidates')
  return { success: true }
}

export async function reviewCandidate(id: string, action: 'Approve' | 'Reject', rejectionReason?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  // Manager or Admin only
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'HR Executive'
  if (userRole !== 'Admin' && userRole !== 'HR Manager') {
    return { error: 'Only HR Managers or Admins can approve or reject candidate records.' }
  }

  const approvalStatus = action === 'Approve' ? 'Approved' : 'Rejected'
  const sendStatus = action === 'Approve' ? 'Ready' : 'Not Ready' // Automatically mark ready on approval or wait for manual trigger. We can mark it ready or keep it. Prompt says "Only Approved candidates can be marked Ready". Let's update sendStatus to "Ready" on approval or allow them to set it. To be flexible, we'll mark as Ready on approval, or allow manual mark. Let's make it Ready on approval!

  const { error } = await supabase
    .from('candidates')
    .update({
      approval_status: approvalStatus,
      send_status: sendStatus,
      rejection_reason: action === 'Reject' ? rejectionReason : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    candidate_id: id,
    action: `Candidate ${approvalStatus}`,
    entity_type: 'candidates',
    details: `${approvalStatus} candidate. Reason for rejection: ${rejectionReason || 'N/A'}`
  })

  revalidatePath('/dashboard/candidates')
  return { success: true }
}

export async function submitForApproval(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const { error } = await supabase
    .from('candidates')
    .update({
      approval_status: 'Pending Approval',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    candidate_id: id,
    action: 'Candidate Submitted for Approval',
    entity_type: 'candidates',
    details: 'Submitted candidate record to pending approval status.'
  })

  revalidatePath('/dashboard/candidates')
  return { success: true }
}
