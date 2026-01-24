import { createClient } from '@/lib/supabase/server'

const getAdminAllowlist = () => {
  const raw = process.env.ADMIN_EMAIL_ALLOWLIST || ''
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email?: string | null) {
  const allowlist = getAdminAllowlist()
  if (!allowlist.length) {
    return true
  }
  if (!email) {
    return false
  }
  return allowlist.includes(email.toLowerCase())
}

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }
  if (!isAdminEmail(user.email)) {
    return null
  }
  return user
}
