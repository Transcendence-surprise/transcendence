type SimpleButtonProps = {
  title: string;
  onClick: () => void;
};

export default function SimpleButton({ title, onClick }: SimpleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow-lg hover:shadow-cyan-light hover:scale-105 transition-all border border-cyan-300/50 hover:border-cyan-bright cursor-pointer w-48"
    >
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
    </button>
  );
}
