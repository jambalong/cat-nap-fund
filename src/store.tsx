import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppData, SavingsRepository } from './data/repository'

interface Store {
  data: AppData
  repo: SavingsRepository
}

const Ctx = createContext<Store | null>(null)

export function SavingsProvider({ repo, children }: { repo: SavingsRepository; children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setData(await repo.load())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load')
    }
  }, [repo])

  useEffect(() => {
    // refresh() resolves asynchronously; state is only set after the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh()
    return repo.subscribe(() => void refresh())
  }, [repo, refresh])

  // Writes go through the repo; realtime/in-memory subscriptions trigger the reload,
  // and we also reload explicitly so a dropped realtime event never leaves stale UI.
  const wrapped = useMemo<SavingsRepository>(() => {
    const after = <A extends unknown[], R>(fn: (...a: A) => Promise<R>) => async (...a: A) => {
      const r = await fn(...a)
      await refresh()
      return r
    }
    return {
      load: () => repo.load(),
      addTransaction: after(repo.addTransaction.bind(repo)),
      updateTransaction: after(repo.updateTransaction.bind(repo)),
      deleteTransaction: after(repo.deleteTransaction.bind(repo)),
      updateGoal: after(repo.updateGoal.bind(repo)),
      saveSettings: after(repo.saveSettings.bind(repo)),
      saveChecklist: after(repo.saveChecklist.bind(repo)),
      subscribe: (cb) => repo.subscribe(cb),
    }
  }, [repo, refresh])

  if (error) return <p role="alert" className="p-6">Couldn't load your jars: {error}</p>
  if (!data) return <p className="p-6" role="status">Waking the cat…</p>
  return <Ctx.Provider value={{ data, repo: wrapped }}>{children}</Ctx.Provider>
}

export function useSavings(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useSavings must be used inside SavingsProvider')
  return s
}
