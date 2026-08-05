'use client'

import { useState, useTransition, useActionState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { upsertTemplate } from '@/app/actions/templateActions'
import { createClient } from '@/lib/supabase/client'
import { 
  FileCode, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  Variable, 
  ShieldAlert, 
  Check, 
  FileText,
  AlertCircle
} from 'lucide-react'

// Document types supported
const DOC_TYPES = [
  'Offer Letter', 
  'Internship Offer Letter', 
  'Training Certificate', 
  'Completion Certificate'
]

const VARIABLES = [
  { placeholder: '{{candidate_name}}', desc: 'Candidate Full Name' },
  { placeholder: '{{candidate_email}}', desc: 'Candidate Email' },
  { placeholder: '{{designation}}', desc: 'Job Title / Course Name' },
  { placeholder: '{{joining_date}}', desc: 'Date of joining / commencement' },
  { placeholder: '{{salary}}', desc: 'Annual or stipend salary amount' },
  { placeholder: '{{company_name}}', desc: 'Your Issuing Company Name' },
  { placeholder: '{{issue_date}}', desc: 'Date document is generated' },
  { placeholder: '{{certificate_id}}', desc: 'Unique certificate code' }
]

const DEFAULT_TEMPLATES: Record<string, string> = {
  'Offer Letter': `Dear {{candidate_name}},

We are pleased to offer you the position of {{designation}} at {{company_name}}.

Key details:
- Joining Date: {{joining_date}}
- Compensation: {{salary}} per annum
- Work Location: Tech Headquarters

We look forward to welcoming you to the team.

Best regards,
HR Operations Team`,
  'Internship Offer Letter': `Dear {{candidate_name}},

This letter confirms your enrollment in the internship program at {{company_name}} as an {{designation}} intern.

Details of your internship:
- Commencement: {{joining_date}}
- Stipend: {{salary}} per month
- Duration: 6 Months

Congratulations on your selection.

Best regards,
University Relations Team`,
  'Training Certificate': `CERTIFICATE OF TRAINING

This is to certify that {{candidate_name}} ({{candidate_email}}) has successfully completed training in {{designation}} conducted by {{company_name}}.

The training was commenced on {{joining_date}} and completed on {{issue_date}}.

Certificate ID: {{certificate_id}}`,
  'Completion Certificate': `CERTIFICATE OF COMPLETION

This document proudly certifies that {{candidate_name}} has completed all core program criteria for the {{designation}} course at {{company_name}}.

Issued on: {{issue_date}}
Certificate ID: {{certificate_id}}`
}

interface TemplateManagerClientProps {
  initialTemplates: any[]
}

export default function TemplateManagerClient({ initialTemplates }: TemplateManagerClientProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [selectedDocType, setSelectedDocType] = useState<string>('Offer Letter')
  const [isPending, startTransition] = useTransition()
  
  // Find template matching docType
  const currentTemplate = initialTemplates.find(t => t.document_type === selectedDocType)

  // Local form inputs state
  const [name, setName] = useState(currentTemplate?.name || `${selectedDocType} Template`)
  const [content, setContent] = useState(currentTemplate?.content || DEFAULT_TEMPLATES[selectedDocType] || '')
  const [logoUrl, setLogoUrl] = useState(currentTemplate?.logo_url || '')
  const [signatureUrl, setSignatureUrl] = useState(currentTemplate?.signature_url || '')

  // File uploading indicators
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingSignature, setUploadingSignature] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // State response from server action
  const [state, formAction] = useActionState(upsertTemplate, null)
  
  const contentAreaRef = useRef<HTMLTextAreaElement>(null)

  // Update form inputs when selected document type alters
  const handleDocTypeChange = (type: string) => {
    setSelectedDocType(type)
    const t = initialTemplates.find(x => x.document_type === type)
    setName(t?.name || `${type} Template`)
    setContent(t?.content || DEFAULT_TEMPLATES[type] || '')
    setLogoUrl(t?.logo_url || '')
    setSignatureUrl(t?.signature_url || '')
    setUploadError(null)
  }

  // Handle uploading logo/signature
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    if (type === 'logo') setUploadingLogo(true)
    else setUploadingSignature(true)

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `templates/${Date.now()}-${type}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('hireflow-assets')
        .upload(filePath, file, { upsert: true })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hireflow-assets')
        .getPublicUrl(filePath)

      if (type === 'logo') setLogoUrl(publicUrl)
      else setSignatureUrl(publicUrl)
    } catch (err: any) {
      setUploadError(`Failed to upload ${type}: ${err.message}`)
    } finally {
      if (type === 'logo') setUploadingLogo(false)
      else setUploadingSignature(false)
    }
  }

  // Helper to insert variables at text selection point
  const insertVariable = (variable: string) => {
    const txtarea = contentAreaRef.current
    if (!txtarea) return

    const startPos = txtarea.selectionStart
    const endPos = txtarea.selectionEnd
    const text = txtarea.value
    
    const newContent = text.substring(0, startPos) + variable + text.substring(endPos, text.length)
    setContent(newContent)
    
    // Focus back on textarea after insertion
    setTimeout(() => {
      txtarea.focus()
      txtarea.selectionStart = startPos + variable.length
      txtarea.selectionEnd = startPos + variable.length
    }, 50)
  }

  // Compile visual preview replaces variables
  const getPreviewHtml = () => {
    let preview = content
      .replace(/{{candidate_name}}/g, 'Alex Mercer')
      .replace(/{{candidate_email}}/g, 'alex.mercer@example.com')
      .replace(/{{designation}}/g, selectedDocType.includes('Certificate') ? 'Advanced Machine Learning' : 'Senior Systems Architect')
      .replace(/{{joining_date}}/g, 'September 15, 2026')
      .replace(/{{salary}}/g, selectedDocType.includes('Internship') ? '$2,500' : '$115,000')
      .replace(/{{company_name}}/g, 'HireFlow Inc.')
      .replace(/{{issue_date}}/g, 'August 5, 2026')
      .replace(/{{certificate_id}}/g, 'CERT-2026-HF89')

    return preview.split('\n').map((line, i) => <p key={i} style={{ marginBottom: '10px', minHeight: '18px' }}>{line}</p>)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="d-md-grid-cols-2">
      {/* Edit Form side */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <FileCode size={20} style={{ color: 'var(--color-accent)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Template Configuration</h2>
        </div>

        {/* Selected Document Type Toggle tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {DOC_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`btn ${selectedDocType === type ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
              onClick={() => handleDocTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Server errors */}
        {state?.error && (
          <div className="alert alert-error">
            <ShieldAlert size={18} />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="alert alert-success">
            <Check size={18} />
            <span>Template successfully committed to Supabase database.</span>
          </div>
        )}

        {uploadError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{uploadError}</span>
          </div>
        )}

        <form action={formAction}>
          {/* Hidden inputs to pass data */}
          <input type="hidden" name="documentType" value={selectedDocType} />
          <input type="hidden" name="logoUrl" value={logoUrl} />
          <input type="hidden" name="signatureUrl" value={signatureUrl} />

          <div className="form-group">
            <label className="form-label" htmlFor="name">Template Model Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Logo Upload */}
          <div className="form-group" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: '16px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '10px' }}>
              <span>Company Logo</span>
              {logoUrl && <span style={{ color: 'var(--color-success)', fontSize: '11px', fontWeight: '500' }}>✓ Loaded</span>}
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {logoUrl ? (
                <div style={{ width: '80px', height: '40px', background: 'white', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ width: '80px', height: '40px', border: '1px dashed var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--color-text-muted)' }}>
                  <ImageIcon size={16} />
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  id="logo-upload"
                  onChange={(e) => handleUploadFile(e, 'logo')}
                  disabled={uploadingLogo}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px', gap: '6px' }}
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploadingLogo}
                >
                  {uploadingLogo ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Upload size={12} />}
                  Upload Logo
                </button>
              </div>
            </div>
          </div>

          {/* Signature Upload */}
          <div className="form-group" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: '16px', marginTop: '12px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', marginBottom: '10px' }}>
              <span>Authorized Signature</span>
              {signatureUrl && <span style={{ color: 'var(--color-success)', fontSize: '11px', fontWeight: '500' }}>✓ Loaded</span>}
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {signatureUrl ? (
                <div style={{ width: '80px', height: '40px', background: 'white', display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureUrl} alt="Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ width: '80px', height: '40px', border: '1px dashed var(--color-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifycontent: 'center', color: 'var(--color-text-muted)' }}>
                  <ImageIcon size={16} />
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  id="sig-upload"
                  onChange={(e) => handleUploadFile(e, 'signature')}
                  disabled={uploadingSignature}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px', gap: '6px' }}
                  onClick={() => document.getElementById('sig-upload')?.click()}
                  disabled={uploadingSignature}
                >
                  {uploadingSignature ? <span className="spinner" style={{ width: '12px', height: '12px' }} /> : <Upload size={12} />}
                  Upload Signature
                </button>
              </div>
            </div>
          </div>

          {/* Variables helper */}
          <div style={{ margin: '16px 0' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Variable size={14} style={{ color: 'var(--color-accent)' }} />
              Dynamic Placeholders (Click to insert)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {VARIABLES.map((v) => (
                <button
                  key={v.placeholder}
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 8px', fontFamily: 'monospace' }}
                  title={v.desc}
                  onClick={() => insertVariable(v.placeholder)}
                >
                  {v.placeholder}
                </button>
              ))}
            </div>
          </div>

          {/* Body Content */}
          <div className="form-group">
            <label className="form-label" htmlFor="content">Document Body Content</label>
            <textarea
              id="content"
              name="content"
              ref={contentAreaRef}
              rows={12}
              className="form-control"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', gap: '8px', marginTop: '16px' }} 
            disabled={uploadingLogo || uploadingSignature}
          >
            <Save size={16} />
            Save {selectedDocType} Template
          </button>
        </form>
      </div>

      {/* Visual Live Preview Side */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          <Eye size={20} style={{ color: 'var(--color-success)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Live Document Preview</h2>
        </div>

        {/* Paper Container representation */}
        <div style={{ flex: 1, background: '#FFFFFF', color: '#1F2937', padding: '40px', borderRadius: 'var(--border-radius)', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)', fontFamily: 'Georgia, serif', position: 'relative', overflowY: 'auto', minHeight: '500px' }}>
          {/* Logo Row */}
          {logoUrl ? (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '24px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Company Logo" style={{ maxHeight: '48px', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#9CA3AF', fontStyle: 'italic', marginBottom: '24px' }}>[Company Logo Placeholder]</div>
          )}

          {/* Title based on Doc Type */}
          {selectedDocType.includes('Certificate') ? (
            <div style={{ textAlign: 'center', margin: '24px 0', border: '8px double rgba(17, 24, 39, 0.1)', padding: '24px' }}>
              {getPreviewHtml()}
            </div>
          ) : (
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: '12px', color: '#6B7280' }}>
                <div>Document Ref: HF-2026-XXXX</div>
                <div>Date: August 5, 2026</div>
              </div>
              <div>{getPreviewHtml()}</div>
            </div>
          )}

          {/* Signature Row */}
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              {selectedDocType.includes('Certificate') && (
                <div style={{ border: '1px solid rgba(0,0,0,0.1)', padding: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#4B5563', fontFamily: 'monospace' }}>
                  <div style={{ width: '36px', height: '36px', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>QR</div>
                  <div>
                    <div>Verify Certificate:</div>
                    <div style={{ color: 'var(--color-accent)', fontWeight: '500' }}>hireflow.com/verify/...</div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ textAlign: 'center', width: '150px' }}>
              {signatureUrl ? (
                <div style={{ borderBottom: '1px solid #9CA3AF', paddingBottom: '4px', marginBottom: '4px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureUrl} alt="Signature" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ borderBottom: '1px solid #9CA3AF', color: '#9CA3AF', fontSize: '11px', paddingBottom: '4px', marginBottom: '4px', fontStyle: 'italic' }}>
                  [Authorized Signature]
                </div>
              )}
              <div style={{ fontSize: '11px', fontWeight: '600' }}>Authorized Signatory</div>
              <div style={{ fontSize: '9px', color: '#6B7280' }}>HireFlow HR Operations</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Responsive column helper */
        @media (min-width: 1024px) {
          .d-md-grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
