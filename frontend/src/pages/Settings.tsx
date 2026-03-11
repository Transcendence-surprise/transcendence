import { useEffect, useState } from "react";

type PlaceholderSetting = {
  title: string;
  description: string;
  actionLabel: string;
};

const securityPlaceholders: PlaceholderSetting[] = [
  {
    title: "Two-factor authentication (2FA)",
    description:
      "Add an extra verification step at login for better account security.",
    actionLabel: "Enable / Disable",
  },
  {
    title: "Password",
    description:
      "Update your password regularly to keep your account protected.",
    actionLabel: "Change Password",
  },
];

type CollectableSet = "gemstones" | "numbers";

const collectableSetStorageKey = "settings.collectableSet";
const gemstonePreview = Array.from({ length: 4 }, (_, index) => ({
  id: String(index + 1),
  src: `/assets/collectables/gems/${index + 1}.svg`,
}));
const numberPreview = Array.from({ length: 4 }, (_, index) => ({
  id: String(index + 1),
  src: `/assets/collectables/numbers/${index + 1}.svg`,
}));

export default function Settings() {
  const [selectedCollectableSet, setSelectedCollectableSet] =
    useState<CollectableSet>("gemstones");

  useEffect(() => {
    const savedSet = localStorage.getItem(collectableSetStorageKey);
    if (!savedSet) {
      return;
    }

    if (savedSet === "gemstones" || savedSet === "numbers") {
      setSelectedCollectableSet(savedSet);
    }
  }, []);

  const handleCollectableSetSelect = (set: CollectableSet) => {
    setSelectedCollectableSet(set);
    localStorage.setItem(collectableSetStorageKey, set);
  };

  return (
    <div className="flex flex-col min-h-[60vh] gap-8 max-w-4xl">
      <div>
        <h2 className="text-4xl font-bold text-white">Settings</h2>
        <p className="text-[#B7F6FF] mt-2">Manage your account settings.</p>
      </div>

      <section className="bg-[#1A1A1F99] rounded-xl border border-[#FFFFFF1A] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Security</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
            API Pending
          </span>
        </div>
        <div className="space-y-3">
          {securityPlaceholders.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between gap-4 rounded-lg border border-[#FFFFFF1A] px-4 py-3"
            >
              <div>
                <p className="text-white font-semibold">{item.title}</p>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
              <button
                type="button"
                disabled
                className="px-3 py-1.5 rounded-md text-sm font-bold border border-[#FFFFFF1A] text-gray-500 cursor-not-allowed"
              >
                {item.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#1A1A1F99] rounded-xl border border-[#FFFFFF1A] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Appearance</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[#FFFFFF1A] px-4 py-3">
            <p className="text-white font-semibold">Collectables appearance</p>
            <p className="text-sm text-gray-400 mb-3">
              Choose which collectables set appears during matches.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCollectableSetSelect("gemstones")}
                aria-pressed={selectedCollectableSet === "gemstones"}
                className={`rounded-md border bg-[#0B0B0F] p-3 text-left transition-colors ${
                  selectedCollectableSet === "gemstones"
                    ? "border-cyan-300"
                    : "border-[#FFFFFF1A] hover:border-cyan-500/60"
                }`}
              >
                <p className="text-white font-semibold pb-3">Gemstones</p>
                <div className="grid grid-cols-4 gap-2">
                  {gemstonePreview.map((gemstone) => (
                    <img
                      key={gemstone.id}
                      src={gemstone.src}
                      alt={`Gemstone preview ${gemstone.id}`}
                      className="w-7 h-7"
                    />
                  ))}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCollectableSetSelect("numbers")}
                aria-pressed={selectedCollectableSet === "numbers"}
                className={`rounded-md border bg-[#0B0B0F] p-3 text-left transition-colors ${
                  selectedCollectableSet === "numbers"
                    ? "border-cyan-300"
                    : "border-[#FFFFFF1A] hover:border-cyan-500/60"
                }`}
              >
                <p className="text-white font-semibold pb-3">Numbers</p>
                <div className="grid grid-cols-4 gap-2">
                  {numberPreview.map((number) => (
                    <img
                      key={number.id}
                      src={number.src}
                      alt={`Number preview ${number.id}`}
                      className="w-7 h-7"
                    />
                  ))}
                </div>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#FFFFFF1A] px-4 py-3">
            <p className="text-white font-semibold">Player board appearance</p>
            <p className="text-sm text-gray-400 mb-3">
              Choose your player look and style on the game board.
            </p>
            <button
              type="button"
              disabled
              className="rounded-md border border-[#FFFFFF1A] bg-[#0B0B0F] px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            >
              Coming soon
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
