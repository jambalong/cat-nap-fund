import { useState } from 'react'
import { formatCents, parseToCents } from '../lib/money'
import { checklistTotalCents } from '../lib/savings'
import { useSavings } from '../store'
import { inputCls, primaryBtn } from './TransactionForm'

interface Row { id: string; label: string; amount: string }

export function MoveOutChecklist() {
  const { data, repo } = useSavings()
  const [rows, setRows] = useState<Row[]>(() =>
    data.checklist.map((i) => ({ id: i.id, label: i.label, amount: i.amountCents ? (i.amountCents / 100).toFixed(2) : '' })),
  )
  const items = rows.map((r) => ({ id: r.id, label: r.label, amountCents: parseToCents(r.amount) ?? 0 }))
  const total = checklistTotalCents(items)
  const patch = (id: string, p: Partial<Row>) => setRows(rows.map((r) => (r.id === id ? { ...r, ...p } : r)))

  return (
    <section aria-label="Move-out costs" className="rounded-xl bg-base p-3">
      <h3 className="font-semibold">Move-out cost checklist</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor={`label-${r.id}`} className="text-xs">Item</label>
              <input id={`label-${r.id}`} className={inputCls} value={r.label} onChange={(e) => patch(r.id, { label: e.target.value })} />
            </div>
            <div className="w-28">
              <label htmlFor={`amt-${r.id}`} className="text-xs">Cost ($) <span className="sr-only">for {r.label}</span></label>
              <input id={`amt-${r.id}`} inputMode="decimal" className={inputCls} value={r.amount} onChange={(e) => patch(r.id, { amount: e.target.value })} />
            </div>
            <button type="button" aria-label={`Remove ${r.label}`} onClick={() => setRows(rows.filter((x) => x.id !== r.id))} className="rounded-xl px-2 py-2">✕</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setRows([...rows, { id: crypto.randomUUID(), label: 'New item', amount: '' }])} className="mt-2 rounded-xl px-3 py-1 text-sm underline">
        + Add item
      </button>
      <p className="mt-2 font-semibold" data-testid="checklist-total">Total: {formatCents(total)}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => void repo.saveChecklist(items)} className="rounded-xl border border-accent px-4 py-2.5 font-semibold">
          Save checklist
        </button>
        <button
          type="button"
          onClick={async () => { await repo.saveChecklist(items); await repo.updateGoal('moveout', { targetCents: total }) }}
          className={primaryBtn}
        >
          Use total as goal target
        </button>
      </div>
    </section>
  )
}
