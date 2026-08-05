'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Please enter both email and password.' }
  }
  
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Record login event in audit logs if possible
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'User Login',
      entity_type: 'auth',
      details: `User logged in successfully: ${email}`
    })
  }

  redirect('/dashboard')
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  if (!email || !password || !fullName || !role) {
    return { error: 'All fields are required.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Log user creation
  if (data?.user) {
    await supabase.from('audit_logs').insert({
      user_id: data.user.id,
      action: 'User Signup',
      entity_type: 'auth',
      details: `New account created: ${email} with role: ${role}`
    })
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'User Logout',
      entity_type: 'auth',
      details: `User logged out: ${user.email}`
    })
  }
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updateProfileName(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized.' }
  }

  const fullName = formData.get('fullName') as string
  if (!fullName) {
    return { error: 'Full Name is required.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Update user auth metadata
  await supabase.auth.updateUser({
    data: { full_name: fullName }
  })

  // Record audit log
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'Profile Updated',
    entity_type: 'auth',
    details: `Updated full name to: ${fullName}`
  })

  return { success: true }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  if (!password) {
    return { error: 'Password is required.' }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  // Record audit log
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'Password Reset Successful',
      entity_type: 'auth',
      details: 'User successfully updated their account password.'
    })
  }

  redirect('/login')
}


