import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Index() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin' || user.email === 'dripmich@gmail.com' || user.email === 'thealphamich@gmail.com') {
      return redirect('/admin')
    }
    return redirect('/dashboard')
  }

  return redirect('/login')
}
