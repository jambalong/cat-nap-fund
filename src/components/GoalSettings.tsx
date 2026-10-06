import { useState, type FormEvent } from 'react'
import { formatCents, parseToCents } from '../lib/money'
import { monthlyNeededCents } from '../lib/savings'
import type { Goal } from '../lib/types'
import { useSavings } from '../store'
import { inputCls } from './TransactionForm'

export function GoalSettings({ goal, balance }: { goal: Goal; balance: number }) {
  const { repo } = useSavings()
  const [target, setTarget] = useState((goal.targetCents / 100).toFixed(2))
  const [date, setDate] = useState(goal.targetDate ?? '')
  const [error, setError] = useState('')

  // Keep inputs in step when the target changes elsewhere (checklist or partner's edit).
  const [seen, setSeen] = useState(goal.targetCents)
  if (seen !== goal.targetCents) {
    setSeen(goal.targetCents)
    setTarget((goal.targetCents / 100).toFixed(2))
  }

  const monthly = monthlyNeededCents(balance, goal.targetCents, goal.targetDate, new Date())

  async function submit(e: FormEvent) {
    e.preventDefault()
    const cents = parseToCents(target)
    if (cents === null) return setError('Enter a valid target amount.')
    setError('')
    await repo.updateGoal(goal.id, { targetCents: cents, targetDate: date || null })
  }

  return (
    <details>
      <summary className="cursor-pointer font-medium">Edit goal</summary>
      <form onSubmit={submit} className="mt-2 flex flex-col gap-3">
        <div>
          <label htmlFor={`${goal.id}-target`} className="text-sm font-medium">Target amount ($)</label>
          <input id={`${goal.id}-target`} inputMode="decimal" className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${goal.id}-date`} className="text-sm font-medium">Target date (optional)</label>
          <input id={`${goal.id}-date`} type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-rose">{error}</p>}
        <button className="self-start rounded-2xl bg-sage px-4 py-2 font-semibold text-[#1f2b1c]">Save goal</button>
      </form>
      {monthly !== null && (
        <p className="mt-2 rounded-2xl bg-cream p-3" data-testid={`${goal.id}-monthly`}>
          {monthly === 0 ? 'Goal reached — time for a victory nap 😴' : `Save ${formatCents(monthly)}/month to get there on time 🐾`}
        </p>
      )}
    </details>
  )
}
