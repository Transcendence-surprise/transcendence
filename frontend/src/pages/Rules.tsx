import { TILE_SVGS } from "../components/game/tiles/tilesConstants";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  GiMaze,
  GiPuzzle,
  GiWalkingBoot,
  GiCog,
  GiCycle,
  GiDiamonds,
  GiTrophyCup,
} from "react-icons/gi";
import { MdOutlineDangerous } from "react-icons/md";

type RuleTileType = "L" | "I" | "T" | "X" | "W" | "FIXED";

const TILE_DETAILS: {
  type: RuleTileType;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}[] = [
  {
    type: "L",
    title: "L-Tile",
    subtitle: "Corner",
    description:
      "Has two perpendicular openings at a corner. Can be rotated to change which corners are connected.",
    color: "var(--color-tile-l)",
  },
  {
    type: "I",
    title: "I-Tile",
    subtitle: "Straight",
    description:
      "Has openings on opposite sides in a straight line. Connects two opposite sides of the tile.",
    color: "var(--color-tile-i)",
  },
  {
    type: "T",
    title: "T-Tile",
    subtitle: "Three-way",
    description:
      "Has three openings. One side is blocked, allowing three-way connections.",
    color: "var(--color-tile-t)",
  },
  {
    type: "X",
    title: "X-Tile",
    subtitle: "Junction",
    description:
      "Has openings on all four sides. Allows connections in every direction.",
    color: "var(--color-tile-x)",
  },
  {
    type: "W",
    title: "W-Tile",
    subtitle: "Wall",
    description:
      "Has no openings at all. It acts as a fully blocked wall tile and cannot be used as part of a path.",
    color: "var(--color-tile-t)",
  },
  {
    type: "FIXED",
    title: "Fixed Tile",
    subtitle: "Locked",
    description:
      "A fixed tile stays in place and cannot be shifted. It may have the shape of any path tile, but its position on the board is locked.",
    color: "#9CA3AF",
  },
];

function tileSvgDataUri(type: RuleTileType) {
  const svg =
    type === "FIXED"
      ? TILE_SVGS.L
          .replace(/#5c90f6/g, "#9CA3AF")
      : TILE_SVGS[type];

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function TileImage({
  type,
}: {
  type: RuleTileType;
}) {
  return (
    <img
      src={tileSvgDataUri(type)}
      alt={`${type} tile`}
      className="h-[68px] w-[68px] shrink-0"
    />
  );
}

function TileCard({
  title,
  subtitle,
  description,
  type,
  color,
}: {
  title: string;
  subtitle: string;
  description: string;
  type: RuleTileType;
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-cyan-dark bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: color }}
      />
      <div className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-4">
        <div className="flex min-h-full items-center justify-center">
          <TileImage type={type} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-cyan-bright">{title}</p>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-white/55">
            {subtitle}
          </p>
          <p className="text-sm leading-6 text-white/90">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: IconType;
  children: ReactNode;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-cyan-bright">
      <Icon className="shrink-0 text-[1.15em]" />
      <span>{children}</span>
    </h2>
  );
}

