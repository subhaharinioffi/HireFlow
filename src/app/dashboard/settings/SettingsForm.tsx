'use client'

import { useActionState } from 'react'
import { updateProfileName } from '@/app/actions/authActions'
import { Save, ShieldAlert, Check, User, Mail, ShieldCheck } from 'lucide-react'

interface SettingsFormProps {
  initialName: string
  email: string
  role: string
}

export default function SettingsForm({ initialName, email, role }: SettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileName, null)

  return (
    <form action={formAction}>
      {state?.error && (
        <div className="alert alert-error">
          <ShieldAlert size={18} />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="alert alert-success">
          <Check size={18} />
          <span>Full Name updated successfully.</span>
        </div>
      )}

      <div className="form-group">
        <label className="form-label" htmlFor="fullName">Full Name</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            defaultValue={initialName}
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
          <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            value={email}
            disabled
          />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Work email cannot be changed. Contact Admin for resets.</span>
      </div>

      <div className="form-group" style={{ marginBottom: '24px' }}>
        <label className="form-label">System Role Access</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
          <ShieldCheck size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '38px' }}
            value={role}
            disabled
          />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>User permission clearances are assigned by supervisors.</span>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px' }} disabled={isPending}>
        {isPending ? (
          <>
            <span className="spinner" />
            Saving...
          </>
        ) : (
          <>
            <Save size={16} />
            Update Profile
          </>
        )}
      </button>
    </form>
  )
}
