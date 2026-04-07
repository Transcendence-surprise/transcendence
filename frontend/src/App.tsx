import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import LayoutWithSidebar from "./components/LayoutWithSidebar";
import GameEntryRoute from "./game/routes/GameEntryRoute";
import SinglePlayerSetupRoute from "./game/routes/SingleSetupRoute";
import MultiplayerSetupRoute from "./game/routes/MultiplayerSetupRoute";
import MultiplayerCreateRoute from "./game/routes/MultiplayerCreateRoute";
import MultiplayerJoinRoute from "./game/routes/JoinRoute";
import LobbyRoute from "./game/routes/LobbyRoute";
import GameRoute from "./game/routes/GameRoute";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import Chat from "./pages/Chat";
import Friends from "./pages/Friends";
import AdminPanel from "./pages/AdminPanel";
import BadRequestPage from "./pages/error/400";
import ForbiddenPage from "./pages/error/403";
import ServerErrorPage from "./pages/error/500";
import BadGatewayPage from "./pages/error/502";
import ServiceUnavailablePage from "./pages/error/503";
import GlobalErrorBoundary from "./components/error/GlobalErrorBoundary";

export default function App() {
  return (
    <BrowserRouter>
      <GlobalErrorBoundary>
        <Routes>
          <Route path="/400" element={<BadRequestPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="/502" element={<BadGatewayPage />} />
          <Route path="/503" element={<ServiceUnavailablePage />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Layout wraps all routes */}
          <Route path="/" element={<Layout />}>
            {/* Home page */}
            <Route index element={<Home />} />
            <Route element={<LayoutWithSidebar />}>
              {/* Game routes */}
              {/* Game entry: select Single or Multiplayer */}
              <Route path="game" element={<GameEntryRoute />} />

              {/* Single Player setup */}
              <Route path="single/setup" element={<SinglePlayerSetupRoute />} />

              {/* Multiplayer setup */}
              <Route
                path="multiplayer/setup"
                element={<MultiplayerSetupRoute />}
              />

              {/* Create Game route (Host) */}
              <Route
                path="multiplayer/create"
                element={<MultiplayerCreateRoute />}
              />

              {/* Join Game route (Player) */}
              <Route
                path="/multiplayer/join"
                element={<MultiplayerJoinRoute />}
              />

              {/* Multiplayer lobby */}
              <Route
                path="multiplayer/lobby/:gameId"
                element={<LobbyRoute />}
              />

              {/* Game screen */}
              <Route path="game/:id" element={<GameRoute />} />

              {/* Other XD routes */}

              {/* Future routes - uncomment when ready */}
              {<Route path="profile" element={<Profile />} />}
              {<Route path="leaderboard" element={<Leaderboard />} />}
              {<Route path="settings" element={<Settings />} />}
              {<Route path="/admin" element={<AdminPanel />} />}
              {<Route path="chat" element={<Chat />} />}
              {<Route path="friends" element={<Friends />} />}
            </Route>

            {/* Redirect unknown/obsolete routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </GlobalErrorBoundary>
    </BrowserRouter>
  );
}
