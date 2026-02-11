type GameModeCardProps = {
  icon: string;
  title: string;
  description?: string;
  onClick: () => void;
};

export default function GameModeCard({
  icon,
  title,
  description,
  onClick,
}: GameModeCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-8 bg-[#1A1A1F99] rounded-lg shadow-lg hover:shadow-[0_8px_20px_rgba(0,234,255,0.4)] hover:scale-105 transition-all border border-[#FFFFFF1A] hover:border-cyan-200 cursor-pointer w-96"
    >
      <img src={icon} alt="" className="w-14 h-14 mb-4" aria-hidden="true" />
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#FFFFFFB2] text-center">{description}</p>
      )}
    </button>
  );
}
