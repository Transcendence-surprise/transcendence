import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { checkHealth } from '../api/health';

export default function Layout() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    checkHealth()
      .then(data => setStatus(data.status))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div className="min-h-screen bg-black text-blue-400 font-mono">
      {/* Header */}
      <header className="p-4 border-b border-blue-600">
        <h1 className="text-3xl font-bold text-blue-400 drop-shadow-lg">
          Transcendence Game
        </h1>
        <p className="text-sm text-blue-300">
          Backend status: {status}
        </p>
      </header>

      {/* Main content - this is where child routes will render */}
      <main className="p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-blue-600 text-center text-sm text-blue-300">
        © 2026 Transcendence Game
      </footer>
    </div>
  );
}
