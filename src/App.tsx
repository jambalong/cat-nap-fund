import { useMemo } from 'react'
import { InMemoryRepository } from './data/inMemoryRepository'
import type { SavingsRepository } from './data/repository'
import { balanceCents } from './lib/savings'
import { EmergencyHelper } from './components/EmergencyHelper'
import { GoalCard } from './components/GoalCard'
import { MoveOutChecklist } from './components/MoveOutChecklist'
import { NamesSettings } from './components/NamesSettings'
import { SavingsProvider, useSavings } from './store'

function Dashboard({ onSignOut }: { onSignOut?: () => void }) {
  const { data } = useSavings()
  const bal = (id: string) => balanceCents(data.transactions.filter((t) => t.goalId === id))
  return (
    <main className="mx-auto flex max-w-md flex-col gap-5 px-4 pb-10 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cat Nap Fund 🐾</h1>
        {onSignOut && <button onClick={onSignOut} className="rounded-xl px-2 py-1 text-sm underline">Sign out</button>}
      </header>
      {data.goals.map((g) => (
        <GoalCard key={g.id} goal={g}>
          {g.id === 'emergency' ? <EmergencyHelper balance={bal(g.id)} /> : <MoveOutChecklist />}
        </GoalCard>
      ))}
      <NamesSettings />
      <p className="text-center text-sm text-muted">🪴 ☕ 🏠 sweet dreams, you two</p>
    </main>
  )
}

export default function App({ repo, onSignOut }: { repo?: SavingsRepository; onSignOut?: () => void }) {
  const fallback = useMemo(() => repo ?? new InMemoryRepository(), [repo])
  return (
    <SavingsProvider repo={fallback}>
      <Dashboard onSignOut={onSignOut} />
    </SavingsProvider>
  )
}
