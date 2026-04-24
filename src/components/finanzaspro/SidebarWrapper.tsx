'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { ViewState } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

export default function SidebarWrapper({ user, children }: { user: any, children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const currentView = pathname.split('/')[1] as ViewState || 'dashboard';

  const handleNavigate = (view: ViewState) => {
    router.push(`/${view}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar min-h-screen">
        <div className="lg:hidden flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-icons-round text-primary-foreground text-sm">payments</span>
            </div>
            <span className="font-bold text-foreground text-sm">
              Finanzas<span className="text-primary">Pro</span>
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg bg-card border border-border flex items-center justify-center"
          >
            <span className="material-icons-round text-foreground">menu</span>
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
