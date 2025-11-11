'use client'

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import ErrorBoundary from './components/ErrorBoundary';
import DebugPanel from './components/DebugPanel';
import InstallPrompt from './components/InstallPrompt';

export default function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is already onboarded
    const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';

    // If user is onboarded and trying to access landing, redirect to app
    // This prevents flash of wrong content before redirect
    if (hasOnboarded && pathname === '/landing') {
      router.replace('/app');
      // Stay in loading state until redirect completes
    } else {
      // Otherwise, we're showing the right content
      setIsChecking(false);
      setIsMounted(true);
    }
  }, [pathname, router]);

  // Prevent hydration mismatch - don't render until mounted
  if (!isMounted) {
    return (
      <ErrorBoundary>
        <div className="w-full h-screen bg-[#FFF5F0] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-4 border-[#6B9B9E]/20 border-t-[#6B9B9E] animate-spin" />
            <p className="text-[#6B9B9E] text-sm">Cargando...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      {children}
      <InstallPrompt />
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </ErrorBoundary>
  );
}
