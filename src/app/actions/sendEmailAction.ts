'use server'

import { createClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'
import { revalidatePath } from 'next/cache'

// Create Nodemailer Transporter
function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are missing. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  })
}

export async function sendEmailForCandidate(candidateId: string) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return { error: 'Unauthorized.' }
  }

  // Manager or Admin only
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  const userRole = profile?.role || 'HR Executive'
  if (userRole !== 'Admin' && userRole !== 'HR Manager') {
    return { error: 'Only HR Managers or Admins can dispatch candidate emails.' }
  }

  // 1. Fetch Candidate
  const { data: candidate, error: candError } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (candError || !candidate) {
    return { error: 'Candidate not found.' }
  }

  if (candidate.approval_status !== 'Approved') {
    return { error: 'Candidate draft must be Approved before sending documents.' }
  }

  // 2. Fetch Document
  const { data: doc, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('candidate_id', candidateId)
    .single()

  if (docError || !doc) {
    return { error: 'Generated PDF document not found. Please generate the PDF first.' }
  }

  // 3. Download PDF from Storage
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from('hireflow-documents')
    .download(doc.pdf_url)

  if (downloadError || !fileBlob) {
    return { error: `Failed to retrieve PDF from storage: ${downloadError?.message || 'Empty file'}` }
  }

  const pdfBuffer = Buffer.from(await fileBlob.arrayBuffer())

  // 4. Send Email
  let messageId = ''
  let emailStatus: 'Sent' | 'Failed' = 'Sent'
  let errorMessage = null

  const companyName = process.env.COMPANY_NAME || 'HireFlow Corp'
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'hr@hireflow.com'

  try {
    const transporter = getTransporter()
    
    let subject = ''
    let body = ''

    if (candidate.document_type.includes('Offer')) {
      subject = `Offer Letter — ${candidate.role_course} at ${companyName}`
      body = `Dear ${candidate.full_name},

Congratulations. We are pleased to offer you the position of ${candidate.role_course} at ${companyName}.

Your offer letter is attached for your review. Please respond according to the instructions in the document.

Regards,
HR Team
${companyName}`
    } else {
      subject = `Your ${candidate.document_type} from ${companyName}`
      body = `Dear ${candidate.full_name},

Your ${candidate.document_type} has been issued successfully.

Please find the attached PDF for your records.

Regards,
Learning and Development Team
${companyName}`
    }

    const mailOptions = {
      from: `"${companyName} HR" <${fromEmail}>`,
      to: candidate.email,
      subject,
      text: body,
      attachments: [
        {
          filename: `${candidate.full_name.replace(/\s+/g, '_')}_${candidate.document_type.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer
        }
      ]
    }

    const info = await transporter.sendMail(mailOptions)
    messageId = info.messageId
  } catch (err: any) {
    emailStatus = 'Failed'
    errorMessage = err.message || 'SMTP transmission error occurred.'
  }

  // 5. Update Database status
  const finalSendStatus = emailStatus === 'Sent' ? 'Sent' : 'Failed'
  
  await supabase
    .from('candidates')
    .update({
      send_status: finalSendStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', candidateId)

  // Insert Email log
  const { data: logRecord } = await supabase
    .from('email_logs')
    .insert({
      candidate_id: candidateId,
      document_id: doc.id,
      recipient_email: candidate.email,
      subject: `Offer Letter — ${candidate.role_course} at ${companyName}`,
      status: finalSendStatus,
      message_id: messageId || null,
      error_message: errorMessage || null,
      sent_by: currentUser.id
    })
    .select()
    .single()

  // Insert Audit log
  await supabase.from('audit_logs').insert({
    user_id: currentUser.id,
    candidate_id: candidateId,
    document_id: doc.id,
    action: emailStatus === 'Sent' ? 'Email Sent' : 'Email Dispatch Failed',
    entity_type: 'emails',
    details: emailStatus === 'Sent' 
      ? `Successfully emailed ${candidate.document_type} to ${candidate.email}. Message ID: ${messageId}`
      : `Failed to email document to ${candidate.email}. Error: ${errorMessage}`
  })

  revalidatePath('/dashboard/candidates')
  revalidatePath('/dashboard/emails')
  revalidatePath('/dashboard/audit')

  if (emailStatus === 'Failed') {
    return { error: errorMessage }
  }

  return { success: true }
}

export async function bulkSendEmails() {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return { error: 'Unauthorized.' }
  }

  // Admin permission check (Admin-only for bulk send)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'Admin') {
    return { error: 'Only administrators can perform bulk email distributions.' }
  }

  // Fetch all candidates who are Approved and Ready (which means they have a generated document and haven't been successfully sent yet)
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('id, full_name')
    .eq('approval_status', 'Approved')
    .eq('send_status', 'Ready')

  if (error) {
    return { error: error.message }
  }

  if (!candidates || candidates.length === 0) {
    return { error: 'No eligible candidates found with status Approved and Ready.' }
  }

  let successCount = 0
  let failureCount = 0
  const results: any[] = []

  // Process sequentially to respect rate limits and log results accurately
  for (const candidate of candidates) {
    const res = await sendEmailForCandidate(candidate.id)
    if (res.error) {
      failureCount++
      results.push({ name: candidate.full_name, success: false, error: res.error })
    } else {
      successCount++
      results.push({ name: candidate.full_name, success: true })
    }
  }

  // Audit log bulk send action
  await supabase.from('audit_logs').insert({
    user_id: currentUser.id,
    action: 'Bulk Emails Sent',
    entity_type: 'emails',
    details: `Executed bulk dispatch. Total sent: ${successCount}, Failures: ${failureCount}.`
  })

  revalidatePath('/dashboard/candidates')
  revalidatePath('/dashboard/emails')

  return { success: true, successCount, failureCount, results }
}
