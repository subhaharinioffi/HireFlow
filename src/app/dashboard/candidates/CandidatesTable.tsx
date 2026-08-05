'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Send, 
  FileDown, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { deleteCandidate, reviewCandidate, submitForApproval } from '@/app/actions/candidateActions'
// Placeholder actions we will create soon
// import { generatePdfForCandidate } from '@/app/actions/documentActions'
// import { sendEmailForCandidate } from '@/app/actions/sendEmailAction'

interface CandidatesTableProps {
  initialCandidates: any[]
  userRole: string
  userId: string
}

export default function CandidatesTable({ initialCandidates, userRole, userId }: CandidatesTableProps) {
  const router = useRouter()
  const [candidates, setCandidates] = useState(initialCandidates)
  const [isPending, startTransition] = useTransition()
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('')
  const [approvalFilter, setApprovalFilter] = useState('')
  const [sendFilter, setSendFilter] = useState('')
  
  // Sorting state
  const [sortField, setSortField] = useState('created_at')
  const [sortAscending, setSortAscending] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modals state
  const [candidateToDelete, setCandidateToDelete] = useState<any>(null)
  const [candidateToReject, setCandidateToReject] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)

  // Status/Error messages
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  
  // Document actions states
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)

  // Handle local delete
  const handleDelete = async () => {
    if (!candidateToDelete) return
    setActionError(null)
    setActionSuccess(null)
    
    startTransition(async () => {
      const res = await deleteCandidate(candidateToDelete.id)
      if (res?.error) {
        setActionError(res.error)
      } else {
        setActionSuccess(`Candidate ${candidateToDelete.full_name} deleted successfully.`)
        setCandidates(candidates.filter(c => c.id !== candidateToDelete.id))
      }
      setCandidateToDelete(null)
    })
  }

  // Handle local approve
  const handleApprove = (candidate: any) => {
    setActionError(null)
    setActionSuccess(null)
    startTransition(async () => {
      const res = await reviewCandidate(candidate.id, 'Approve')
      if (res?.error) {
        setActionError(res.error)
      } else {
        setActionSuccess(`Candidate ${candidate.full_name} approved successfully.`)
        // Refresh local data
        router.refresh()
      }
    })
  }

  // Handle local reject
  const handleReject = () => {
    if (!candidateToReject) return
    setActionError(null)
    setActionSuccess(null)
    startTransition(async () => {
      const res = await reviewCandidate(candidateToReject.id, 'Reject', rejectionReason)
      if (res?.error) {
        setActionError(res.error)
      } else {
        setActionSuccess(`Candidate ${candidateToReject.full_name} rejected.`)
        router.refresh()
      }
      setCandidateToReject(null)
      setRejectionReason('')
    })
  }

  // Handle submit for approval
  const handleSubmitApproval = (candidate: any) => {
    setActionError(null)
    setActionSuccess(null)
    startTransition(async () => {
      const res = await submitForApproval(candidate.id)
      if (res?.error) {
        setActionError(res.error)
      } else {
        setActionSuccess(`Candidate ${candidate.full_name} submitted for approval.`)
        router.refresh()
      }
    })
  }

  // Trigger PDF Generation
  const handleGeneratePdf = async (candidate: any) => {
    setGeneratingId(candidate.id)
    setActionError(null)
    setActionSuccess(null)
    try {
      const { generatePdfForCandidate } = await import('@/app/actions/documentActions')
      const res = await generatePdfForCandidate(candidate.id)
      if (res.error) {
        setActionError(res.error)
      } else {
        setActionSuccess(`PDF generated successfully for ${candidate.full_name}.`)
        router.refresh()
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to generate PDF')
    } finally {
      setGeneratingId(null)
    }
  }

  // Trigger Email Send
  const handleSendEmail = async (candidate: any) => {
    setSendingId(candidate.id)
    setActionError(null)
    setActionSuccess(null)
    try {
      const { sendEmailForCandidate } = await import('@/app/actions/sendEmailAction')
      const res = await sendEmailForCandidate(candidate.id)
      if (res.error) {
        setActionError(res.error)
      } else {
        setActionSuccess(`Document successfully sent to ${candidate.full_name} (${candidate.email}).`)
        router.refresh()
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to dispatch email')
    } finally {
      setSendingId(null)
    }
  }

  // Sorting helper
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAscending(!sortAscending)
    } else {
      setSortField(field)
      setSortAscending(true)
    }
  }

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.candidate_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.role_course.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesDocType = docTypeFilter ? candidate.document_type === docTypeFilter : true
    const matchesApproval = approvalFilter ? candidate.approval_status === approvalFilter : true
    const matchesSend = sendFilter ? candidate.send_status === sendFilter : true

    return matchesSearch && matchesDocType && matchesApproval && matchesSend
  })

  // Sort candidates
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (typeof aVal === 'string') {
      return sortAscending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    } else {
      return sortAscending ? aVal - bVal : bVal - aVal
    }
  })

  // Pagination helper
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage)
  const paginatedCandidates = sortedCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div>
      {/* Action alerts */}
      {actionError && (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={18} />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          <Check size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search ID, name, role..."
              className="form-control"
              style={{ paddingLeft: '38px' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {/* Doc Type Filter */}
          <div style={{ position: 'relative' }}>
            <select
              className="form-control"
              value={docTypeFilter}
              onChange={(e) => { setDocTypeFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Document Types</option>
              <option value="Offer Letter">Offer Letter</option>
              <option value="Internship Offer Letter">Internship Offer Letter</option>
              <option value="Training Certificate">Training Certificate</option>
              <option value="Completion Certificate">Completion Certificate</option>
            </select>
          </div>

          {/* Approval Filter */}
          <div>
            <select
              className="form-control"
              value={approvalFilter}
              onChange={(e) => { setApprovalFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Approvals</option>
              <option value="Draft">Draft</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Send Status Filter */}
          <div>
            <select
              className="form-control"
              value={sendFilter}
              onChange={(e) => { setSendFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Send Statuses</option>
              <option value="Not Ready">Not Ready</option>
              <option value="Ready">Ready</option>
              <option value="Sent">Sent</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table grid */}
      {paginatedCandidates.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            <Filter size={40} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>No candidates found</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Try resetting your search query or filters, or add a candidate to get started.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('candidate_id')}>
                  ID <ArrowUpDown size={12} style={{ marginLeft: '4px' }} />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('full_name')}>
                  Name <ArrowUpDown size={12} style={{ marginLeft: '4px' }} />
                </th>
                <th>Role/Course</th>
                <th>Doc Type</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('approval_status')}>
                  Approval <ArrowUpDown size={12} style={{ marginLeft: '4px' }} />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('send_status')}>
                  Delivery <ArrowUpDown size={12} style={{ marginLeft: '4px' }} />
                </th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '500' }}>
                    {candidate.candidate_id}
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{candidate.full_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{candidate.email}</div>
                  </td>
                  <td>{candidate.role_course}</td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{candidate.document_type}</td>
                  <td>
                    <span className={`badge badge-${candidate.approval_status.toLowerCase().replace(' ', '')}`}>
                      {candidate.approval_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${candidate.send_status.toLowerCase().replace(' ', '')}`}>
                      {candidate.send_status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {/* View details */}
                      <button 
                        className="icon-btn" 
                        title="View details"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <Eye size={14} />
                      </button>

                      {/* Executive Draft edit / submission */}
                      {candidate.approval_status === 'Draft' && (
                        <button 
                          className="icon-btn" 
                          title="Submit for Approval"
                          style={{ color: 'var(--color-accent)' }}
                          onClick={() => handleSubmitApproval(candidate)}
                        >
                          <Sparkles size={14} />
                        </button>
                      )}

                      {/* Approval controls (Manager/Admin only) */}
                      {candidate.approval_status === 'Pending Approval' && (userRole === 'Admin' || userRole === 'HR Manager') && (
                        <>
                          <button 
                            className="icon-btn" 
                            title="Approve"
                            style={{ color: 'var(--color-success)', borderColor: 'rgba(16,185,129,0.3)' }}
                            onClick={() => handleApprove(candidate)}
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            className="icon-btn" 
                            title="Reject"
                            style={{ color: 'var(--color-error)', borderColor: 'rgba(239,68,68,0.3)' }}
                            onClick={() => setCandidateToReject(candidate)}
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}

                      {/* PDF Actions (Available once approved) */}
                      {candidate.approval_status === 'Approved' && (
                        <button
                          className="icon-btn"
                          title={generatingId === candidate.id ? "Generating..." : "Generate PDF"}
                          style={{ color: 'var(--color-success)' }}
                          onClick={() => handleGeneratePdf(candidate)}
                          disabled={generatingId !== null}
                        >
                          {generatingId === candidate.id ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Sparkles size={14} />}
                        </button>
                      )}

                      {/* Email Actions (Manager/Admin only, Approved & Ready/Failed candidates) */}
                      {candidate.approval_status === 'Approved' && (candidate.send_status === 'Ready' || candidate.send_status === 'Failed') && (userRole === 'Admin' || userRole === 'HR Manager') && (
                        <button
                          className="icon-btn"
                          title={sendingId === candidate.id ? "Sending..." : "Send Email"}
                          style={{ color: 'var(--color-accent)' }}
                          onClick={() => handleSendEmail(candidate)}
                          disabled={sendingId !== null}
                        >
                          {sendingId === candidate.id ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Send size={14} />}
                        </button>
                      )}

                      {/* Edit Candidate (Allowed for Executives on drafts, managers/admins always) */}
                      {(userRole === 'Admin' || userRole === 'HR Manager' || (userRole === 'HR Executive' && (candidate.approval_status === 'Draft' || candidate.approval_status === 'Pending Approval'))) && (
                        <Link href={`/dashboard/candidates/${candidate.id}/edit`} className="icon-btn" title="Edit candidate">
                          <Edit2 size={14} />
                        </Link>
                      )}

                      {/* Delete (Admin only) */}
                      {userRole === 'Admin' && (
                        <button 
                          className="icon-btn" 
                          title="Delete Candidate"
                          style={{ color: 'var(--color-error)' }}
                          onClick={() => setCandidateToDelete(candidate)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderTop: '1px solid var(--color-border)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedCandidates.length)} of {sortedCandidates.length} records
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="icon-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  className="icon-btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {candidateToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title" style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={20} />
              Confirm Delete
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Are you sure you want to permanently delete candidate <strong>{candidateToDelete.full_name}</strong>? This action will remove all database records, generated documents, and email logs.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCandidateToDelete(null)} disabled={isPending}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={isPending}>
                {isPending ? <span className="spinner" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {candidateToReject && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Reject Candidate</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Provide a reason for rejecting the candidate draft for <strong>{candidateToReject.full_name}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason (Optional)</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Details of incorrect candidate metrics or role configurations..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setCandidateToReject(null); setRejectionReason(''); }} disabled={isPending}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReject} disabled={isPending}>
                {isPending ? <span className="spinner" /> : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE DETAIL MODAL */}
      {selectedCandidate && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <button 
              onClick={() => setSelectedCandidate(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 className="modal-title" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Candidate Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Candidate ID</div>
                <div style={{ fontWeight: '500', fontFamily: 'monospace' }}>{selectedCandidate.candidate_id}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Full Name</div>
                <div style={{ fontWeight: '500' }}>{selectedCandidate.full_name}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Email</div>
                <div style={{ fontWeight: '500' }}>{selectedCandidate.email}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Role / Course</div>
                <div style={{ fontWeight: '500' }}>{selectedCandidate.role_course}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Joining Date</div>
                <div style={{ fontWeight: '500' }}>{new Date(selectedCandidate.joining_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Salary</div>
                <div style={{ fontWeight: '500' }}>${selectedCandidate.salary.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Document Type</div>
                <div style={{ fontWeight: '500' }}>{selectedCandidate.document_type}</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Created By</div>
                <div style={{ fontWeight: '500' }}>{selectedCandidate.profiles?.full_name || 'HR Portal'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Approval Status</div>
                <span className={`badge badge-${selectedCandidate.approval_status.toLowerCase().replace(' ', '')}`}>
                  {selectedCandidate.approval_status}
                </span>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}>Delivery Status</div>
                <span className={`badge badge-${selectedCandidate.send_status.toLowerCase().replace(' ', '')}`}>
                  {selectedCandidate.send_status}
                </span>
              </div>
            </div>

            {selectedCandidate.rejection_reason && (
              <div style={{ marginTop: '16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px', borderRadius: 'var(--border-radius)', fontSize: '13px' }}>
                <div style={{ color: 'var(--color-error)', fontWeight: '600', marginBottom: '4px' }}>Rejection Reason</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>{selectedCandidate.rejection_reason}</div>
              </div>
            )}

            <div className="modal-footer" style={{ marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedCandidate(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
