import { Link } from "react-router-dom";
import HomeNavCard from "../components/UI/HomeNavCard";

export default function Home() {
  const navCards = [
    {
      title: "Play Game",
      description: "Start playing Transcendence",
      icon: "🎮",
      to: "/game",
    },
    {
      title: "Profile",
      description: "View your stats and achievements",
      icon: "👤",
      to: "/profile",
    },
    {
      title: "Leaderboard",
      description: "See top players",
      icon: "🏆",
      to: "/leaderboard",
    },
    {
      title: "Settings",
      description: "Customize your experience",
      icon: "⚙️",
      to: "/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-[#00eaff] font-mono">
      {/* Hero Section */}
      <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-10 overflow-hidden">
        {/* Content */}
        <div className="relative z-10 max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7BE9FF] mb-4">
            Welcome to
          </p>
          <h1 className="text-7xl font-black drop-shadow-lg text-white mb-6">
            Transcendence
          </h1>
          <p className="text-xl text-[#B7F6FF] mb-4 leading-relaxed">
            A server-driven multiplayer web game featuring user profiles,
            authentication, and global leaderboards.
          </p>
          <p className="text-m text-[#B7F6FF] mb-4 leading-relaxed">
            The app is split into microservices so real-time game logic,
            user/profile management, and authentication can scale independently;
            nginx routes frontend requests to the appropriate service and
            PostgreSQL stores persistent data.
          </p>
        </div>
      </div>
      {/* Navigation Section */}
      <div className="relative px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7BE9FF] mb-3">
              Get Started
            </p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Explore & Play
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {navCards.map((card, i) => (
              <HomeNavCard
                key={i}
                icon={card.icon}
                title={card.title}
                description={card.description}
                to={card.to}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
