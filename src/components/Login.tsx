import { useState, type FormEvent } from 'react'
import type { SignInOutcome, SignInResult } from '../data/auth'
import { CatMascot } from './CatMascot'

interface Props {
  onSubmit: (email: string) => Promise<SignInOutcome>
  onVerify: (email: string, code: string) => Promise<SignInOutcome>
}

const MESSAGES: Record<SignInResult, string> = {
  sent: 'Check your inbox. A cozy magic link is on its way 🐾',
  'not-invited': "Hmm, this nap spot is invite-only and that email isn't on the list 🐱",
  error: 'Something went wrong. Please try again in a moment.',
}

export function Login({ onSubmit, onVerify }: Props) {
  const [email, setEmail] = useState('')
  const [outcome, setOutcome] = useState<SignInOutcome | null>(null)
  const [busy, setBusy] = useState(false)
  const [code, setCode] = useState('')
  const [codeOutcome, setCodeOutcome] = useState<SignInOutcome | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setOutcome(await onSubmit(email))
    setBusy(false)
  }

  async function verify(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setCodeOutcome(await onVerify(email, code))
    setBusy(false)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 p-6 text-center">
      <CatMascot className="h-32 w-44" />
      <h1 className="text-3xl font-semibold">Cat Nap Fund</h1>
      <p className="text-muted">Sign in with a magic link to peek at your shared jars.</p>
      <form onSubmit={submit} className="flex w-full flex-col gap-3">
        <label className="text-left text-sm font-semibold" htmlFor="login-email">Email</label>
        <input
          id="login-email" type="email" required autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-surface bg-mantle px-4 py-3 text-ink"
        />
        <button disabled={busy} className="rounded-xl bg-accent px-4 py-3 font-semibold text-onaccent disabled:opacity-60">
          {busy ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
      {outcome && (
        <p role="status" className="rounded-xl border border-surface bg-mantle p-3">
          {MESSAGES[outcome.result]}
          {outcome.detail && <span className="mt-1 block text-sm text-muted">Details: {outcome.detail}</span>}
        </p>
      )}
      {outcome?.result === 'sent' && (
        <form onSubmit={verify} className="flex w-full flex-col gap-3">
          <p className="text-sm text-muted">
            Installed the app on your phone? Links open in Safari, so type the code from the email here instead.
          </p>
          <label className="text-left text-sm font-semibold" htmlFor="login-code">Code from the email</label>
          <input
            id="login-code" inputMode="numeric" autoComplete="one-time-code" required value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-xl border border-surface bg-mantle px-4 py-3 text-center text-xl tracking-widest text-ink"
          />
          <button disabled={busy} className="rounded-xl border border-accent px-4 py-3 font-semibold disabled:opacity-60">
            Sign in with code
          </button>
          {codeOutcome?.result === 'error' && (
            <p role="alert" className="text-sm font-semibold text-red">
              That code didn't work. It may have expired, so request a new one. ({codeOutcome.detail})
            </p>
          )}
        </form>
      )}
    </main>
  )
}
