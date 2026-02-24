export default function Footer() {
  return (
    <footer className="bg-black border-t-2 border-blue-500 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Copyright */}
        <div className="text-center mb-6">
          <p className="text-blue-300 font-semibold tracking-wide">
            © 2026 Transcendence Game
          </p>
        </div>

        {/* Creators */}
        <div className="text-center">
          <p className="text-blue-400 text-sm mb-3">Created by</p>
          <div className="flex flex-wrap justify-center gap-x-1 gap-y-2 text-sm">
            <a
              href="https://github.com/MariiaZhytnikova"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
            >
              Mariia Zhytnikova
            </a>
            <span className="text-blue-500">,</span>
            <a
              href="https://github.com/iliamunaev"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
            >
              Ilia Munaev
            </a>
            <span className="text-blue-500">,</span>
            <a
              href="https://github.com/marinezh"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
            >
              Marina Zhivotova
            </a>
            <span className="text-blue-500">,</span>
            <a
              href="https://github.com/mlitvino"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
            >
              Mykhailo Litvinov
            </a>
            <span className="text-blue-500">,</span>
            <span className="text-blue-500 mx-1">and</span>
            <a
              href="https://github.com/janeyears"
              className="text-blue-300 hover:text-blue-100 hover:underline transition-colors"
            >
              Evgeniia Kashirskaia
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
