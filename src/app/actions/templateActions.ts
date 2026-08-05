'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Required variables mapping
const ALLOWED_VARIABLES = [
  '{{candidate_name}}',
  '{{candidate_email}}',
  '{{designation}}',
  '{{joining_date}}',
  '{{salary}}',
  '{{company_name}}',
  '{{issue_date}}',
  '{{certificate_id}}'
]

export async function upsertTemplate(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  // Admin permission check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Admin') {
    return { error: 'Only administrators can create or edit document templates.' }
  }

  const name = formData.get('name') as string
  const documentType = formData.get('documentType') as string
  const content = formData.get('content') as string
  const logoUrl = formData.get('logoUrl') as string
  const signatureUrl = formData.get('signatureUrl') as string

  if (!name || !documentType || !content) {
    return { error: 'Template name, document type, and body content are required.' }
  }

  // Validate that variables in content are valid
  const variableMatches = content.match(/\{\{[^{}]+\}\}/g) || []
  const invalidVars = variableMatches.filter(v => !ALLOWED_VARIABLES.includes(v))

  if (invalidVars.length > 0) {
    return { error: `Invalid variables detected: ${invalidVars.join(', ')}. Please use only allowed placeholders.` }
  }

  // Upsert the template (document_type has UNIQUE constraint)
  // Get existing template if exists
  const { data: existing } = await supabase
    .from('templates')
    .select('id')
    .eq('document_type', documentType)
    .single()

  let resultError = null
  let templateId = ''

  if (existing) {
    const { data, error } = await supabase
      .from('templates')
      .update({
        name,
        content,
        logo_url: logoUrl || null,
        signature_url: signatureUrl || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
    
    resultError = error
    templateId = existing.id
  } else {
    const { data, error } = await supabase
      .from('templates')
      .insert({
        name,
        document_type: documentType,
        content,
        logo_url: logoUrl || null,
        signature_url: signatureUrl || null,
        is_active: true,
        created_by: user.id
      })
      .select()
      .single()
    
    resultError = error
    if (data) templateId = data.id
  }

  if (resultError) {
    return { error: resultError.message }
  }

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    document_id: null,
    action: existing ? 'Template Updated' : 'Template Created',
    entity_type: 'templates',
    details: `${existing ? 'Updated' : 'Created'} template '${name}' for document type '${documentType}'.`
  })

  revalidatePath('/dashboard/templates')
  return { success: true }
}
