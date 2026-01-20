import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function LayoutWithSidebar() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-black text-blue-400">
        <Outlet />
      </main>
    </div>
  );
}
