import GameModeCard from "../UI/GameModeCard";

type Props = {
  onCreate: () => void;
  onJoin: () => void;
  onBack: () => void;
};

export default function MultiplayerOption({ onCreate, onJoin, onBack }: Props) {
  return (
    <div className="min-h-screen bg-black text-[#00eaff] font-mono flex flex-col items-center justify-center space-y-8">
      <h2 className="text-4xl font-bold">Choose your multiplayer option</h2>
      <div className="flex gap-8  justify-center flex-wrap">
        <GameModeCard
          icon="/assets/create.svg"
          title="Create Game"
          description="Start a new multiplayer game"
          onClick={onCreate}
        />
        <GameModeCard
          icon="/assets/join.svg"
          title="Join Game"
          description="Join an existing multiplayer game"
          onClick={onJoin}
        />
      </div>

      <button className="mt-4 text-sm underline text-gray-400" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
