'use client'

import { useState, useRef, useTransition } from 'react'
import * as XLSX from 'xlsx'
import { importCandidates } from '@/app/actions/importExcelAction'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  Database,
  ArrowRight,
  Trash2
} from 'lucide-react'

// Fields required in Excel
const REQUIRED_COLUMNS = [
  'Candidate ID', 
  'Name', 
  'Email', 
  'Role/Course', 
  'Joining Date', 
  'Salary', 
  'Document Type', 
  'Approval Status', 
  'Send Status'
]

const VALID_DOC_TYPES = [
  'Offer Letter', 
  'Internship Offer Letter', 
  'Training Certificate', 
  'Completion Certificate'
]

const VALID_APPROVAL_STATUSES = ['Draft', 'Pending Approval', 'Approved', 'Rejected']
const VALID_SEND_STATUSES = ['Not Ready', 'Ready', 'Sent', 'Failed']

interface ParsedRow {
  index: number
  candidate_id: string
  full_name: string
  email: string
  role_course: string
  joining_date: string
  salary: number
  document_type: string
  approval_status: string
  send_status: string
  errors: string[]
}

export default function ImportExcelPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null)

  // Download Excel Template
  const handleDownloadTemplate = () => {
    const headers = REQUIRED_COLUMNS
    const sampleRows = [
      [
        'CAN-2026-101', 
        'Marcus Aurelius', 
        'marcus.aurelius@rome.org', 
        'Chief Philosophy Officer', 
        '2026-09-01', 
        '120000', 
        'Offer Letter', 
        'Draft', 
        'Not Ready'
      ],
      [
        'CAN-2026-102', 
        'Hypatia Alexandria', 
        'hypatia@library.org', 
        'Lead Mathematics Instructor', 
        '2026-10-15', 
        '95000', 
        'Completion Certificate', 
        'Approved', 
        'Ready'
      ]
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Import Template')
    XLSX.writeFile(wb, 'hireflow_candidates_template.xlsx')
  }

  // Handle excel file parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    parseExcel(file)
  }

  const parseExcel = (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      setValidationError('Please select a valid Microsoft Excel file (.xlsx) only.')
      return
    }

    setFileName(file.name)
    setValidationError(null)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const data = new Uint8Array(buffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        
        // Convert sheet to array of arrays to verify columns
        const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 })
        
        if (rawRows.length === 0) {
          setValidationError('The uploaded spreadsheet is empty.')
          return
        }

        const headers = rawRows[0].map(h => String(h).trim())
        const missingCols = REQUIRED_COLUMNS.filter(col => !headers.includes(col))

        if (missingCols.length > 0) {
          setValidationError(`Missing required template columns: ${missingCols.join(', ')}`)
          return
        }

        // Map column indices
        const colIndices = REQUIRED_COLUMNS.reduce((acc, col) => {
          acc[col] = headers.indexOf(col)
          return acc;
        }, {} as Record<string, number>)

        const parsedRows: ParsedRow[] = []

        // Parse and validate rows
        for (let i = 1; i < rawRows.length; i++) {
          const row = rawRows[i]
          if (row.length === 0 || row.every(cell => cell === null || cell === '')) continue

          const candidateId = String(row[colIndices['Candidate ID']] || '').trim()
          const name = String(row[colIndices['Name']] || '').trim()
          const email = String(row[colIndices['Email']] || '').trim()
          const roleCourse = String(row[colIndices['Role/Course']] || '').trim()
          const joiningDateRaw = row[colIndices['Joining Date']]
          const salaryRaw = row[colIndices['Salary']]
          const docType = String(row[colIndices['Document Type']] || '').trim()
          const approvalStatus = String(row[colIndices['Approval Status']] || 'Draft').trim()
          const sendStatus = String(row[colIndices['Send Status']] || 'Not Ready').trim()

          const errors: string[] = []

          if (!candidateId) errors.push('Candidate ID is required.')
          if (!name) errors.push('Name is required.')
          
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!email) {
            errors.push('Email is required.')
          } else if (!emailRegex.test(email)) {
            errors.push('Email format is invalid.')
          }

          if (!roleCourse) errors.push('Role/Course is required.')

          // Validate joining date
          let joiningDateStr = ''
          if (!joiningDateRaw) {
            errors.push('Joining Date is required.')
          } else {
            // Excel dates can be numeric codes or string format
            if (typeof joiningDateRaw === 'number') {
              // Convert Excel serial date to Date object
              const dateObj = XLSX.SSF.parse_date_code(joiningDateRaw)
              joiningDateStr = `${dateObj.y}-${String(dateObj.m).padStart(2, '0')}-${String(dateObj.d).padStart(2, '0')}`
            } else {
              const dateObj = new Date(joiningDateRaw)
              if (isNaN(dateObj.getTime())) {
                errors.push('Joining Date format is invalid (use YYYY-MM-DD).')
              } else {
                joiningDateStr = dateObj.toISOString().split('T')[0]
              }
            }
          }

          // Validate salary
          const salary = parseFloat(salaryRaw)
          if (isNaN(salary)) {
            errors.push('Salary must be a valid numeric amount.')
          } else if (salary < 0) {
            errors.push('Salary amount cannot be negative.')
          }

          if (!VALID_DOC_TYPES.includes(docType)) {
            errors.push(`Document Type must be one of: ${VALID_DOC_TYPES.join(', ')}`)
          }

          if (!VALID_APPROVAL_STATUSES.includes(approvalStatus)) {
            errors.push(`Approval Status must be one of: ${VALID_APPROVAL_STATUSES.join(', ')}`)
          }

          if (!VALID_SEND_STATUSES.includes(sendStatus)) {
            errors.push(`Send Status must be one of: ${VALID_SEND_STATUSES.join(', ')}`)
          }

          parsedRows.push({
            index: i,
            candidate_id: candidateId,
            full_name: name,
            email: email,
            role_course: roleCourse,
            joining_date: joiningDateStr,
            salary: isNaN(salary) ? 0 : salary,
            document_type: docType,
            approval_status: approvalStatus,
            send_status: sendStatus,
            errors: errors
          })
        }

        setParsedData(parsedRows)
      } catch (err: any) {
        setValidationError(`Failed to parse file: ${err.message}`)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Clear loaded state
  const handleClear = () => {
    setFileName(null)
    setParsedData([])
    setValidationError(null)
    setImportResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Submit valid candidate rows
  const handleCommit = () => {
    const validRows = parsedData.filter(row => row.errors.length === 0)
    if (validRows.length === 0) return

    setImportResult(null)
    startTransition(async () => {
      const res = await importCandidates(validRows)
      if (res.error) {
        setImportResult({ success: false, error: res.error })
      } else {
        setImportResult({ success: true, count: res.count })
        handleClear()
      }
    })
  }

  // Count errors
  const invalidRowsCount = parsedData.filter(row => row.errors.length > 0).length
  const validRowsCount = parsedData.filter(row => row.errors.length === 0).length

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-title-section">
        <div>
          <h1 className="page-title">Import Excel Spreadsheet</h1>
          <p className="page-subtitle">Load candidates in bulk via structured Excel sheets</p>
        </div>
        <button className="btn btn-secondary" onClick={handleDownloadTemplate} style={{ gap: '8px' }}>
          <Download size={16} />
          Download Excel Template
        </button>
      </div>

      {validationError && (
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{validationError}</span>
        </div>
      )}

      {importResult && (
        <div className={`alert ${importResult.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '20px' }}>
          {importResult.success ? (
            <>
              <CheckCircle size={18} />
              <span>Bulk import complete! Successfully enrolled {importResult.count} candidates in the directory.</span>
            </>
          ) : (
            <>
              <AlertCircle size={18} />
              <span>Import failed: {importResult.error}</span>
            </>
          )}
        </div>
      )}

      {/* Drag and Drop Zone */}
      {parsedData.length === 0 && (
        <div 
          className="card"
          style={{ padding: '60px 40px', textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed', borderWidth: '2px', background: 'rgba(255,255,255,0.01)' }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files?.[0]
            if (file) parseExcel(file)
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx" 
            style={{ display: 'none' }} 
          />
          <div style={{ color: 'var(--color-accent)', marginBottom: '16px' }}>
            <Upload size={48} style={{ margin: '0 auto' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Upload candidate spreadsheet</h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Drag and drop a <strong>.xlsx</strong> file, or click to browse local files.
          </p>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Must strictly match the columns defined in our Excel template.
          </span>
        </div>
      )}

      {/* Excel Preview */}
      {parsedData.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileSpreadsheet size={24} style={{ color: 'var(--color-accent)' }} />
              <div>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>{fileName}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Total rows parsed: {parsedData.length} | 
                  <span style={{ color: 'var(--color-success)', marginLeft: '4px', fontWeight: '500' }}>{validRowsCount} valid</span>
                  {invalidRowsCount > 0 && (
                    <span style={{ color: 'var(--color-error)', marginLeft: '8px', fontWeight: '500' }}>{invalidRowsCount} invalid</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={handleClear} style={{ gap: '8px' }} disabled={isPending}>
                <Trash2 size={16} /> Clear file
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCommit} 
                disabled={validRowsCount === 0 || isPending}
                style={{ gap: '8px' }}
              >
                {isPending ? (
                  <>
                    <span className="spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    Import {validRowsCount} Valid Rows
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Candidate ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role / Course</th>
                  <th>Document Details</th>
                  <th>Verification Errors</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row) => {
                  const hasErrors = row.errors.length > 0
                  return (
                    <tr key={row.index} style={hasErrors ? { background: 'rgba(239, 68, 68, 0.02)' } : {}}>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>{row.index}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '500', color: hasErrors && !row.candidate_id ? 'var(--color-error)' : 'inherit' }}>
                        {row.candidate_id || '[Empty]'}
                      </td>
                      <td style={{ fontWeight: '500', color: hasErrors && !row.full_name ? 'var(--color-error)' : 'inherit' }}>
                        {row.full_name || '[Empty]'}
                      </td>
                      <td style={{ color: hasErrors && (!row.email || row.errors.some(e => e.includes('Email'))) ? 'var(--color-error)' : 'var(--color-text-secondary)' }}>
                        {row.email || '[Empty]'}
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{row.role_course || '[Empty]'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Salary: ${row.salary.toLocaleString()}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: '500' }}>{row.document_type || '[Empty]'}</div>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                          <span className={`badge badge-${row.approval_status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '9px', padding: '1px 6px' }}>{row.approval_status}</span>
                          <span className={`badge badge-${row.send_status.toLowerCase().replace(' ', '')}`} style={{ fontSize: '9px', padding: '1px 6px' }}>{row.send_status}</span>
                        </div>
                      </td>
                      <td>
                        {hasErrors ? (
                          <div style={{ color: 'var(--color-error)', display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                            {row.errors.map((err, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={10} style={{ flexShrink: 0 }} />
                                <span>{err}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <CheckCircle size={12} />
                            <span>Valid row</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
