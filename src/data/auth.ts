import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export type SignInResult = 'sent' | 'not-invited' | 'error'

/** Checks the allowlist first so uninvited emails get a friendly message instead of a link. */
export async function sendMagicLink(email: string): Promise<SignInResult> {
  if (!supabase) return 'error'
  const clean = email.trim().toLowerCase()
  const { data, error: rpcError } = await supabase.rpc('is_email_invited', { check_email: clean })
  if (rpcError) return 'error'
  if (!data) return 'not-invited'
  const { error } = await supabase.auth.signInWithOtp({
    email: clean,
    options: { emailRedirectTo: window.location.origin },
  })
  return error ? 'error' : 'sent'
}

export const signOut = () => supabase?.auth.signOut()

export async function getSession(): Promise<Session | null> {
  return (await supabase?.auth.getSession())?.data.session ?? null
}

export function onAuthChange(cb: (s: Session | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, s) => cb(s))
  return () => data.subscription.unsubscribe()
}

/** True when the signed-in user is on the allowlist (RLS only returns rows to allowed users). */
export async function amIInvited(): Promise<boolean> {
  if (!supabase) return true
  const { count, error } = await supabase.from('allowed_users').select('email', { count: 'exact', head: true })
  return !error && (count ?? 0) > 0
}
