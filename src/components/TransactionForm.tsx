import { useState, type FormEvent } from 'react'
import { parseToCents } from '../lib/money'
import type { GoalId, NewTransaction, Person, Settings, Transaction, TxType } from '../lib/types'
import { toIsoDate } from '../lib/dates'

interface Props {
  goalId: GoalId
  names: Settings['names']
  initial?: Transaction
  defaultType?: TxType
  onSave: (tx: NewTransaction) => Promise<void> | void
  onCancel: () => void
}

export const inputCls = 'w-full rounded-2xl border-2 border-peach/60 bg-card px-3 py-2 text-ink'

export function TransactionForm({ goalId, names, initial, defaultType = 'deposit', onSave, onCancel }: Props) {
  const [type, setType] = useState<TxType>(initial?.type ?? defaultType)
  const [amount, setAmount] = useState(initial ? (initial.amountCents / 100).toFixed(2) : '')
  const [person, setPerson] = useState<Person>(initial?.person ?? 'a')
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(initial?.date ?? toIsoDate(new Date()))
  const [error, setError] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    const cents = parseToCents(amount)
    if (!cents) return setError('Enter an amount greater than $0.')
    if (!date) return setError('Pick a date.')
    setError('')
    await onSave({ goalId, type, amountCents: cents, person, note: note.trim(), date })
  }

  const id = `${goalId}-${initial?.id ?? 'new'}`
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl bg-cream p-3" aria-label={initial ? 'Edit entry' : 'Add entry'}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-type`} className="text-sm font-medium">Type</label>
          <select id={`${id}-type`} className={inputCls} value={type} onChange={(e) => setType(e.target.value as TxType)}>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-amount`} className="text-sm font-medium">Amount ($)</label>
          <input id={`${id}-amount`} inputMode="decimal" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label htmlFor={`${id}-who`} className="text-sm font-medium">Who</label>
          <select id={`${id}-who`} className={inputCls} value={person} onChange={(e) => setPerson(e.target.value as Person)}>
            <option value="a">{names.a}</option>
            <option value="b">{names.b}</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-date`} className="text-sm font-medium">Date</label>
          <input id={`${id}-date`} type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-note`} className="text-sm font-medium">Note (optional)</label>
        <input id={`${id}-note`} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm font-medium text-rose">{error}</p>}
      <div className="flex gap-2">
        <button className="rounded-2xl bg-sage px-4 py-2 font-semibold text-[#1f2b1c]">Save</button>
        <button type="button" onClick={onCancel} className="rounded-2xl px-4 py-2 font-medium underline">Cancel</button>
      </div>
    </form>
  )
}
