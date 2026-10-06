import { useEffect, useState, type ReactNode } from 'react'
import { formatCents } from '../lib/money'
import { balanceCents, crossedMilestone, napMessage, progressPercent } from '../lib/savings'
import type { Goal, NewTransaction, TxType } from '../lib/types'
import { useSavings } from '../store'
import { CatMascot } from './CatMascot'
import { GoalSettings } from './GoalSettings'
import { History } from './History'
import { Jar } from './Jar'
import { Sparkles } from './Sparkles'
import { TransactionForm } from './TransactionForm'

export function GoalCard({ goal, children }: { goal: Goal; children?: ReactNode }) {
  const { data, repo } = useSavings()
  const txs = data.transactions.filter((t) => t.goalId === goal.id)
  const balance = balanceCents(txs)
  const percent = progressPercent(balance, goal.targetCents)

  const [adding, setAdding] = useState<TxType | null>(null)
  const [prev, setPrev] = useState(percent)
  const [milestone, setMilestone] = useState<number | null>(null)
  if (percent !== prev) {
    setPrev(percent)
    const crossed = crossedMilestone(prev, percent)
    if (crossed) setMilestone(crossed)
  }
  useEffect(() => {
    if (!milestone) return
    const t = setTimeout(() => setMilestone(null), 4500)
    return () => clearTimeout(t)
  }, [milestone])

  async function save(tx: NewTransaction) {
    await repo.addTransaction(tx)
    setAdding(null)
  }

  return (
    <article aria-labelledby={`${goal.id}-title`} className="relative rounded-2xl border border-surface bg-mantle p-5 shadow-soft">
      {milestone && <Sparkles />}
      <h2 id={`${goal.id}-title`} className="text-xl font-bold">{goal.name} <span aria-hidden="true">🐾</span></h2>
      <div className="mt-3 flex items-end gap-2">
        <Jar percent={percent} label={goal.name} />
        <CatMascot className="w-full max-w-[13rem] pt-6" wiggle={milestone !== null} />
      </div>
      <p className="mt-3 text-3xl font-bold" data-testid={`${goal.id}-balance`}>{formatCents(balance)}</p>
      <p className="text-muted">of {formatCents(goal.targetCents)} · <span data-testid={`${goal.id}-percent`}>{percent}%</span></p>
      <p className="mt-1">{napMessage(percent)}</p>
      {milestone && <p role="status" className="mt-2 rounded-xl bg-green/20 p-2 font-semibold">Purrfect! Milestone reached: {milestone}% 🎉</p>}

      <div className="mt-4 flex gap-2">
        <button onClick={() => setAdding('deposit')} className="flex-1 rounded-xl bg-accent px-4 py-3 font-semibold text-onaccent">
          Add deposit
        </button>
        <button onClick={() => setAdding('withdrawal')} className="flex-1 rounded-xl border border-accent px-4 py-3 font-semibold">
          Withdraw
        </button>
      </div>
      {adding && (
        <div className="mt-3">
          <TransactionForm goalId={goal.id} defaultType={adding} onSave={save} onCancel={() => setAdding(null)} />
        </div>
      )}

      <div className="mt-5 flex flex-col gap-5">
        <GoalSettings goal={goal} balance={balance} />
        {children}
        <section aria-label={`${goal.name} history`}>
          <h3 className="mb-2 font-semibold">History</h3>
          <History goalId={goal.id} transactions={txs} />
        </section>
      </div>
    </article>
  )
}
