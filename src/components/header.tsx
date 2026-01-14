'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import {
    Code2,
    Compass,
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    Search,
    X,
} from 'lucide-react';
import { userAtom, isCommandPaletteOpenAtom } from '@/store';
import { signOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function Header() {
    const [user] = useAtom(userAtom);
    const [, setCommandPaletteOpen] = useAtom(isCommandPaletteOpenAtom);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
            router.push('/');
        } catch (error) {
            toast.error('Failed to sign out');
        }
    };

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-[var(--edge)] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto px-2 md:max-w-3xl">
                <div className="flex h-14 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Code2 className="h-5 w-5" />
                        <span className="font-semibold">PasteShare</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link href="/explore">
                            <Button variant="ghost" size="sm">
                                Explore
                            </Button>
                        </Link>
                        {user && (
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm">
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search Button */}
                        <Button
                            variant="outline"
                            onClick={() => setCommandPaletteOpen(true)}
                            className="hidden md:flex relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/30 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-32 lg:w-48"
                        >
                            <span className="hidden lg:inline-flex">Search...</span>
                            <span className="inline-flex lg:hidden">Search</span>
                            <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-6 select-none items-center gap-1 rounded border border-edge bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </Button>

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <div className="h-8 w-8 rounded-full bg-muted border border-[var(--edge)] text-foreground flex items-center justify-center text-xs font-medium">
                                            {getInitials(user.email)}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center gap-2 p-2">
                                        <div className="h-8 w-8 rounded-full bg-muted border border-[var(--edge)] text-foreground flex items-center justify-center text-xs font-medium">
                                            {getInitials(user.email)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium truncate max-w-[150px]">
                                                {user.email}
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth">
                                <Button size="sm">Sign In</Button>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-[var(--edge)] py-4">
                        <nav className="flex flex-col gap-2">
                            <Link href="/explore" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                    <Compass className="h-4 w-4 mr-2" />
                                    Explore
                                </Button>
                            </Link>
                            {user && (
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                    <Button variant="ghost" className="w-full justify-start">
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        Dashboard
                                    </Button>
                                </Link>
                            )}
                            <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setCommandPaletteOpen(true);
                                }}
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Search
                            </Button>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
