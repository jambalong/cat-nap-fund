import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Login } from './Login'

async function submit(result: 'sent' | 'not-invited' | 'error', detail?: string) {
  const onSubmit = vi.fn().mockResolvedValue({ result, detail })
  const onVerify = vi.fn().mockResolvedValue({ result: 'sent' })
  render(<Login onSubmit={onSubmit} onVerify={onVerify} />)
  await userEvent.type(screen.getByLabelText('Email'), 'a@b.co')
  await userEvent.click(screen.getByRole('button', { name: 'Send magic link' }))
  return { onSubmit, onVerify }
}

describe('Login', () => {
  it('sends the typed email and confirms', async () => {
    const { onSubmit } = await submit('sent')
    expect(onSubmit).toHaveBeenCalledWith('a@b.co')
    expect(await screen.findByRole('status')).toHaveTextContent(/magic link is on its way/)
  })
  it('shows a friendly not-invited message', async () => {
    await submit('not-invited')
    expect(await screen.findByRole('status')).toHaveTextContent(/invite-only/)
  })
  it('shows an error message', async () => {
    await submit('error', 'Email address not authorized')
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent(/went wrong/)
    expect(status).toHaveTextContent('Details: Email address not authorized')
  })

  it('offers a code form after sending, and verifies the typed code', async () => {
    const { onVerify } = await submit('sent')
    await userEvent.type(await screen.findByLabelText('Code from the email'), '123456')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in with code' }))
    expect(onVerify).toHaveBeenCalledWith('a@b.co', '123456')
  })
  it('does not show the code form before a link is sent', async () => {
    await submit('not-invited')
    expect(screen.queryByLabelText('Code from the email')).not.toBeInTheDocument()
  })
})
