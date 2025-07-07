'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import { NotificationContainer } from '@/components/Notification';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showNavbar?: boolean;
  notifications?: any[];
}

export default function PageLayout({ 
  children, 
  className = "", 
  showNavbar = true,
  notifications = []
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      {showNavbar && <Navbar />}
      
      <main className={className}>
        {children}
      </main>

      <NotificationContainer notifications={notifications} />
    </div>
  );
}

// Layout específico para páginas con contenedor centrado
export function ContainerLayout({ 
  children, 
  className = "",
  showNavbar = false, // Cambiado a false porque el Navbar ya está en el layout principal
  notifications = []
}: PageLayoutProps) {
  return (
    <PageLayout showNavbar={showNavbar} notifications={notifications}>
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        {children}
      </div>
    </PageLayout>
  );
}

// Layout específico para páginas de detalles (sin contenedor)
export function DetailLayout({ 
  children, 
  className = "",
  showNavbar = false, // Cambiado a false porque el Navbar ya está en el layout principal
  notifications = []
}: PageLayoutProps) {
  return (
    <PageLayout showNavbar={showNavbar} notifications={notifications}>
      <div className={className}>
        {children}
      </div>
    </PageLayout>
  );
} 