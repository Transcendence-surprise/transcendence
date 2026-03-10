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

type AppearancePlaceholder = {
  title: string;
  description: string;
  options: string[];
};

const appearancePlaceholders: AppearancePlaceholder[] = [
  {
    title: "Collectables appearance",
    description: "Choose which collectables set appears during matches.",
    options: ["1", "2"],
  },
  {
    title: "Player board appearance",
    description: "Choose your player look and style on the game board.",
    options: ["1", "2"],
  },
];

export default function Settings() {
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
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
            Assets/API Pending
          </span>
        </div>

        <div className="space-y-4">
          {appearancePlaceholders.map((group) => (
            <div
              key={group.title}
              className="rounded-lg border border-[#FFFFFF1A] px-4 py-3"
            >
              <p className="text-white font-semibold">{group.title}</p>
              <p className="text-sm text-gray-400 mb-3">{group.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {group.options.map((setName) => (
                  <button
                    key={`${group.title}-${setName}`}
                    type="button"
                    disabled
                    className="rounded-md border border-[#FFFFFF1A] bg-[#0B0B0F] px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                  >
                    {setName}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
