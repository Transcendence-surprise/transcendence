import { Link } from "react-router-dom";

export default function ServiceUnavailablePage() {
  return (
    <div className="min-h-screen bg-black text-[#d7fbff]">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl rounded-xl border border-[#00eaff] bg-black/30 p-8 sm:p-10">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#7be9ff]">
            Error
          </p>

          <h1 className="mb-2 text-6xl font-black leading-none text-white sm:text-7xl">
            503
          </h1>

          <h2 className="mb-4 text-2xl font-bold text-[#c8faff] sm:text-3xl">
            Service Unavailable
          </h2>

		  	<h1 className="mb-2 text-4xl font-bold leading-none text-white sm:text-7xl">
         	(ㆆ _ ㆆ)
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-[#9cefff] sm:text-base">
            The service is currently unavailable.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-[#00eaff] bg-[#00eaff]/10 px-5 py-3 text-sm font-semibold text-[#d5fcff] transition hover:bg-[#00eaff]/20"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
