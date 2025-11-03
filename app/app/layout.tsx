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

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';

    // Allow access to onboarding page regardless of onboarding status
    if (pathname === '/app/onboarding') {
      return;
    }

    // If not onboarded and trying to access app routes (except onboarding), redirect to onboarding
    if (!hasOnboarded && pathname !== '/app/onboarding') {
      router.push('/app/onboarding');
    }
  }, [pathname, router]);

  return (
    <ThemeProvider>
      <UserProvider>
        <CycleProvider>
          <OfflineIndicator />
          <QuickPeriodTracker />
          <TopBar />
          <DesktopLayout>
            <PageTransition>
              {children}
            </PageTransition>
          </DesktopLayout>
          <ToastContainer />
          <RegisterSW />
        </CycleProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
