import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from './DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the profile for this user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <DashboardShell 
      userName={profile?.full_name || user.email?.split('@')[0] || 'HR User'} 
      userEmail={user.email} 
      userRole={profile?.role || 'HR Executive'}
    >
      {children}
    </DashboardShell>
  )
}
