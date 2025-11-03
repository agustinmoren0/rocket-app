'use client'

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RootLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is already onboarded
    const hasOnboarded = localStorage.getItem('hasOnboarded') === 'true';

    // If user is onboarded and trying to access landing, redirect to app
    if (hasOnboarded && pathname === '/landing') {
      router.replace('/app');
    }
  }, [pathname, router]);

  return children;
}
