type SimpleButtonProps = {
  title: string;
  onClick: () => void;
};

export default function SimpleButton({ title, onClick }: SimpleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center px-4 py-2 bg-[linear-gradient(90deg,rgba(0,234,255,1)_0%,rgba(0,102,255,1)_100%)] rounded-lg shadow-lg hover:shadow-[0_8px_20px_rgba(0,234,255,0.4)] hover:scale-105 transition-all border border-[#FFFFFF1A] hover:border-cyan-200 cursor-pointer w-48"
    >
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
    </button>
  );
}
