import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { InMemoryRepository } from './data/inMemoryRepository'
import { toIsoDate } from './lib/dates'

const setup = (repo = new InMemoryRepository()) => {
  const user = userEvent.setup()
  render(<App repo={repo} />)
  return { user, repo }
}
const card = async (name: string) => within(await screen.findByRole('article', { name: new RegExp(name) }))

async function deposit(user: ReturnType<typeof userEvent.setup>, goal: string, amount: string, opts: { who?: string; note?: string } = {}) {
  const c = await card(goal)
  await user.click(c.getByRole('button', { name: 'Add deposit' }))
  const form = within(c.getByRole('form', { name: 'Add entry' }))
  await user.type(form.getByLabelText('Amount ($)'), amount)
  if (opts.who) await user.selectOptions(form.getByLabelText('Who'), opts.who)
  if (opts.note) await user.type(form.getByLabelText(/Note/), opts.note)
  await user.click(form.getByRole('button', { name: 'Save' }))
}

describe('dashboard', () => {
  it('shows both goals with the cozy copy', async () => {
    setup()
    expect(await screen.findByRole('heading', { name: /Emergency Fund/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Move-Out Fund/ })).toBeInTheDocument()
    expect(screen.getAllByText(/fresh, empty jar/).length).toBe(2)
  })

  it('a deposit updates balance, progress, message, history and split', async () => {
    const { user } = setup()
    await deposit(user, 'Emergency', '620', { who: 'Partner', note: 'tax refund' })
    const c = await card('Emergency')
    expect(await c.findByTestId('emergency-balance')).toHaveTextContent('$620.00')
    expect(c.getByTestId('emergency-percent')).toHaveTextContent('6%')
    expect(c.getByText(/6% of the way to a cozy nap/)).toBeInTheDocument()
    expect(c.getByText(/tax refund/)).toBeInTheDocument()
    expect(c.getByRole('img', { name: /Partner 100%/ })).toBeInTheDocument()
    expect(c.getByRole('img', { name: /Emergency Fund jar is 6% full/ })).toBeInTheDocument()
    // other goal untouched
    expect((await card('Move-Out')).getByTestId('moveout-balance')).toHaveTextContent('$0.00')
  })

  it('withdrawals reduce the balance', async () => {
    const { user } = setup()
    await deposit(user, 'Emergency', '500')
    const c = await card('Emergency')
    await user.click(c.getByRole('button', { name: 'Withdraw' }))
    const form = within(c.getByRole('form', { name: 'Add entry' }))
    await user.type(form.getByLabelText('Amount ($)'), '120.50')
    await user.click(form.getByRole('button', { name: 'Save' }))
    expect(await c.findByTestId('emergency-balance')).toHaveTextContent('$379.50')
  })

  it('rejects an empty amount', async () => {
    const { user } = setup()
    const c = await card('Emergency')
    await user.click(c.getByRole('button', { name: 'Add deposit' }))
    await user.click(within(c.getByRole('form', { name: 'Add entry' })).getByRole('button', { name: 'Save' }))
    expect(c.getByRole('alert')).toHaveTextContent(/amount/)
    expect(c.getByTestId('emergency-balance')).toHaveTextContent('$0.00')
  })

  it('lists newest first, and supports edit and delete', async () => {
    const repo = new InMemoryRepository()
    await repo.addTransaction({ goalId: 'emergency', type: 'deposit', amountCents: 1000, person: 'a', note: 'older', date: '2026-01-01' })
    await repo.addTransaction({ goalId: 'emergency', type: 'deposit', amountCents: 2000, person: 'a', note: 'newer', date: '2026-02-01' })
    const { user } = setup(repo)
    const c = await card('Emergency')
    const items = c.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('newer')
    expect(items[1]).toHaveTextContent('older')

    await user.click(c.getByRole('button', { name: 'Edit newer' }))
    const amount = c.getByLabelText('Amount ($)')
    await user.clear(amount)
    await user.type(amount, '50')
    await user.click(within(c.getByRole('form', { name: 'Edit entry' })).getByRole('button', { name: 'Save' }))
    expect(await c.findByTestId('emergency-balance')).toHaveTextContent('$60.00')

    await user.click(c.getByRole('button', { name: 'Delete older' }))
    expect(await c.findByTestId('emergency-balance')).toHaveTextContent('$50.00')
  })

  it('celebrates when a milestone is crossed, not on load', async () => {
    const repo = new InMemoryRepository()
    await repo.updateGoal('emergency', { targetCents: 10000 })
    await repo.addTransaction({ goalId: 'emergency', type: 'deposit', amountCents: 2000, person: 'a', note: '', date: '2026-01-01' })
    const { user } = setup(repo)
    const c = await card('Emergency')
    expect(c.queryByText(/Milestone reached/)).not.toBeInTheDocument()
    await deposit(user, 'Emergency', '10') // 20% -> 30%
    expect(await c.findByText(/Milestone reached: 25%/)).toBeInTheDocument()
  })

  it('shows monthly savings needed for a target date', async () => {
    const repo = new InMemoryRepository()
    const d = new Date()
    d.setMonth(d.getMonth() + 10)
    await repo.updateGoal('emergency', { targetCents: 100000, targetDate: toIsoDate(d) })
    setup(repo)
    const c = await card('Emergency')
    expect(c.getByTestId('emergency-monthly')).toHaveTextContent('Save $100.00/month')
  })

  it('edits target and date from the goal form', async () => {
    const { user } = setup()
    const c = await card('Move-Out')
    await user.click(c.getByText('Edit goal'))
    const target = c.getByLabelText('Target amount ($)')
    await user.clear(target)
    await user.type(target, '5000')
    await user.click(c.getByRole('button', { name: 'Save goal' }))
    expect(await c.findByText(/of \$5,000\.00/)).toBeInTheDocument()
  })

  it('emergency helper shows how many months are covered', async () => {
    const { user } = setup()
    await deposit(user, 'Emergency', '9000')
    const c = await card('Emergency')
    await user.type(c.getByLabelText('Monthly expenses ($)'), '3000')
    await user.click(within(c.getByRole('region', { name: 'Emergency runway' })).getByRole('button', { name: 'Save' }))
    expect(await c.findByTestId('covers')).toHaveTextContent('Covers 3 months')
  })

  it('move-out checklist total becomes the goal target', async () => {
    const { user } = setup()
    const c = await card('Move-Out')
    await user.type(c.getByLabelText(/Cost.*First month's rent/), '2000')
    await user.type(c.getByLabelText(/Cost.*Security deposit/), '1500.50')
    expect(c.getByTestId('checklist-total')).toHaveTextContent('$3,500.50')
    await user.click(c.getByRole('button', { name: 'Use total as goal target' }))
    expect(await c.findByText(/of \$3,500\.50/)).toBeInTheDocument()
  })

  it('checklist items can be added and removed', async () => {
    const { user } = setup()
    const c = await card('Move-Out')
    await user.click(c.getByRole('button', { name: '+ Add item' }))
    expect(c.getByDisplayValue('New item')).toBeInTheDocument()
    await user.click(c.getByRole('button', { name: 'Remove Movers' }))
    expect(c.queryByDisplayValue('Movers')).not.toBeInTheDocument()
  })

  it('configurable names flow into the forms and split', async () => {
    const { user } = setup()
    await user.click(await screen.findByText('Settings'))
    const second = screen.getByLabelText("Second person's name")
    await user.clear(second)
    await user.type(second, 'Mochi')
    await user.click(screen.getByRole('button', { name: 'Save names' }))
    await deposit(user, 'Emergency', '40', { who: 'Mochi' })
    const c = await card('Emergency')
    expect(await c.findByText(/by Mochi/)).toBeInTheDocument()
  })
})
