'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getSignedPdfUrl, regeneratePdfForCandidate } from '@/app/actions/documentActions'
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Eye, 
  RefreshCw, 
  ExternalLink, 
  X, 
  AlertCircle, 
  Check 
} from 'lucide-react'

interface DocumentsTableProps {
  initialDocuments: any[]
  userRole: string
}

export default function DocumentsTable({ initialDocuments, userRole }: DocumentsTableProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState(initialDocuments)
  const [isPending, startTransition] = useTransition()

  const [searchTerm, setSearchTerm] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('')

  // View modal state
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)
  const [viewingDocRef, setViewingDocRef] = useState<string>('')
  
  // Alert messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Loading indicator for URL signing
  const [signingId, setSigningId] = useState<string | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  // Fetch signed URL and open in new tab or viewer modal
  const handleViewPdf = async (doc: any) => {
    setErrorMsg(null)
    setSigningId(doc.id)
    try {
      const res = await getSignedPdfUrl(doc.id)
      if (res.error) {
        setErrorMsg(res.error)
      } else if (res.url) {
        setViewingUrl(res.url)
        setViewingDocRef(doc.document_reference)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch signed document URL.')
    } finally {
      setSigningId(null)
    }
  }

  // Fetch signed URL and trigger browser download
  const handleDownloadPdf = async (doc: any) => {
    setErrorMsg(null)
    setSigningId(doc.id)
    try {
      const res = await getSignedPdfUrl(doc.id)
      if (res.error) {
        setErrorMsg(res.error)
      } else if (res.url) {
        // Trigger browser download by opening the signed link in an iframe or blank tab
        window.open(res.url, '_blank')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch download link.')
    } finally {
      setSigningId(null)
    }
  }

  // Regenerate PDF
  const handleRegeneratePdf = async (doc: any) => {
    const confirmRegen = window.confirm(`Are you sure you want to regenerate PDF for candidate ${doc.candidates?.full_name}? The previous PDF will be deleted.`)
    if (!confirmRegen) return

    setErrorMsg(null)
    setSuccessMsg(null)
    setRegeneratingId(doc.id)

    try {
      const res = await regeneratePdfForCandidate(doc.candidate_id)
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg(`Document regenerated successfully.`)
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to regenerate PDF.')
    } finally {
      setRegeneratingId(null)
    }
  }

  // Local Search & Filter logic
  const filteredDocs = documents.filter(doc => {
    const candidateName = doc.candidates?.full_name || ''
    const matchesSearch = 
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.certificate_id && doc.certificate_id.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDocType = docTypeFilter ? doc.document_type === docTypeFilter : true

    return matchesSearch && matchesDocType
  })

  return (
    <div>
      {/* Messages */}
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

      {/* Filters */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }} className="d-md-grid-cols-2">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search candidate name, document reference, certificate ID..."
            className="form-control"
            style={{ paddingLeft: '38px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ width: '220px' }}>
          <select
            className="form-control"
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
          >
            <option value="">All Document Types</option>
            <option value="Offer Letter">Offer Letter</option>
            <option value="Internship Offer Letter">Internship Offer Letter</option>
            <option value="Training Certificate">Training Certificate</option>
            <option value="Completion Certificate">Completion Certificate</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredDocs.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            <FileText size={40} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>No generated documents found</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Once you approve candidates and generate their PDFs, they will appear here.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Document Reference</th>
                <th>Candidate Name</th>
                <th>Document Type</th>
                <th>Certificate ID</th>
                <th>Generated At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '13px' }}>
                    {doc.document_reference}
                  </td>
                  <td>{doc.candidates?.full_name || 'Enrolled Candidate'}</td>
                  <td>
                    <span className="badge badge-ready" style={{ fontSize: '11px', textTransform: 'none' }}>
                      {doc.document_type}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {doc.certificate_id || 'N/A'}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {new Date(doc.generated_at).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {/* View PDF */}
                      <button
                        className="icon-btn"
                        title={signingId === doc.id ? "Fetching..." : "View in Portal"}
                        onClick={() => handleViewPdf(doc)}
                        disabled={signingId !== null}
                      >
                        {signingId === doc.id ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Eye size={14} />}
                      </button>

                      {/* Download PDF */}
                      <button
                        className="icon-btn"
                        title="Download PDF"
                        style={{ color: 'var(--color-accent)' }}
                        onClick={() => handleDownloadPdf(doc)}
                        disabled={signingId !== null}
                      >
                        <Download size={14} />
                      </button>

                      {/* Regenerate PDF */}
                      <button
                        className="icon-btn"
                        title="Regenerate Document"
                        style={{ color: 'var(--color-warning)' }}
                        onClick={() => handleRegeneratePdf(doc)}
                        disabled={regeneratingId !== null}
                      >
                        {regeneratingId === doc.id ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <RefreshCw size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PDF VIEWER MODAL */}
      {viewingUrl && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '800px', width: '90%', height: '85vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => { setViewingUrl(null); setViewingDocRef(''); }}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 className="modal-title" style={{ marginBottom: '16px' }}>Document Preview: {viewingDocRef}</h3>
            
            <div style={{ flex: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden', background: '#e4e4e7' }}>
              <iframe 
                src={viewingUrl} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="PDF Preview"
              />
            </div>
            
            <div className="modal-footer" style={{ marginTop: '16px', marginBottom: 0 }}>
              <a href={viewingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ gap: '8px' }}>
                Open in New Tab <ExternalLink size={14} />
              </a>
              <button className="btn btn-secondary" onClick={() => { setViewingUrl(null); setViewingDocRef(''); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
