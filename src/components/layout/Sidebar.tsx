'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Upload, 
  FileCode, 
  FileText, 
  Mail, 
  History, 
  Settings, 
  Menu,
  X
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  userRole?: string
}

export default function Sidebar({ collapsed, mobileOpen, setMobileOpen, userRole }: SidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Candidates', href: '/dashboard/candidates', icon: Users },
    { name: 'Import Excel', href: '/dashboard/import', icon: Upload },
    { name: 'Templates', href: '/dashboard/templates', icon: FileCode, adminOnly: true },
    { name: 'Documents', href: '/dashboard/documents', icon: FileText },
    { name: 'Email Logs', href: '/dashboard/emails', icon: Mail },
    { name: 'Audit Logs', href: '/dashboard/audit', icon: History },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-logo">
          Hire<span style={{ color: 'var(--color-accent)' }}>Flow</span>
        </span>
        {mobileOpen && (
          <button 
            className="icon-btn" 
            onClick={() => setMobileOpen(false)}
            style={{ border: 'none', background: 'transparent' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            // Hide adminOnly pages for non-admins
            if (item.adminOnly && userRole !== 'Admin') {
              return null
            }

            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <li key={item.name}>
                <Link 
                  href={item.href} 
                  className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <span className="sidebar-link-text">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
        {!collapsed && <div>HireFlow Engine v1.0</div>}
      </div>
    </aside>
  )
}
