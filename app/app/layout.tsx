'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import RegisterSW from '@/app/app/register-sw';
import ToastContainer from '@/app/components/Toast';
import PageTransition from '@/app/components/PageTransition';
import { ThemeProvider } from '@/app/context/ThemeContext';
import { UserProvider } from '@/app/context/UserContext';
import { CycleProvider } from '@/app/context/CycleContext';
import { ActivityProvider } from '@/app/context/ActivityContext';
import OfflineIndicator from '@/app/components/OfflineIndicator';
import QuickPeriodTracker from '@/app/components/QuickPeriodTracker';
import TopBar from '@/app/components/TopBar';
import DesktopLayout from '@/app/components/DesktopLayout';
import LogViewer from '@/app/components/LogViewer';
import { SyncStatus } from '@/app/components/SyncStatus';
import { useUser } from '@/app/context/UserContext';
import { hasCompletedOnboarding } from '@/app/lib/onboarding-manager';

/**
 * Onboarding Guard Component
 * Checks if user has completed onboarding and redirects if not
 */
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const [isChecking, setIsChecking] = useState(true);
  const isOnboarding = pathname === '/app/onboarding';

  useEffect(() => {
    const checkOnboarding = async () => {
      // Allow access to onboarding page regardless of status
      if (isOnboarding) {
        setIsChecking(false);
        return;
      }

      // Wait for user context to load
      if (isLoading) {
        return;
      }

      // Check if user has completed onboarding
      const hasOnboarded = await hasCompletedOnboarding(user?.id);

      if (!hasOnboarded) {
        console.log('👤 User not onboarded, redirecting to onboarding');
        router.push('/app/onboarding');
      }

      setIsChecking(false);
    };

    checkOnboarding();
  }, [pathname, isOnboarding, user?.id, isLoading, router]);

  // Show nothing while checking onboarding status
  if (isChecking && !isOnboarding) {
    return <div className="w-full h-screen bg-white" />;
  }

  return <>{children}</>;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboarding = pathname === '/app/onboarding';

  return (
    <ThemeProvider>
      <UserProvider>
        <OnboardingGuard>
          <CycleProvider>
            <ActivityProvider>
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
                  <SyncStatus />
                  <ToastContainer />
                  <RegisterSW />
                  {/* Only show LogViewer in development mode */}
                  {process.env.NODE_ENV === 'development' && <LogViewer />}
                </>
              )}
            </ActivityProvider>
          </CycleProvider>
        </OnboardingGuard>
      </UserProvider>
    </ThemeProvider>
  );
}
