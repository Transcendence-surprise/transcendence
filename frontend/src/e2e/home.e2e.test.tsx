import { render, screen } from '@testing-library/react'
import Layout from '../components/Layout'
import { AuthProvider } from '../hooks/useAuth'

// simple "e2e"-like smoke test that renders the app root
vi.mock('../api/health', () => ({
  checkHealth: vi.fn(() => Promise.resolve({ status: 'ok' })),
}))

describe('Home e2e (smoke)', () => {
  it('renders main layout', async () => {
    render(
      <AuthProvider>
        <Layout />
      </AuthProvider>
    )

    // wait for the health check effect to finish to avoid `act` warnings
    await screen.findByText(/Backend status: ok/i)

    expect(screen.getAllByText(/Transcendence Game/i).length).toBeGreaterThan(0)
  })
})
