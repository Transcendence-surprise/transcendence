import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toggleTwoFactorAuth } from "../api/users";
import BackButton from "../components/shared/BackButton";
import ChangePasswordModal from "../components/settings/ChangePasswordModal";

type CollectableSet = "gemstones" | "numbers";
type PlayerIconSet = "star" | "space_inv";

const collectableSetStorageKey = "settings.collectableSet";
const playerIconSetStorageKey = "settings.playerIconSet";
const gemstonePreview = Array.from({ length: 4 }, (_, index) => ({
  id: String(index + 1),
  src: `/assets/collectables/gems/${index + 1}.svg`,
}));
const numberPreview = Array.from({ length: 4 }, (_, index) => ({
  id: String(index + 1),
  src: `/assets/collectables/numbers/${index + 1}.svg`,
}));
const starPlayerPreview = Array.from({ length: 4 }, (_, index) => ({
  id: String(index + 1),
  src: `/assets/player/star/${index + 1}.svg`,
}));
const spaceInvPlayerPreview = Array.from({ length: 4 }, (_, index) => ({
  id: String(index + 5),
  src: `/assets/player/space_inv/${index + 5}.svg`,
}));

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [selectedCollectableSet, setSelectedCollectableSet] =
    useState<CollectableSet>("gemstones");
  const [selectedPlayerIconSet, setSelectedPlayerIconSet] =
    useState<PlayerIconSet>("star");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (!user || user.roles.includes("guest")) return;
    const savedSet = localStorage.getItem(collectableSetStorageKey);
    if (!savedSet) {
      return;
    }

    if (savedSet === "gemstones" || savedSet === "numbers") {
      setSelectedCollectableSet(savedSet);
    }

    const savedPlayerSet = localStorage.getItem(playerIconSetStorageKey);
    if (savedPlayerSet === "star" || savedPlayerSet === "space_inv") {
      setSelectedPlayerIconSet(savedPlayerSet);
    }
  }, [user]);
  if (!user || user.roles.includes("guest")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-3xl font-bold mb-6 text-cyan-400">
          Login required to access settings
        </h2>

        <BackButton onClick={() => navigate(-1)} variant="outline" />
      </div>
    );
  }

  const handleCollectableSetSelect = (set: CollectableSet) => {
    setSelectedCollectableSet(set);
    localStorage.setItem(collectableSetStorageKey, set);
  };

  const handlePlayerIconSetSelect = (set: PlayerIconSet) => {
    setSelectedPlayerIconSet(set);
    localStorage.setItem(playerIconSetStorageKey, set);
  };

  const handleToggleTwoFactor = async () => {
    if (!user) return;

    setTwoFactorLoading(true);
    try {
      const updatedUser = await toggleTwoFactorAuth(
        !(user.twoFactorEnabled ?? false),
      );
      updateUser(updatedUser);
    } catch (err: any) {
      console.error(err);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const twoFactorEnabled = user?.twoFactorEnabled ?? false;

  return (
    <div className="flex w-full flex-col min-h-[60vh] gap-8">
      <div>
        <h2 className="text-4xl font-bold text-white">Settings</h2>
        <p className="text-lightest-cyan mt-2">Manage your account settings.</p>
      </div>

      <section className="bg-bg-modal rounded-xl border border-[var(--color-border-subtle)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Security</h3>
          <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
            {twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border-subtle)] px-4 py-3">
            <div>
              <p className="text-white font-semibold">
                Two-factor authentication (2FA)
              </p>
              <p className="text-sm text-gray-400">
                Add an extra verification step at login for better account
                security.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleTwoFactor}
              disabled={twoFactorLoading}
              className="px-3 py-1.5 rounded-md text-sm font-bold border border-[var(--color-border-subtle)] text-gray-300 hover:border-cyan-500/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {twoFactorLoading
                ? "Saving..."
                : twoFactorEnabled
                  ? "Disable"
                  : "Enable"}
            </button>
          </div>

          {/* Password Change */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--color-border-subtle)] px-4 py-3">
            <div>
              <p className="text-white font-semibold">Password</p>
              <p className="text-sm text-gray-400">
                Update your password regularly to keep your account protected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 rounded-md text-sm font-bold border border-[var(--color-border-subtle)] text-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </section>

      <section className="bg-bg-modal rounded-xl border border-[var(--color-border-subtle)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">Appearance</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-3">
            <p className="text-white font-semibold">Collectables appearance</p>
            <p className="text-sm text-gray-400 mb-3">
              Choose which collectables set appears during matches.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleCollectableSetSelect("gemstones")}
                aria-pressed={selectedCollectableSet === "gemstones"}
                className={`rounded-md border bg-bg-dark p-3 text-left transition-colors ${
                  selectedCollectableSet === "gemstones"
                    ? "border-cyan-300"
                    : "border-[var(--color-border-subtle)] hover:border-cyan-500/60"
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
                className={`rounded-md border bg-bg-dark p-3 text-left transition-colors ${
                  selectedCollectableSet === "numbers"
                    ? "border-cyan-300"
                    : "border-[var(--color-border-subtle)] hover:border-cyan-500/60"
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

          <div className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-3">
            <p className="text-white font-semibold">Player appearance</p>
            <p className="text-sm text-gray-400 mb-3">
              Choose your player look and style on the game board.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePlayerIconSetSelect("star")}
                aria-pressed={selectedPlayerIconSet === "star"}
                className={`rounded-md border bg-bg-dark p-3 text-left transition-colors ${
                  selectedPlayerIconSet === "star"
                    ? "border-cyan-300"
                    : "border-[var(--color-border-subtle)] hover:border-cyan-500/60"
                }`}
              >
                <p className="text-white font-semibold pb-3">Stars</p>
                <div className="grid grid-cols-4 gap-2">
                  {starPlayerPreview.map((icon) => (
                    <img
                      key={icon.id}
                      src={icon.src}
                      alt={`Star player icon preview ${icon.id}`}
                      className="w-12 h-12"
                    />
                  ))}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePlayerIconSetSelect("space_inv")}
                aria-pressed={selectedPlayerIconSet === "space_inv"}
                className={`rounded-md border bg-bg-dark p-3 text-left transition-colors ${
                  selectedPlayerIconSet === "space_inv"
                    ? "border-cyan-300"
                    : "border-[var(--color-border-subtle)] hover:border-cyan-500/60"
                }`}
              >
                <p className="text-white font-semibold pb-3">Space Invaders</p>
                <div className="grid grid-cols-4 gap-2">
                  {spaceInvPlayerPreview.map((icon) => (
                    <img
                      key={icon.id}
                      src={icon.src}
                      alt={`Space invader player icon preview ${icon.id}`}
                      className="w-7 h-7"
                    />
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
