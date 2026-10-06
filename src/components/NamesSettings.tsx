import { useState, type FormEvent } from 'react'
import { useSavings } from '../store'
import { inputCls } from './TransactionForm'

export function NamesSettings() {
  const { data, repo } = useSavings()
  const [a, setA] = useState(data.settings.names.a)
  const [b, setB] = useState(data.settings.names.b)

  async function submit(e: FormEvent) {
    e.preventDefault()
    await repo.saveSettings({ ...data.settings, names: { a: a.trim() || 'John', b: b.trim() || 'Partner' } })
  }

  return (
    <details className="rounded-3xl bg-card p-5 shadow-soft">
      <summary className="cursor-pointer text-lg font-semibold">Settings</summary>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-3">
        <div>
          <label htmlFor="name-a" className="text-sm font-medium">First person's name</label>
          <input id="name-a" className={inputCls} value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div>
          <label htmlFor="name-b" className="text-sm font-medium">Second person's name</label>
          <input id="name-b" className={inputCls} value={b} onChange={(e) => setB(e.target.value)} />
        </div>
        <button className="self-start rounded-2xl bg-sage px-4 py-2 font-semibold text-[#1f2b1c]">Save names</button>
      </form>
    </details>
  )
}
