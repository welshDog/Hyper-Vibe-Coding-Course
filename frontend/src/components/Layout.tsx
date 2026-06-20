import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { HUD } from './HUD';
import { PetMentorDock } from './pets/PetMentorDock';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-hfz-space-black text-hfz-text-primary">
      <HUD />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {/* Floating pet mentor — persists across the whole course chrome
          (signed-in only). Lesson pages (/learn) mount their own in LessonPlayer. */}
      <PetMentorDock />
    </div>
  );
}
