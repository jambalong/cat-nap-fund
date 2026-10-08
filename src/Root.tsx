import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import App from './App'
import { amIInvited, getSession, onAuthChange, sendMagicLink, signOut, verifyCode } from './data/auth'
import { SupabaseRepository } from './data/supabaseRepository'
import { isSupabaseConfigured, supabase } from './data/supabaseClient'
import { Login } from './components/Login'

function Authed({ session }: { session: Session }) {
  const [invited, setInvited] = useState<boolean | null>(null)
  const repo = useMemo(() => new SupabaseRepository(supabase!), [])
  useEffect(() => {
    void amIInvited().then(setInvited)
  }, [session])

  if (invited === null) return <p className="p-6" role="status">Waking the cat…</p>
  if (!invited) {
    return (
      <main className="mx-auto max-w-sm p-6 text-center">
        <h1 className="text-2xl font-semibold">Not on the guest list 🐱</h1>
        <p className="my-4">{session.user.email} hasn't been invited to this nap spot yet.</p>
        <button onClick={() => void signOut()} className="rounded-xl bg-accent px-4 py-3 font-semibold text-onaccent">Sign out</button>
      </main>
    )
  }
  return <App repo={repo} onSignOut={() => void signOut()} />
}

/** Without Supabase env vars the app runs on the in-memory repo (local dev only). */
export default function Root() {
  const [session, setSession] = useState<Session | null | undefined>(isSupabaseConfigured ? undefined : null)
  useEffect(() => {
    if (!isSupabaseConfigured) return
    void getSession().then(setSession)
    return onAuthChange(setSession)
  }, [])

  if (!isSupabaseConfigured) return <App />
  if (session === undefined) return <p className="p-6" role="status">Waking the cat…</p>
  if (!session) return <Login onSubmit={sendMagicLink} onVerify={verifyCode} />
  return <Authed session={session} />
}
