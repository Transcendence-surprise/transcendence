import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as usersApi from "../api/users";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCollectableSet, setSelectedCollectableSet] =
    useState<CollectableSet>("gemstones");
  const [selectedPlayerIconSet, setSelectedPlayerIconSet] =
    useState<PlayerIconSet>("star");

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

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
        <h2 className="text-3xl font-bold mb-6 text-blue-400">
          Login required to access settings
        </h2>

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
        >
          Back
        </button>
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

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setPasswordLoading(true);
    try {
      await usersApi.changePassword(user!.id, newPassword);
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
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
            2FA API Pending
          </span>
        </div>
        <div className="space-y-3">
          {/* Two-Factor Authentication - Placeholder */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#FFFFFF1A] px-4 py-3">
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
              disabled
              className="px-3 py-1.5 rounded-md text-sm font-bold border border-[#FFFFFF1A] text-gray-500 cursor-not-allowed"
            >
              Enable / Disable
            </button>
          </div>

          {/* Password Change */}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-[#FFFFFF1A] px-4 py-3">
            <div>
              <p className="text-white font-semibold">Password</p>
              <p className="text-sm text-gray-400">
                Update your password regularly to keep your account protected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 rounded-md text-sm font-bold border border-[#FFFFFF1A] text-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
            >
              Change Password
            </button>
          </div>
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
            <p className="text-white font-semibold">Player appearance</p>
            <p className="text-sm text-gray-400 mb-3">
              Choose your player look and style on the game board.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePlayerIconSetSelect("star")}
                aria-pressed={selectedPlayerIconSet === "star"}
                className={`rounded-md border bg-[#0B0B0F] p-3 text-left transition-colors ${
                  selectedPlayerIconSet === "star"
                    ? "border-cyan-300"
                    : "border-[#FFFFFF1A] hover:border-cyan-500/60"
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
                className={`rounded-md border bg-[#0B0B0F] p-3 text-left transition-colors ${
                  selectedPlayerIconSet === "space_inv"
                    ? "border-cyan-300"
                    : "border-[#FFFFFF1A] hover:border-cyan-500/60"
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1F] rounded-xl border border-[#FFFFFF1A] p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">
              Change Password
            </h3>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-300 text-sm">
                Password changed successfully!
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-300 text-sm">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordLoading}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0B0F] border border-[#FFFFFF1A] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordLoading}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0B0F] border border-[#FFFFFF1A] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError(null);
                  }}
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 rounded-lg border border-[#FFFFFF1A] text-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? "Changing..." : "Change"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
