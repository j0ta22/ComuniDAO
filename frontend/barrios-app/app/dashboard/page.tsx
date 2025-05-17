//app/dashboard/page.tsx
'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { AdminPanel } from '@/components/dashboard/AdminPanel'

export default function Dashboard() {
    const { authenticated, user } = usePrivy();
    const router = useRouter();

    useEffect(() => {
        if (!authenticated) {
            router.push('/');
        }
    }, [authenticated, router]);

    if (!authenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Panel del administrador</h1>
                <div className="grid gap-6">
                    <div className="p-6 bg-card rounded-lg shadow text-center">
                        <h2 className="text-xl font-semibold mb-4">Información de la wallet owner</h2>
                        <p className="text-muted-foreground">
                            Dirección: {user?.wallet?.address}
                        </p>
                    </div>
                </div>
                <AdminPanel />
            </main>
        </div>
    );
}
