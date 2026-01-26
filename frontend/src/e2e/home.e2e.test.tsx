import { render, screen } from '@testing-library/react'
import Layout from '../components/Layout'

// simple "e2e"-like smoke test that renders the app root
vi.mock('../api/health', () => ({
  checkHealth: vi.fn(() => Promise.resolve({ status: 'ok' })),
}))

describe('Home e2e (smoke)', () => {
  it('renders main layout', async () => {
    render(<Layout />)

    // wait for the health check effect to finish to avoid `act` warnings
    await screen.findByText(/Backend status: ok/i)

    expect(screen.getAllByText(/Transcendence Game/i).length).toBeGreaterThan(0)
  })
})
