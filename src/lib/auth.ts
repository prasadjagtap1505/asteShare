import { supabase } from './supabase/client';
import type { User } from '@/types';

export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(error.message);
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
    };
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        return null;
    }

    return session;
}

export function onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            callback({
                id: session.user.id,
                email: session.user.email || '',
                created_at: session.user.created_at,
            });
        } else {
            callback(null);
        }
    });
}

export async function resendVerificationEmail(email: string) {
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
    });

    if (error) {
        throw new Error(error.message);
    }

    return true;
}
