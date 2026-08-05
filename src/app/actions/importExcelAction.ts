'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function importCandidates(candidatesList: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  if (!candidatesList || candidatesList.length === 0) {
    return { error: 'No candidate data was provided.' }
  }

  // Format list for database insertion
  const records = candidatesList.map(c => ({
    candidate_id: c.candidate_id,
    full_name: c.full_name,
    email: c.email,
    role_course: c.role_course,
    joining_date: c.joining_date,
    salary: c.salary,
    document_type: c.document_type,
    approval_status: c.approval_status || 'Draft',
    send_status: c.send_status || 'Not Ready',
    created_by: user.id
  }))

  const { data, error } = await supabase
    .from('candidates')
    .insert(records)
    .select()

  if (error) {
    return { error: error.message }
  }

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'Bulk Excel Import',
    entity_type: 'candidates',
    details: `Imported ${records.length} candidates from Excel sheet.`
  })

  revalidatePath('/dashboard/candidates')
  return { success: true, count: records.length }
}
