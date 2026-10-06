import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from './Login'

async function submit(result: 'sent' | 'not-invited' | 'error') {
  const onSubmit = vi.fn().mockResolvedValue(result)
  render(<Login onSubmit={onSubmit} />)
  await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
  await userEvent.click(screen.getByRole('button', { name: 'Send magic link' }))
  return onSubmit
}

describe('Login', () => {
  it('sends the typed email and confirms', async () => {
    const onSubmit = await submit('sent')
    expect(onSubmit).toHaveBeenCalledWith('a@b.co')
    expect(await screen.findByRole('status')).toHaveTextContent(/magic link is on its way/)
  })
  it('shows a friendly not-invited message', async () => {
    await submit('not-invited')
    expect(await screen.findByRole('status')).toHaveTextContent(/invite-only/)
  })
  it('shows an error message', async () => {
    await submit('error')
    expect(await screen.findByRole('status')).toHaveTextContent(/went wrong/)
  })
})
