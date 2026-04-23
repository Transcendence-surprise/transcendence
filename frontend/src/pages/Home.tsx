import { Link } from "react-router-dom";
import HomeNavCard from "../components/shared/HomeNavCard";
import HeroCanvas from "../components/HeroCanvas";
import { IoGameControllerOutline } from 'react-icons/io5';
import { FiUser, FiSettings } from 'react-icons/fi';
import { GoTrophy } from 'react-icons/go';

export default function Home() {
  const navCards = [
    {
      title: "Play Game",
      description: "Start playing Transcendence",
      icon: <IoGameControllerOutline />,
      iconClass: "text-color-magenta drop-shadow-[0_0_10px_rgba(0,234,255,0.5)]",
      to: "/game",
    },
    {
      title: "Profile",
      description: "View your stats and achievements",
      icon: <FiUser />,
      iconClass: "text-color-cyan-bright drop-shadow-[0_0_10px_rgba(255,64,129,0.45)]",
      to: "/profile",
    },
    {
      title: "Leaderboard",
      description: "See top players",
      icon: <GoTrophy />,
      iconClass: "text-color-neon-green drop-shadow-[0_0_10px_rgba(29,252,122,0.45)]",
      to: "/leaderboard",
    },
    {
      title: "Settings",
      description: "Customize your experience",
      icon: <FiSettings />,
      iconClass: "text-color-violet drop-shadow-[0_0_10px_rgba(174,102,255,0.45)]",
      to: "/settings",
    },
  ];

  return (
     <div className="min-h-screen bg-bg-dark font-sans">
    {/* //   {/* Hero Section */}
    {/* <div className="relative min-h-[40vh] flex items-center justify-center px-4 py-10 overflow-hidden"> */}
      {/* Content */}
         {/* <div className="relative z-10 max-w-3xl text-center">
         <p className="text-xs uppercase tracking-[0.3em] text-light-cyan mb-4">
           Welcome to hell
           </p>
           <h1 className="text-5xl font-black drop-shadow-lg text-white mb-6">
             Transcendence
           </h1>
           <p className="text-xl text-lightest-cyan mb-4 leading-relaxed">
             A server-driven multiplayer web game featuring user profiles,
             authentication, and global leaderboards.
           </p>
           <p className="text-m text-lightest-cyan mb-4 leading-relaxed">
             The app is split into microservices so real-time game logic,
             user/profile management, and authentication can scale independently;
             nginx routes frontend requests to the appropriate service and
             PostgreSQL stores persistent data.
           </p>
         </div> */}
    {/* </div>  */}
      <div className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Canvas background */}
        <HeroCanvas className="absolute w-full h-[50vh] opacity-80" />

        {/* Content */}
        <div  className="relative flex flex-col items-center justify-center overflow-hidden">
            <p className="relative z-10 max-w-3xl text-center text-xs uppercase tracking-[0.3em] text-light-cyan mb-4">
              Welcome to hell
            </p>
            <h1 className="relative z-10 max-w-3xl text-center text-5xl font-black drop-shadow-lg text-white mb-6">
              Transcendence
            </h1>
        </div>

      </div>
      {/* Navigation Section */}
      <div className="relative px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-light-cyan mb-3">
              Get Started
            </p>
            <h2 className="text-4xl font-bold text-text-white mb-4">
              Explore & Play
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {navCards.map((card, i) => (
              <HomeNavCard
                key={i}
                icon={card.icon}
                iconClass={card.iconClass}
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
