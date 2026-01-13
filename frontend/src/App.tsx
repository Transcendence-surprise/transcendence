import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from './components/Layout';
import Home from './pages/Home';
import GameSetupRoute from './game/screens/GameRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout wraps all routes */}
        <Route path="/" element={<Layout />}>
          {/* Home page */}
          <Route index element={<Home />} />
          
          {/* Game routes */}
          <Route path="game" element={<GameSetupRoute />} />
          
          {/* Future routes - uncomment when ready */}
          {/* <Route path="profile" element={<Profile />} /> */}
          {/* <Route path="leaderboard" element={<Leaderboard />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
          
          {/* 404 Not Found */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route> 
      </Routes>
    </BrowserRouter>
  );
}
