'use client';

import React, { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { userAtom, isAuthLoadingAtom } from '@/store';
import { onAuthStateChange, getCurrentUser } from '@/lib/auth';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/header';
import { CommandPalette } from '@/components/command-palette';
import { FullPageSpinner } from '@/components/ui/spinner';

export function Providers({ children }: { children: React.ReactNode }) {
    const setUser = useSetAtom(userAtom);
    const [isLoading, setIsLoading] = useAtom(isAuthLoadingAtom);

    useEffect(() => {
        getCurrentUser().then((user) => {
            setUser(user);
            setIsLoading(false);
        });

        const { data: { subscription } } = onAuthStateChange((user) => {
            setUser(user);
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setIsLoading]);

    if (isLoading) {
        return <FullPageSpinner />;
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Header />
            <CommandPalette />
            {children}
            <Toaster position="top-right" />
        </TooltipProvider>
    );
}
