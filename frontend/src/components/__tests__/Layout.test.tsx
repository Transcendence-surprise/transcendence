import { render, screen, waitFor } from '@testing-library/react'
import Layout from '../Layout'
import { AuthProvider } from '../../hooks/useAuth'

vi.mock('../../api/health', () => ({
  checkHealth: vi.fn(() => Promise.resolve({ status: 'ok' })),
}))

describe('Layout', () => {
  it('renders header and backend status', async () => {
    render(
      <AuthProvider>
        <Layout />
      </AuthProvider>
    )

    expect(screen.getAllByText(/Transcendence Game/i).length).toBeGreaterThan(0)

    const statusEl = await screen.findByText(/Backend status: ok/i)
    expect(statusEl).toBeTruthy()
  })
})
