export default function Footer() {
  return (
    <footer className="bg-bg-dark border-t border-border-blue shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <p className="text-center text-sm text-gray-300 font-semibold tracking-wide mb-1">
          © 2026 Transcendence Game
        </p>

        <p className="text-center text-sm text-gray-400">
          <span className="text-gray-500">Created by </span>
          <a
            href="https://github.com/MariiaZhytnikova"
            className="text-gray-500 hover:text-gray-300 hover:underline transition-colors"
          >
            Mariia Zhytnikova
          </a>
          <span className="text-gray-500">, </span>
          <a
            href="https://github.com/iliamunaev"
            className="text-gray-500 hover:text-gray-300 hover:underline transition-colors"
          >
            Ilia Munaev
          </a>
          <span className="text-gray-500">, </span>
          <a
            href="https://github.com/marinezh"
            className="text-gray-500 hover:text-gray-300 hover:underline transition-colors"
          >
            Marina Zhivotova
          </a>
          <span className="text-gray-500">, </span>
          <a
            href="https://github.com/mlitvino"
            className="text-gray-500 hover:text-gray-300 hover:underline transition-colors"
          >
            Mykhailo Litvinov
          </a>
          <span className="text-gray-500">, and </span>
          <a
            href="https://github.com/janeyears"
            className="text-gray-500 hover:text-gray-300 hover:underline transition-colors"
          >
            Evgeniia Kashirskaia
          </a>
        </p>
      </div>
    </footer>
  );
}
