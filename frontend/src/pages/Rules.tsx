
export default function Rules() {
  return (
	<div className="min-h-screen py-12 px-4">
	  <div className="max-w-4xl mx-auto">
		{/* Header */}
		<div className="mb-12 text-center">
		  <h1 className="text-5xl font-bold mb-4 text-white">Labyrinth Rules</h1>
		  <p className="text-light-cyan text-lg">Master the maze and navigate your path to victory</p>
		</div>

		{/* Main Content */}
		<div className="space-y-8">
		  {/* Objective Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<h2 className="text-2xl font-bold text-cyan-bright mb-4">🎯 Objective</h2>
			<p className="text-white leading-relaxed mb-3">
			  Navigate through a dynamically shifting labyrinth to collect items and reach your objectives. 
			  The board changes as you manipulate tiles, creating new paths and closing off others. 
			  Success requires strategic planning and adaptability.
			</p>
		  </section>

		  {/* Board & Tiles Section */}
		  <section className="bg-bg-dark-secondary border border-[var(--color-border-subtle)] rounded-lg p-6">
			<h2 className="text-2xl font-bold text-cyan-bright mb-4">🧩 Board & Tiles</h2>
			<div className="space-y-4 text-white">
			  <p>The playing field is a grid board made up of puzzle tiles. Each tile has paths (openings) that allow movement between adjacent tiles.</p>
			  
			  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
				<div className="bg-bg-dark p-3 rounded border border-cyan-dark">
				  <p className="font-bold text-cyan-bright mb-2">L-Tile (Corner)</p>
				  <p className="text-sm">Has two perpendicular openings at a corner. Can be rotated to change which corners are connected.</p>
				</div>
				<div className="bg-bg-dark p-3 rounded border border-cyan-dark">
				  <p className="font-bold text-cyan-bright mb-2">I-Tile (Straight)</p>
				  <p className="text-sm">Has openings on opposite sides (straight line). Connects two opposite sides of the tile.</p>
				</div>
				<div className="bg-bg-dark p-3 rounded border border-cyan-dark">
				  <p className="font-bold text-cyan-bright mb-2">T-Tile (Three-way)</p>
				  <p className="text-sm">Has three openings. One side is blocked, allowing three-way connections.</p>
				</div>
				<div className="bg-bg-dark p-3 rounded border border-cyan-dark">
				  <p className="font-bold text-cyan-bright mb-2">X-Tile (Junction)</p>
				  <p className="text-sm">Has openings on all four sides. Allows connections in every direction.</p>
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
			<h2 className="text-2xl font-bold text-cyan-bright mb-4">🚶 Movement Rules</h2>
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
			<h2 className="text-2xl font-bold text-cyan-bright mb-4">⚙️ Board Manipulation</h2>
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
			<h2 className="text-2xl font-bold text-cyan-bright mb-4">🔄 Turn Structure</h2>
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
			<h2 className="text-2xl font-bold text-cyan-bright mb-4">💎 Collecting Collectibles</h2>
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
			<h2 className="text-2xl font-bold text-cyan-bright mb-4">🏆 Win Conditions</h2>
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
			<h2 className="text-2xl font-bold text-cyan-bright mb-4">❌ Lose Conditions</h2>
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