'use client'

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

  return <>{children}</>;
}
