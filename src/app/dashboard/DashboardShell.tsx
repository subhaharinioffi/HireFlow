'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

interface DashboardShellProps {
  children: React.ReactNode
  userName?: string
  userEmail?: string
  userRole?: string
}

export default function DashboardShell({ 
  children, 
  userName, 
  userEmail, 
  userRole 
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="dashboard-layout">
      <Sidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        userRole={userRole}
      />
      <div className="main-viewport">
        <Header 
          collapsed={collapsed} 
          setCollapsed={setCollapsed} 
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
        />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}
