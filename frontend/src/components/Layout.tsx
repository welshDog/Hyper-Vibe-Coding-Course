import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { HUD } from './HUD';
import { useAuthStore } from '../context/auth';

export function Layout() {
  const { user } = useAuthStore();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {user && <HUD />}
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
