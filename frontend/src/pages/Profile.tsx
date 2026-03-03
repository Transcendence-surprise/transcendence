import { mockPlayerProfile } from '../types/player';

export default function Profile() {
  return (
	<div className="flex flex-col items-right min-h-[60vh]">
	  <h2 className="text-4xl font-bold mb-8 text-blue-400">{mockPlayerProfile.name}
	  </h2>
	  <p className="text-blue-300">This is where the user's profile information will be displayed.</p>
	</div>
  );
}