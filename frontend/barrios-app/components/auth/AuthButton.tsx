'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
    const { ready, authenticated, login, logout } = usePrivy();
    const router = useRouter();


    useEffect(() => {
        if (authenticated) {
            router.push('/dashboard');
        }
    }, [authenticated, router]);

    if (!ready) {
        return <Button disabled>Loading...</Button>;
    }

    return (
        <Button onClick={authenticated ? logout : login}>
            {authenticated ? 'Logout' : 'Login with Privy'}
        </Button>
    );
}
