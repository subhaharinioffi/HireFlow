'use client'

import { useState, useRef, useEffect } from 'react'
import { logout } from '@/app/actions/authActions'
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Settings 
} from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  collapsed: boolean
  setCollapsed: (c: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  userName?: string
  userEmail?: string
  userRole?: string
}

export default function Header({ 
  collapsed, 
  setCollapsed, 
  mobileOpen, 
  setMobileOpen,
  userName,
  userEmail,
  userRole
}: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  // Get initials for profile avatar
  const getInitials = (name?: string) => {
    if (!name) return 'HR'
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="header">
      <div className="header-left">
        {/* Toggle button for large screens */}
        <button 
          className="icon-btn" 
          onClick={() => setCollapsed(!collapsed)}
          style={{ display: 'none' }}
          className="icon-btn d-md-flex" /* We will show it by default except mobile */
        >
          <Menu size={18} />
        </button>

        {/* Toggle button for mobile screens */}
        <button 
          className="icon-btn d-mobile" 
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: 'flex' }}
        >
          <Menu size={18} />
        </button>

        <div className="breadcrumbs">
          <span>Portal</span>
          <span>/</span>
          <span className="breadcrumbs-active">Dashboard</span>
        </div>
      </div>

      <div className="header-right">
        <button className="icon-btn" aria-label="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--color-accent)', borderRadius: '50%' }} />
        </button>

        <div className="profile-menu" ref={dropdownRef}>
          <button 
            className="profile-trigger" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className="profile-avatar">
              {getInitials(userName)}
            </div>
            <div className="profile-details" style={{ display: 'none' }} className="profile-details d-md-flex">
              <span className="profile-name">{userName || 'HR Portal User'}</span>
              <span className="profile-role">{userRole || 'HR Executive'}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)' }}>{userName}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>{userEmail}</div>
              </div>

              <div style={{ padding: '4px 0' }}>
                <Link href="/dashboard/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <Settings size={14} />
                  <span>Account Settings</span>
                </Link>
                <div className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Role: {userRole}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', padding: '4px 0' }}>
                <button 
                  onClick={handleLogout} 
                  className="dropdown-item" 
                  style={{ color: 'var(--color-error)', width: '100%', cursor: 'pointer' }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* Display control rules */
        @media (max-width: 768px) {
          .d-md-flex { display: none !important; }
          .d-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .d-md-flex { display: flex !important; }
          .d-mobile { display: none !important; }
        }
      `}</style>
    </header>
  )
}
