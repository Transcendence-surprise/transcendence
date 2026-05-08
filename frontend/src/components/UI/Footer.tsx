export default function Footer() {
  return (
    <footer className="bg-bg-dark border-t border-border-gray shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-center text-sm text-gray-400">
          <span className="text-gray-500">Created by </span>
          <a
            href="https://github.com/MariiaZhytnikova"
            className="hover:text-gray-300 hover:underline transition-colors"
          >
            Mariia Zhytnikova
          </a>
          <span className="text-gray-500">, </span>
          <a
            href="https://github.com/iliamunaev"
            className=" hover:text-gray-300 hover:underline transition-colors"
          >
            Ilia Munaev
          </a>
          <span className="text-gray-500">, </span>
          <a
            href="https://github.com/marinezh"
            className=" hover:text-gray-300 hover:underline transition-colors"
          >
            Marina Zhivotova
          </a>
          <span className="text-gray-500">, </span>
          <a
            href="https://github.com/mlitvino"
            className="hover:text-gray-300 hover:underline transition-colors"
          >
            Mykhailo Litvinov
          </a>
          <span className="text-gray-500">, and </span>
          <a
            href="https://github.com/janeyears"
            className="hover:text-gray-300 hover:underline transition-colors"
          >
            Evgeniia Kashirskaia
          </a>
          <p className="text-center text-sm text-gray-400 tracking-wide mb-1">
            © 2026 Transcendence Game
           </p>
        </div>
      </div>
    </footer>
  );
}
