'use client'

import { useState } from 'react'
import { Search, Filter, History, ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditLogsTableProps {
  initialLogs: any[]
}

export default function AuditLogsTable({ initialLogs }: AuditLogsTableProps) {
  const [logs] = useState(initialLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Local filter logic
  const filteredLogs = logs.filter(log => {
    const userName = log.profiles?.full_name || ''
    const userEmail = log.profiles?.email || ''
    const matchesSearch = 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesEntity = entityFilter ? log.entity_type === entityFilter : true

    return matchesSearch && matchesEntity
  })

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div>
      {/* Filters */}
      <div className="card d-md-grid-cols-2" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search action details, username, email..."
            className="form-control"
            style={{ paddingLeft: '38px' }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div style={{ width: '200px' }}>
          <select
            className="form-control"
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Entities</option>
            <option value="auth">Authentication</option>
            <option value="candidates">Candidates</option>
            <option value="templates">Templates</option>
            <option value="documents">Documents</option>
            <option value="emails">Emails</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {paginatedLogs.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            <History size={40} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>No audit logs recorded</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            System operations and administrator actions will be logged and display here.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Target Scope</th>
                <th>Detail Trail</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{log.profiles?.full_name || 'System Auto'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {log.profiles?.role || 'Service System'}
                    </div>
                  </td>
                  <td style={{ fontWeight: '600', fontSize: '13px' }}>
                    {log.action}
                  </td>
                  <td>
                    <span className="badge badge-draft" style={{ fontSize: '11px' }}>
                      {log.entity_type}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '400px', wordBreak: 'break-word' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderTop: '1px solid var(--color-border)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
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
    </div>
  )
}
