'use client';

import { useSession } from 'next-auth/react';
import { TravelWorkspace } from '@/components/layout/travel-workspace';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifyEmailBanner } from '@/components/auth/verify-banner';
import { useAppBranding } from '@/lib/branding/use-app-branding';

function ProtectedSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <div className="fixed inset-y-0 left-0 w-72 border-r bg-sidebar" />
      </div>
      <div className="lg:pl-72">
        <div className="border-b bg-background px-8 py-4">
          <Skeleton className="h-8 w-64" />
        </div>
        <main className="p-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { branding } = useAppBranding({ enabled: status === 'authenticated' });

  if (status === 'loading' || !session) {
    return <ProtectedSkeleton />;
  }

  return (
    <TravelWorkspace branding={branding}>
            <VerifyEmailBanner />
            {children}
    </TravelWorkspace>
  );
}
