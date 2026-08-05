'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { bulkSendEmails } from '@/app/actions/sendEmailAction'
import { createClient } from '@/lib/supabase/client'
import { 
  Upload, 
  UserPlus, 
  FileText, 
  Send, 
  AlertCircle, 
  Check 
} from 'lucide-react'

interface QuickActionsProps {
  userRole: string
}

export default function QuickActions({ userRole }: QuickActionsProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [isPending, startTransition] = useTransition()
  const [generating, setGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Quick Action: Generate all eligible documents
  const handleBulkGenerate = async () => {
    setGenerating(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      // Fetch Approved candidates that don't have documents yet
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id, full_name')
        .eq('approval_status', 'Approved')
        .eq('send_status', 'Not Ready')

      if (!candidates || candidates.length === 0) {
        setSuccessMsg('No pending Approved candidates require PDF generation.')
        setGenerating(false)
        return
      }

      const { generatePdfForCandidate } = await import('@/app/actions/documentActions')
      let successCount = 0

      for (const candidate of candidates) {
        const res = await generatePdfForCandidate(candidate.id)
        if (!res.error) successCount++
      }

      setSuccessMsg(`Generated ${successCount} documents successfully.`)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during bulk generation.')
    } finally {
      setGenerating(false)
    }
  }

  // Quick Action: Send all approved/ready documents (bulk send)
  const handleBulkSend = () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    startTransition(async () => {
      const res = await bulkSendEmails()
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(`Bulk send complete. Dispatched: ${res.successCount} | Failed: ${res.failureCount}`)
        router.refresh()
      }
    })
  }

  return (
    <div style={{ marginBottom: '28px' }}>
      {errorMsg && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Link href="/dashboard/import" className="btn btn-secondary" style={{ padding: '20px', flexDirection: 'column', height: 'auto', gap: '10px' }}>
          <Upload size={24} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontWeight: '600' }}>Import Excel</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Upload candidate spreadsheet</span>
        </Link>

        <Link href="/dashboard/candidates/new" className="btn btn-secondary" style={{ padding: '20px', flexDirection: 'column', height: 'auto', gap: '10px' }}>
          <UserPlus size={24} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontWeight: '600' }}>Add Candidate</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Create a candidate manually</span>
        </Link>

        <button 
          className="btn btn-secondary" 
          onClick={handleBulkGenerate}
          disabled={generating || isPending}
          style={{ padding: '20px', flexDirection: 'column', height: 'auto', gap: '10px' }}
        >
          {generating ? <span className="spinner" style={{ width: '24px', height: '24px' }} /> : <FileText size={24} style={{ color: 'var(--color-success)' }} />}
          <span style={{ fontWeight: '600' }}>Generate Documents</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Batch compile PDFs for approved candidates</span>
        </button>

        {userRole === 'Admin' && (
          <button 
            className="btn btn-secondary" 
            onClick={handleBulkSend}
            disabled={generating || isPending}
            style={{ padding: '20px', flexDirection: 'column', height: 'auto', gap: '10px' }}
          >
            {isPending ? <span className="spinner" style={{ width: '24px', height: '24px' }} /> : <Send size={24} style={{ color: 'var(--color-accent)' }} />}
            <span style={{ fontWeight: '600' }}>Send Approved Docs</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Bulk email PDFs to candidates</span>
          </button>
        )}
      </div>
    </div>
  )
}
