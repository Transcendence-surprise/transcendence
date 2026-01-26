import { render, screen, waitFor } from '@testing-library/react'
import Layout from '../Layout'

vi.mock('../../api/health', () => ({
  checkHealth: vi.fn(() => Promise.resolve({ status: 'ok' })),
}))

describe('Layout', () => {
  it('renders header and backend status', async () => {
    render(<Layout />)

    expect(screen.getAllByText(/Transcendence Game/i).length).toBeGreaterThan(0)

    const statusEl = await screen.findByText(/Backend status: ok/i)
    expect(statusEl).toBeTruthy()
  })
})
