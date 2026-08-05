'use client'

import { useActionState } from 'react'
import { updateCandidate } from '@/app/actions/candidateActions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Save, ShieldAlert, Check } from 'lucide-react'

interface EditCandidateFormProps {
  candidate: any
}

export default function EditCandidateForm({ candidate }: EditCandidateFormProps) {
  const router = useRouter()
  // Bind candidate ID to updateCandidate server action
  const updateWithId = updateCandidate.bind(null, candidate.id)
  const [state, formAction, isPending] = useActionState(updateWithId, null)

  return (
    <div>
      {state?.success ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Check size={24} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>Candidate Updated!</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
            The candidate metrics have been revised successfully in the database.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/dashboard/candidates" className="btn btn-secondary">View Directory</Link>
            <button className="btn btn-primary" onClick={() => { router.refresh(); router.push('/dashboard/candidates'); }}>
              Done
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
              <label className="form-label">Candidate ID</label>
              <input
                type="text"
                className="form-control"
                value={candidate.candidate_id}
                disabled
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Unique ID cannot be altered.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={candidate.full_name}
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
              defaultValue={candidate.email}
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
                defaultValue={candidate.role_course}
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
                defaultValue={candidate.joining_date}
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
                defaultValue={candidate.salary}
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
                defaultValue={candidate.document_type}
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

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <Link href="/dashboard/candidates" className="btn btn-secondary" disabled={isPending}>
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" style={{ gap: '8px' }} disabled={isPending}>
              {isPending ? (
                <>
                  <span className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
