import { useState, type FormEvent } from 'react'
import { parseToCents } from '../lib/money'
import { monthsCovered } from '../lib/savings'
import { useSavings } from '../store'
import { inputCls } from './TransactionForm'

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
    <section aria-label="Emergency runway" className="rounded-2xl bg-cream p-3">
      <h3 className="font-medium">How long would this last?</h3>
      <form onSubmit={submit} className="mt-2 flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="monthly-expenses" className="text-sm font-medium">Monthly expenses ($)</label>
          <input id="monthly-expenses" inputMode="decimal" className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <button className="rounded-2xl bg-sage px-4 py-2 font-semibold text-[#1f2b1c]">Save</button>
      </form>
      {covered !== null && (
        <p className="mt-2 font-medium" data-testid="covers">Covers {covered} {covered === 1 ? 'month' : 'months'} of expenses 🐱</p>
      )}
    </section>
  )
}
