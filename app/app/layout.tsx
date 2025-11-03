'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import RegisterSW from '@/app/app/register-sw';
import ToastContainer from '@/app/components/Toast';
import PageTransition from '@/app/components/PageTransition';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { UserProvider } from '@/app/context/UserContext';
import { CycleProvider } from '@/app/context/CycleContext';
import OfflineIndicator from '@/app/components/OfflineIndicator';
import QuickPeriodTracker from '@/app/components/QuickPeriodTracker';
import TopBar from '@/app/components/TopBar';
import DesktopLayout from '@/app/components/DesktopLayout';
import LogViewer from '@/app/components/LogViewer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isOnboarding = pathname === '/app/onboarding';

  useEffect(() => {
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';

    // Allow access to onboarding page regardless of onboarding status
    if (isOnboarding) {
      return;
    }

    // If not onboarded and trying to access app routes (except onboarding), redirect to onboarding
    if (!hasOnboarded && !isOnboarding) {
      router.push('/app/onboarding');
    }
  }, [pathname, router, isOnboarding]);

  return (
    <ThemeProvider>
      <UserProvider>
        <CycleProvider>
          {/* Only show app components if NOT onboarding */}
          {!isOnboarding && (
            <>
              <OfflineIndicator />
              <QuickPeriodTracker />
              <TopBar />
            </>
          )}

          {!isOnboarding ? (
            <DesktopLayout>
              <PageTransition>
                {children}
              </PageTransition>
            </DesktopLayout>
          ) : (
            children
          )}

          {!isOnboarding && (
            <>
              <ToastContainer />
              <RegisterSW />
              <LogViewer />
            </>
          )}
        </CycleProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
