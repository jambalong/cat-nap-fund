import { useState, type FormEvent } from 'react'
import { parseToCents } from '../lib/money'
import { monthsCovered } from '../lib/savings'
import { useSavings } from '../store'
import { inputCls, primaryBtn } from './TransactionForm'

export function EmergencyHelper({ balance }: { balance: number }) {
  const { data, repo } = useSavings()
  const [value, setValue] = useState(data.settings.monthlyExpensesCents ? (data.settings.monthlyExpensesCents / 100).toFixed(2) : '')
  const covered = monthsCovered(balance, data.settings.monthlyExpensesCents)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const cents = parseToCents(value) ?? 0
    await repo.saveSettings({ ...data.settings, monthlyExpensesCents: cents })
  }

  return (
    <section aria-label="Emergency runway" className="rounded-xl bg-base p-3">
      <h3 className="font-semibold">How long would this last?</h3>
      <form onSubmit={submit} className="mt-2 flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="monthly-expenses" className="text-sm font-semibold">Monthly expenses ($)</label>
          <input id="monthly-expenses" inputMode="decimal" className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <button className={primaryBtn}>Save</button>
      </form>
      {covered !== null && (
        <p className="mt-2 font-semibold" data-testid="covers">Covers {covered} {covered === 1 ? 'month' : 'months'} of expenses 🐱</p>
      )}
    </section>
  )
}
