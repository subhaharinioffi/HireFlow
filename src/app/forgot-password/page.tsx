'use client'

import { useActionState, useState } from 'react'
import { forgotPassword } from '@/app/actions/authActions'
import Link from 'next/link'
import { Mail, ArrowRight, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPassword, null)
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
            Enter your email to receive a password reset link from Supabase.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div style={{ marginBottom: '24px' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Reset password</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              We will send you a secure link to reset your account credentials.
            </p>
          </div>

          {state?.success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ color: 'var(--color-success)', marginBottom: '16px' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>Email Dispatched</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
                If this email exists in our records, a secure password recovery message has been sent. Please check your inbox.
              </p>
            </div>
          ) : (
            <form action={formAction}>
              {state?.error && (
                <div className="alert alert-error">
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <span>{state.error}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" htmlFor="email">Work Email</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    className="form-control"
                    style={{ paddingLeft: '38px', textTransform: 'lowercase' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px' }} disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="spinner" />
                    Sending link...
                  </>
                ) : (
                  <>
                    Send Recovery Email
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
