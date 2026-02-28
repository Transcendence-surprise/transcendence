// Example Admin Panel Component
import { useAuth } from '../hooks/useAuth';
import type { User } from '../api/users';
import { useEffect, useState } from 'react';
import { getAllUsers } from '../api/users';

export default function AdminPanel() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if(isAdmin) {
      getAllUsers()
      .then(setUsers)
      .catch(console.error);

    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold text-red-800">Access Denied</h2>
        <p className="text-red-600">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-4">Welcome, Admin {user?.username}!</p>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.username} ({u.email})</li>
        ))}
      </ul>
    </div>
  );
}
