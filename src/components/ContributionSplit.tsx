import { contributionShares, contributionsByPerson } from '../lib/savings'
import { formatCents } from '../lib/money'
import type { Settings, Transaction } from '../lib/types'

export function ContributionSplit({ transactions, names }: { transactions: Transaction[]; names: Settings['names'] }) {
  const amounts = contributionsByPerson(transactions)
  const shares = contributionShares(transactions)
  return (
    <section aria-label="Who's contributed what">
      <h3 className="mb-2 font-medium">Who's contributed what</h3>
      <div className="flex h-4 overflow-hidden rounded-full bg-cream" role="img"
        aria-label={`${names.a} ${Math.round(shares.a * 100)}%, ${names.b} ${Math.round(shares.b * 100)}%`}>
        <div className="bg-peach" style={{ width: `${shares.a * 100}%` }} />
        <div className="bg-sage" style={{ width: `${shares.b * 100}%` }} />
      </div>
      <dl className="mt-2 flex justify-between text-sm">
        <div><dt className="inline">🧡 {names.a}: </dt><dd className="inline font-medium">{formatCents(amounts.a)}</dd></div>
        <div><dt className="inline">💚 {names.b}: </dt><dd className="inline font-medium">{formatCents(amounts.b)}</dd></div>
      </dl>
    </section>
  )
}
