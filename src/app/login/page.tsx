'use client'

import { useActionState, useState } from 'react'
import { login } from '@/app/actions/authActions'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="auth-container">
      <div className="auth-visual-side">
        <div className="auth-visual-grid" />
        <div className="auth-visual-content">
          <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Hire<span style={{ color: 'var(--color-accent)' }}>Flow</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginBottom: '32px' }}>
            The enterprise engine for HR document generation, compliance automation, and secure email delivery.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>Why Enterprise HR Teams trust HireFlow</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span> Secure document storage & signed download URLs
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span> End-to-end data encryption and RLS protocols
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span> Precise audit logs and candidate approval workflows
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Welcome back</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Enter your credentials to access HireFlow</p>
          </div>

          <form action={formAction}>
            {state?.error && (
              <div className="alert alert-error">
                <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                <span>{state.error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Work Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="password">Password</label>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Forgot password?
                </Link>
              </div>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px' }} disabled={isPending}>
              {isPending ? (
                <>
                  <span className="spinner" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="auth-link">
            Don&apos;t have an account? 
            <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
