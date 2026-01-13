import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-4xl font-bold mb-8 text-blue-400">
        Welcome to Transcendence
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Link 
          to="/game" 
          className="p-6 border border-blue-600 rounded-lg hover:bg-blue-900/20 transition-colors"
        >
          <h3 className="text-2xl font-bold mb-2">Play Game</h3>
          <p className="text-blue-300">Start playing Transcendence</p>
        </Link>
        
        <Link 
          to="/profile" 
          className="p-6 border border-blue-600 rounded-lg hover:bg-blue-900/20 transition-colors"
        >
          <h3 className="text-2xl font-bold mb-2">Profile</h3>
          <p className="text-blue-300">View your stats and achievements</p>
        </Link>
        
        <Link 
          to="/leaderboard" 
          className="p-6 border border-blue-600 rounded-lg hover:bg-blue-900/20 transition-colors"
        >
          <h3 className="text-2xl font-bold mb-2">Leaderboard</h3>
          <p className="text-blue-300">See top players</p>
        </Link>
        
        <Link 
          to="/settings" 
          className="p-6 border border-blue-600 rounded-lg hover:bg-blue-900/20 transition-colors"
        >
          <h3 className="text-2xl font-bold mb-2">Settings</h3>
          <p className="text-blue-300">Customize your experience</p>
        </Link>
      </div>
    </div>
  );
}
