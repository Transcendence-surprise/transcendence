import { Link } from "react-router-dom";
import HomeNavCard from "../components/shared/HomeNavCard";
import HeroCanvas from "../components/HeroCanvas";
import { IoGameControllerOutline } from 'react-icons/io5';
import { FiUser, FiSettings } from 'react-icons/fi';
import { GoTrophy } from 'react-icons/go';
import { FiMessageSquare, FiUsers } from "react-icons/fi";
import { GoListUnordered } from "react-icons/go";


export default function Home() {
  const navCards = [
    {
      title: "Profile",
      description: "View your stats and achievements",
      icon: <FiUser />,
      iconClass: "text-color-cyan-bright drop-shadow-[0_0_10px_rgba(255,64,129,0.45)]",
      to: "/profile",
    },
    {
      title: "Play Game",
      description: "Start playing Transcendence",
      icon: <IoGameControllerOutline />,
      iconClass: "text-color-magenta drop-shadow-[0_0_10px_rgba(0,234,255,0.5)]",
      to: "/game",
    },
    {
      title: "Rules",
      description: "Learn how the game works",
      icon: <GoListUnordered />,
      iconClass: "text-color-violet drop-shadow-[0_0_10px_rgba(174,102,255,0.45)]",
      to: "/rules",
    },
    {
      title: "Friends",
      description: "Manage and play with friends",
      icon: <FiUsers />,
      iconClass: "text-color-neon-green drop-shadow-[0_0_10px_rgba(174,102,255,0.45)]",
      to: "/rules",
    },
    {
      title: "Chat",
      description: "Send messages and stay connected",
      icon: <FiMessageSquare />,
      iconClass: "text-color-violet drop-shadow-[0_0_10px_rgba(174,102,255,0.45)]",
      to: "/chat",
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
      iconClass: "text-color-magenta drop-shadow-[0_0_10px_rgba(174,102,255,0.45)]",
      to: "/settings",
    },

  
  ];

  return (
     <div className="min-h-screen bg-bg-dark font-sans">
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

          {/* Responsive rows: automatically distribute cards into balanced rows
              - maxCols controls how many columns to aim for on large screens
              - rows are balanced so we avoid a lonely single item on the last row
          */}
          {(() => {
            const maxCols = 4;
            // Distribute items into balanced rows up to maxCols
            const items = navCards;
            const rows: typeof items[] = [];
            let remaining = items.length;
            let cursor = 0;

            while (remaining > 0) {
              if (remaining <= maxCols) {
                // avoid a single-item final row when possible
                if (remaining === 1 && rows.length > 0 && rows[rows.length - 1].length > 1) {
                  // move one from previous row to make last row have 2
                  const prev = rows[rows.length - 1];
                  const moved = prev.splice(prev.length - 1, 1);
                  rows.push(moved.concat(items.slice(cursor, cursor + remaining)));
                } else {
                  rows.push(items.slice(cursor, cursor + remaining));
                }
                break;
              }

              rows.push(items.slice(cursor, cursor + maxCols));
              cursor += maxCols;
              remaining -= maxCols;
            }

            // helper mapping for responsive column classes
            const colClassMap: Record<number, string> = {
              1: "grid-cols-1 lg:grid-cols-1",
              2: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2",
              3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3",
              4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
            };

            return (
              <div className="space-y-6">
                {rows.map((row, rowIndex) => {
                  const cols = row.length;
                  const colClasses = colClassMap[cols] ?? colClassMap[4];
                  // cap the visual width so shorter rows are centered nicely
                  const maxWidthPx = Math.min(1280, cols * 320); // 320px per card cap

                  return (
                    <div
                      key={`row-${rowIndex}`}
                      className={`mx-auto grid ${colClasses} gap-6`
                      }
                      style={{ maxWidth: `${maxWidthPx}px` }}
                    >
                      {row.map((card, i) => (
                        <HomeNavCard
                          key={`r${rowIndex}-${i}`}
                          icon={card.icon}
                          iconClass={card.iconClass}
                          title={card.title}
                          description={card.description}
                          to={card.to}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
