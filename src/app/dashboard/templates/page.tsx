import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TemplateManagerClient from './TemplateManagerClient'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'Admin') {
    redirect('/dashboard') // Redirect non-admins
  }

  // Fetch all templates
  const { data: templates } = await supabase
    .from('templates')
    .select('*')

  return (
    <div>
      <div className="page-title-section">
        <div>
          <h1 className="page-title">Document Templates</h1>
          <p className="page-subtitle">Configure core layout, signatures, logos, and placeholders for generated certificates and offers</p>
        </div>
      </div>

      <TemplateManagerClient initialTemplates={templates || []} />
    </div>
  )
}
