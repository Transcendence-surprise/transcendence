import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from './components/Layout';
import Home from './pages/Home';
import LayoutWithSidebar from './components/LayoutWithSidebar';
import GameEntryRoute from './game/routes/GameEntryRote';
import SinglePlayerSetupRoute from "./game/routes/SingleSetupRoute";
import MultiplayerSetupRoute from "./game/routes/MultiplayerSetupRoute";
import MultiplayerCreateRoute from "./game/routes/MultiplayerCreateRoute";
import MultiplayerJoinRoute from "./game/routes/JoinRoute";
import LobbyRoute from "./game/routes/LobbyRoute";
import GameRoute from "./game/routes/GameRoute";
import ProtectedRoute from "./game/routes/ProtectedRoute";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
            <Route path="multiplayer/setup" element={<MultiplayerSetupRoute />} />

            {/* Create Game route (Host) */}
            <Route
              path="multiplayer/create"
              element={
                // <ProtectedRoute>
                  <MultiplayerCreateRoute />
                // </ProtectedRoute>
              }
            />

            {/* Join Game route (Player) */}
            <Route path="/multiplayer/join" element={<MultiplayerJoinRoute />} />

            {/* Multiplayer lobby */}
            <Route
              path="multiplayer/lobby/:gameId"
              element={
                // <ProtectedRoute>
                  <LobbyRoute />
                // </ProtectedRoute>
              }
            />

            {/* Game screen */}
            <Route
              path="game/:id"
              element={
                // <ProtectedRoute>
                  <GameRoute />
                // </ProtectedRoute>
              }
            />

          {/* Other XD routes */}

          {/* Future routes - uncomment when ready */}
          {/* <Route path="profile" element={<Profile />} /> */}
          {/* <Route path="leaderboard" element={<Leaderboard />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
          
          {/* 404 Not Found */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
      </Route> 
      </Routes>
    </BrowserRouter>
  );
}
