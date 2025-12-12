import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState('loading...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div>
      <h1>Frontend ↔ Backend test</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;