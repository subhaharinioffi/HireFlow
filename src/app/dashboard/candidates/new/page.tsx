'use client'

import { useActionState } from 'react'
import { createCandidate } from '@/app/actions/candidateActions'
import Link from 'next/link'
import { ArrowLeft, UserPlus, ShieldAlert, Check } from 'lucide-react'

export default function NewCandidatePage() {
  const [state, formAction, isPending] = useActionState(createCandidate, null)

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/dashboard/candidates" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          <ArrowLeft size={14} /> Back to Directory
        </Link>
        <h1 className="page-title">Add Candidate</h1>
        <p className="page-subtitle">Enter details to enroll a new candidate and draft a document</p>
      </div>

      <div className="card">
        {state?.success ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifycontent: 'center', margin: '0 auto 16px' }}>
              <Check size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>Candidate Created!</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              The candidate record was added as a <strong>Draft</strong>. It is now visible in the directory and ready for template mapping.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/dashboard/candidates" className="btn btn-secondary">View Directory</Link>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                Add Another
              </button>
            </div>
          </div>
        ) : (
          <form action={formAction}>
            {state?.error && (
              <div className="alert alert-error">
                <ShieldAlert size={18} />
                <span>{state.error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="candidateId">Candidate ID (Unique)</label>
                <input
                  id="candidateId"
                  name="candidateId"
                  type="text"
                  placeholder="CAN-2026-001"
                  className="form-control"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  className="form-control"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane.doe@example.com"
                className="form-control"
                required
                disabled={isPending}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="roleCourse">Role or Course</label>
                <input
                  id="roleCourse"
                  name="roleCourse"
                  type="text"
                  placeholder="Software Engineer / Web Design"
                  className="form-control"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="joiningDate">Joining Date</label>
                <input
                  id="joiningDate"
                  name="joiningDate"
                  type="date"
                  className="form-control"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="salary">Salary ($)</label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  placeholder="75000"
                  className="form-control"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="documentType">Document Type</label>
                <select
                  id="documentType"
                  name="documentType"
                  className="form-control"
                  required
                  disabled={isPending}
                >
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Internship Offer Letter">Internship Offer Letter</option>
                  <option value="Training Certificate">Training Certificate</option>
                  <option value="Completion Certificate">Completion Certificate</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px', marginTop: '16px' }} disabled={isPending}>
              {isPending ? (
                <>
                  <span className="spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Add Candidate
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