export default function Rules() {
  return (
	<div className="min-h-screen py-12 px-4">
	  <div className="w-full">
		{/* Header */}
		<div className="mb-12 text-center">
		  <h1 className="text-5xl font-bold mb-4 text-white">Labyrinth Rules</h1>
		  <p className="text-light-cyan text-lg">Master the maze and navigate your path to victory</p>
		</div>

		{/* Main Content */}
		<div className="space-y-8">
		  {/* Objective Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<SectionTitle icon={GiMaze}>Objective</SectionTitle>
			<p className="text-white leading-relaxed mb-3">
			  Navigate through a dynamically shifting labyrinth to collect items and reach your objectives. 
			  The board changes as you manipulate tiles, creating new paths and closing off others. 
			  Success requires strategic planning and adaptability.
			</p>
		  </section>

		  {/* Board & Tiles Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6 overflow-hidden">
			<SectionTitle icon={GiPuzzle}>Board & Tiles</SectionTitle>
			<div className="space-y-4 text-white">
			  <p>The playing field is a grid board made up of puzzle tiles. Most tiles have paths (openings) that allow movement between adjacent tiles, but some tiles act as walls and block movement completely.</p>

			  <div className="relative mt-6 rounded-lg border border-white/5 bg-[radial-gradient(circle_at_top_left,rgba(33,230,197,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(92,144,246,0.12),transparent_30%)] p-4 md:p-6">
				<div className="mb-5 flex items-center justify-between gap-4">
				  <div>
					<p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/50">
					  Tile Reference
					</p>
					<p className="mt-1 text-sm text-white/80">
					  Learn how each shape opens, blocks, and redirects your route.
					</p>
				  </div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				  {TILE_DETAILS.map((tile) => (
					<TileCard key={tile.type} {...tile} />
				  ))}
				</div>
			  </div>

			  <p className="mt-4 text-sm">
				<strong>Rotation:</strong> All tiles can be rotated 90°, 180°, or 270° to change their orientation. 
				In multiplayer mode, corner tiles are fixed and cannot be rotated.
			  </p>
			</div>
		  </section>

		  {/* Movement Rules Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<SectionTitle icon={GiWalkingBoot}>Movement Rules</SectionTitle>
			<div className="space-y-3 text-light-cyan">
			  <ul className="space-y-2 ml-4">
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✓</span>
				  <span className="text-white">You can only move to adjacent tiles if their openings are aligned (connected)</span>
        </li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✓</span>
				  <span className="text-white">You cannot move through walls. If tiles are not connected, the path is blocked</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✓</span>
				  <span className="text-white">You can select path through several tiles during your turn</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✓</span>
				  <span className="text-white">You move within the board boundaries. When a row/column shifts, you wrap around to the opposite side</span>
				</li>
			  </ul>
			</div>
		  </section>

		  {/* Board Manipulation Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<SectionTitle icon={GiCog}>Board Manipulation</SectionTitle>
			<p className="text-white mb-4">Each turn, before or during movement, you can manipulate the board to create new paths:</p>
			<div className="space-y-3 text-light-cyan">
			  <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
				<p className="font-bold text-cyan-bright mb-2">Rotate a Tile</p>
				<p className="text-sm text-white">Select a tile and rotate it 90° clockwise. Creates or closes paths to adjacent tiles. Cannot rotate tiles with players on them.</p>
			  </div>
			  <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
				<p className="font-bold text-cyan-bright mb-2">Swap Tiles</p>
				<p className="text-sm text-white">Exchange the positions of two tiles on the board. Cannot swap tiles with players on them. Useful for reorganizing the labyrinth.</p>
			  </div>
			  <div className="bg-bg-dark p-4 rounded border border-cyan-dark">
				<p className="font-bold text-cyan-bright mb-2">Shift Row/Column</p>
				<p className="text-sm text-white">Move an entire row or column left, right, up, or down. Tiles wrap around to the opposite side. Players and collectibles on that row/column also shift with it.</p>
			  </div>
			</div>
		  </section>

		  {/* Turn Structure Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<SectionTitle icon={GiCycle}>Turn Structure</SectionTitle>
			<div className="space-y-4 text-light-cyan">
			  <div>
				<p className="font-bold text-cyan-bright mb-2">Single-Player Mode:</p>
				<ul className="ml-4 space-y-1 text-sm text-white">
				  <li>• Manipulate the board as needed</li>
				  <li>• Move your player through the labyrinth</li>
				  <li>• Solve objectives at your own pace</li>
				</ul>
			  </div>
			  <div>
				<p className="font-bold text-cyan-bright mb-2">Multiplayer Mode:</p>
				<ol className="ml-4 space-y-1 text-sm text-white">
				  <li>1. Players take turns in order</li>
				  <li>2. On your turn: rotate, swap, or shift tiles (required action)</li>
				  <li>3. Then: move your player once</li>
				  <li>4. End your turn and pass to the next player</li>
				  <li>5. You have a time limit per turn (default: 3 minutes)</li>
				</ol>
			  </div>
			</div>
		  </section>

		  {/* Collecting Items Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<SectionTitle icon={GiDiamonds}>Collecting Collectibles</SectionTitle>
			<div className="space-y-3 text-light-cyan">
			  <ul className="space-y-2 ml-4">
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">•</span>
				  <span className="text-white">Certain tiles contain collectible items</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">•</span>
				  <span className="text-white">When you move to a tile with a collectible, you automatically collect it</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">•</span>
				  <span className="text-white">Collected items contribute to your objectives</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">•</span>
				  <span className="text-white">In multiplayer, each player collects independently</span>
				</li>
			  </ul>
			</div>
		  </section>

		  {/* Win Conditions Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<SectionTitle icon={GiTrophyCup}>Win Conditions</SectionTitle>
			<div className="space-y-3 text-light-cyan">
			  <p className="font-bold text-cyan-bright">You win by:</p>
			  <ul className="space-y-2 ml-4">
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✓</span>
				  <span className="text-white">Collecting all required collectibles</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✓</span>
				  <span className="text-white">Reaching the exit point (if one exists)</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✓</span>
				  <span className="text-white">Completing all assigned objectives before other players (multiplayer)</span>
				</li>
			  </ul>
      </div>
		  </section>

		  {/* Lose Conditions Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<SectionTitle icon={MdOutlineDangerous}>Lose Conditions</SectionTitle>
			<div className="space-y-3 text-light-cyan">
			  <ul className="space-y-2 ml-4">
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✗</span>
				  <span className="text-white"><strong>Exceed Maximum Moves:</strong> Some levels have a move limit. Exceeding it ends the game as a loss.</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✗</span>
				  <span className="text-white"><strong>Time Limit:</strong> If the level has a time constraint, running out of time ends the game as a loss.</span>
				</li>
				<li className="flex gap-3">
				  <span className="text-cyan-bright font-bold">✗</span>
				  <span className="text-white"><strong>Other Players Finish First:</strong> In multiplayer, if another player completes their objectives first, you lose.</span>
				</li>
			  </ul>
			</div>
		  </section>
		</div>

		{/* Footer */}
		<div className="mt-12 text-center text-light-cyan text-sm border-t border-[var(--color-border-subtle)] pt-8">
		  <p>Master your strategy and become the Labyrinth champion! Good luck! 🎮</p>
		</div>
	  </div>
	</div>
  );
}
