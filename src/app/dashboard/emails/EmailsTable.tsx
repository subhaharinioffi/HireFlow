'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendEmailForCandidate } from '@/app/actions/sendEmailAction'
import { 
  Search, 
  Filter, 
  Mail, 
  Send, 
  Eye, 
  AlertCircle, 
  Check, 
  X, 
  Info 
} from 'lucide-react'

interface EmailsTableProps {
  initialLogs: any[]
  userRole: string
}

export default function EmailsTable({ initialLogs, userRole }: EmailsTableProps) {
  const router = useRouter()
  const [logs, setLogs] = useState(initialLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  
  // Selected log details
  const [selectedLog, setSelectedLog] = useState<any>(null)
  
  // States
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Resend action
  const handleResend = async (candidateId: string) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setSendingId(candidateId)

    try {
      const res = await sendEmailForCandidate(candidateId)
      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg('Email resent successfully!')
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'SMTP dispatch error.')
    } finally {
      setSendingId(null)
    }
  }

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const candidateName = log.candidates?.full_name || ''
    const matchesSearch = 
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter ? log.status === statusFilter : true

    return matchesSearch && matchesStatus
  })

  return (
    <div>
      {/* Alert states */}
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
      <div className="card d-md-grid-cols-2" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search candidate name, email, subject..."
            className="form-control"
            style={{ paddingLeft: '38px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ width: '180px' }}>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredLogs.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            <Mail size={40} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>No email transmission records found</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            After SMTP emails are dispatched to candidates, status traces will appear here.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Recipient Email</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Sent At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: '500' }}>
                    {log.candidates?.full_name || 'Enrolled Candidate'}
                  </td>
                  <td>{log.recipient_email}</td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{log.subject}</td>
                  <td>
                    <span className={`badge badge-${log.status.toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {new Date(log.sent_at).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {/* View details */}
                      <button
                        className="icon-btn"
                        title="Inspection detail"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Info size={14} />
                      </button>

                      {/* Resend Email button (Manager/Admin only) */}
                      {(userRole === 'Admin' || userRole === 'HR Manager') && (
                        <button
                          className="icon-btn"
                          title={sendingId === log.candidate_id ? "Resending..." : "Resend Email"}
                          style={{ color: 'var(--color-accent)' }}
                          onClick={() => handleResend(log.candidate_id)}
                          disabled={sendingId !== null}
                        >
                          {sendingId === log.candidate_id ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Send size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }}>
            <button 
              onClick={() => setSelectedLog(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 className="modal-title" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>Transmission Metadata</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Subject</div>
                <div style={{ fontWeight: '500', color: '#fff' }}>{selectedLog.subject}</div>
              </div>
              
              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Recipient Email</div>
                <div style={{ fontWeight: '500', color: '#fff' }}>{selectedLog.recipient_email}</div>
              </div>

              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Nodemailer Message ID</div>
                <div style={{ fontWeight: '500', fontFamily: 'monospace', color: '#fff', wordBreak: 'break-all' }}>
                  {selectedLog.message_id || 'N/A (Failed Transmit)'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Sent Timestamp</div>
                <div style={{ fontWeight: '500', color: '#fff' }}>
                  {new Date(selectedLog.sent_at).toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-text-muted)' }}>Delivery Status</div>
                <span className={`badge badge-${selectedLog.status.toLowerCase()}`} style={{ marginTop: '4px' }}>
                  {selectedLog.status}
                </span>
              </div>

              {selectedLog.error_message && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px', borderRadius: 'var(--border-radius)', marginTop: '8px' }}>
                  <div style={{ color: 'var(--color-error)', fontWeight: '600', marginBottom: '4px' }}>SMTP Transmission Error</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedLog.error_message}</div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
