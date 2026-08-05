'use client'

import { useActionState, useState } from 'react'
import { signup } from '@/app/actions/authActions'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ArrowRight, User, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signup, null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <div className="auth-container">
      <div className="auth-visual-side">
        <div className="auth-visual-grid" />
        <div className="auth-visual-content">
          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Hire<span style={{ color: 'var(--color-accent)' }}>Flow</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
            Transforming corporate document issuance and verification with absolute trust and seamless delivery.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Role Permissions Summary</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <li>
                <strong>HR Executive:</strong> Create candidates, upload Excel files, edit drafts, and view records.
              </li>
              <li>
                <strong>HR Manager:</strong> Approve or reject drafts, generate PDFs, and send individual emails.
              </li>
              <li>
                <strong>Admin:</strong> Complete system control, template configuration, and bulk document dispatches.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card" style={{ maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Create your account</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Get started with HireFlow HR Portal</p>
          </div>

          {state?.success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ color: 'var(--color-success)', marginBottom: '16px' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>Registration Successful!</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
                Your account is ready. Although Supabase typically requires email confirmation, we have auto-confirmed your credentials for instant evaluation.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form action={formAction}>
              {state?.error && (
                <div className="alert alert-error">
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <span>{state.error}</span>
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
                    placeholder="Jane Doe"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Work Email</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane.doe@company.com"
                    className="form-control"
                    style={{ paddingLeft: '38px', textTransform: 'lowercase' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    required
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    aria-label="Toggle password visibility"
                    disabled={isPending}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="role">Requested Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-control"
                  defaultValue="HR Executive"
                  required
                  disabled={isPending}
                  style={{ cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%239ca3af\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '18px' }}
                >
                  <option value="HR Executive">HR Executive</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px' }} disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="spinner" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {!state?.success && (
            <p className="auth-link">
              Already have an account? 
              <Link href="/login">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
