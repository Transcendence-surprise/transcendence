import { useState } from 'react';

interface SignupFormProps {
  onClose: () => void;
}

export default function SignupForm({ onClose }: SignupFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    console.log('Signup attempt:', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
    
    // TODO: Add API call to backend signup endpoint
    // Example: await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(formData) })
    
    alert('Signup functionality - ready for backend integration');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-blue-600 rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-400">Sign Up</h2>
          <button
            onClick={onClose}
            className="text-blue-300 hover:text-blue-100 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-username" className="block text-sm font-medium text-blue-300 mb-2">
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black border border-blue-600 rounded text-blue-100 focus:outline-none focus:border-blue-400"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-blue-300 mb-2">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black border border-blue-600 rounded text-blue-100 focus:outline-none focus:border-blue-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-blue-300 mb-2">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black border border-blue-600 rounded text-blue-100 focus:outline-none focus:border-blue-400"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-blue-300 mb-2">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black border border-blue-600 rounded text-blue-100 focus:outline-none focus:border-blue-400"
              placeholder="Confirm your password"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
