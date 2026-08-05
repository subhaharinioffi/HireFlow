'use server'

import { createClient } from '@/lib/supabase/server'
import { generatePdfBuffer } from '@/lib/pdf/generatePdf'
import { revalidatePath } from 'next/cache'

export async function generatePdfForCandidate(candidateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  // 1. Fetch candidate details
  const { data: candidate, error: candError } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (candError || !candidate) {
    return { error: 'Candidate not found.' }
  }

  if (candidate.approval_status !== 'Approved') {
    return { error: 'Documents can only be generated for Approved candidates.' }
  }

  // Check if document already exists to avoid duplicate generation (unless forced)
  const { data: existingDoc } = await supabase
    .from('documents')
    .select('id')
    .eq('candidate_id', candidateId)
    .single()

  if (existingDoc) {
    return { success: true, message: 'Document already exists.' }
  }

  // 2. Fetch active template
  const { data: template, error: tempError } = await supabase
    .from('templates')
    .select('*')
    .eq('document_type', candidate.document_type)
    .eq('is_active', true)
    .single()

  if (tempError || !template) {
    return { error: `No active template found for document type: ${candidate.document_type}. Please configure a template first.` }
  }

  // 3. Compile variables
  const timestamp = Date.now().toString().slice(-4)
  const documentReference = `REF-${candidate.candidate_id}-${timestamp}`
  
  let certificateId = undefined
  let verificationUrl = undefined
  const isCertificate = candidate.document_type.includes('Certificate')

  if (isCertificate) {
    certificateId = `CERT-${candidate.candidate_id}-${timestamp}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    verificationUrl = `${appUrl}/verify/${certificateId}`
  }

  const companyName = process.env.COMPANY_NAME || 'HireFlow Corp'

  const pdfData = {
    document_type: candidate.document_type,
    document_reference: documentReference,
    issue_date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    candidate_name: candidate.full_name,
    candidate_email: candidate.email,
    designation: candidate.role_course,
    joining_date: new Date(candidate.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    salary: candidate.salary ? `$${candidate.salary.toLocaleString()}` : '$0',
    company_name: companyName,
    certificate_id: certificateId,
    verification_url: verificationUrl
  }

  // 4. Generate Buffer
  let buffer: Buffer
  try {
    buffer = await generatePdfBuffer(
      template.content, 
      pdfData, 
      template.logo_url || undefined, 
      template.signature_url || undefined
    )
  } catch (err: any) {
    return { error: `Failed to compile PDF stream: ${err.message}` }
  }

  // 5. Upload to Private Storage
  const storagePath = `documents/${candidate.id}/${documentReference}.pdf`
  const { data: storageData, error: storageError } = await supabase.storage
    .from('hireflow-documents')
    .upload(storagePath, buffer, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (storageError) {
    return { error: `Failed to upload PDF: ${storageError.message}` }
  }

  // 6. Save document meta
  const { data: docRecord, error: docError } = await supabase
    .from('documents')
    .insert({
      candidate_id: candidateId,
      document_type: candidate.document_type,
      document_reference: documentReference,
      certificate_id: certificateId || null,
      pdf_url: storagePath,
      generated_by: user.id
    })
    .select()
    .single()

  if (docError) {
    return { error: `Failed to save document record: ${docError.message}` }
  }

  // 7. Update candidate send status to Ready
  await supabase
    .from('candidates')
    .update({
      send_status: 'Ready',
      updated_at: new Date().toISOString()
    })
    .eq('id', candidateId)

  // 8. Audit logging
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    candidate_id: candidateId,
    document_id: docRecord.id,
    action: 'PDF Generated',
    entity_type: 'documents',
    details: `Generated PDF for candidate ${candidate.full_name}. Ref: ${documentReference}`
  })

  revalidatePath('/dashboard/candidates')
  revalidatePath('/dashboard/documents')
  return { success: true }
}

export async function getSignedPdfUrl(documentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  // Fetch document record
  const { data: doc, error } = await supabase
    .from('documents')
    .select('pdf_url')
    .eq('id', documentId)
    .single()

  if (error || !doc) {
    return { error: 'Document not found.' }
  }

  // Generate signed URL (expires in 60 minutes)
  const { data, error: signedError } = await supabase.storage
    .from('hireflow-documents')
    .createSignedUrl(doc.pdf_url, 3600)

  if (signedError) {
    return { error: signedError.message }
  }

  return { url: data.signedUrl }
}

export async function regeneratePdfForCandidate(candidateId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  // Fetch and delete existing document record
  const { data: existing } = await supabase
    .from('documents')
    .select('*')
    .eq('candidate_id', candidateId)
    .single()

  if (existing) {
    // Delete file from storage
    await supabase.storage.from('hireflow-documents').remove([existing.pdf_url])
    // Delete database row
    await supabase.from('documents').delete().eq('id', existing.id)
  }

  // Perform standard generation
  const res = await generatePdfForCandidate(candidateId)
  
  if (res.success) {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      candidate_id: candidateId,
      action: 'PDF Regenerated',
      entity_type: 'documents',
      details: `Regenerated PDF document for candidate record. Deleted old version.`
    })
  }

  return res;
}
