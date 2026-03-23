import { Outlet } from 'react-router-dom';
import Sidebar from './UI/Sidebar';

export default function LayoutWithSidebar() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-bg-dark text-blue-hero">
        <Outlet />
      </main>
    </div>
  );
}
