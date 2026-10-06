import { formatCents, parseToCents } from './money'

describe('money', () => {
  it('formats cents as USD', () => {
    expect(formatCents(123456)).toBe('$1,234.56')
    expect(formatCents(5)).toBe('$0.05')
  })
  it('parses input to integer cents without float drift', () => {
    expect(parseToCents('19.99')).toBe(1999)
    expect(parseToCents('$1,200')).toBe(120000)
    expect(parseToCents('0.1')).toBe(10)
    expect(parseToCents('1.005')).toBeNull()
  })
  it('rejects junk and negatives', () => {
    expect(parseToCents('')).toBeNull()
    expect(parseToCents('abc')).toBeNull()
    expect(parseToCents('-5')).toBeNull()
    expect(parseToCents('.')).toBeNull()
  })
})
