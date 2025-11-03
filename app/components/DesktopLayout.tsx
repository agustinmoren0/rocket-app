'use client'

import { usePathname } from 'next/navigation';
import DesktopSidebar from './DesktopSidebar';
import BottomNav from './BottomNav';

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/app/onboarding';

  if (isOnboarding) return <>{children}</>;

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content con margin para desktop */}
      <div className="lg:ml-72 min-h-screen pb-20 lg:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Nav (solo en mobile) */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </>
  );
}
