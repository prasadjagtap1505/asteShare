'use client';

import React from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { useRouter, usePathname } from 'next/navigation';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Home,
    FolderPlus,
    Compass,
    LayoutDashboard,
    LogOut,
    Search,
    Command as CmdIcon,
    FileText,
    Folder,
    FileCode,
} from 'lucide-react';
import { FileIcon } from '@/components/file-icon';
import {
    isCommandPaletteOpenAtom,
    userAtom,
    fileNodesAtom,
    selectedNodeIdAtom,
    editorStateAtom,
} from '@/store';
import { signOut } from '@/lib/auth';
import { toast } from 'sonner';

export function CommandPalette() {
    const [isOpen, setIsOpen] = useAtom(isCommandPaletteOpenAtom);
    const [user] = useAtom(userAtom);
    const [fileNodes] = useAtom(fileNodesAtom);
    const setSelectedNodeId = useSetAtom(selectedNodeIdAtom);
    const setEditorState = useSetAtom(editorStateAtom);

    const router = useRouter();
    const pathname = usePathname();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [setIsOpen]);

    const handleSelect = (value: string) => {
        setIsOpen(false);

        // Check if it's a file selection
        if (value.startsWith('file-')) {
            const fileId = value.replace('file-', '');
            const file = fileNodes.find(n => n.id === fileId);

            if (file) {
                setSelectedNodeId(file.id);
                setEditorState({
                    selectedFileId: file.id,
                    content: file.content || '',
                    isDirty: false,
                });

                if (pathname !== '/dashboard') {
                    router.push('/dashboard');
                }
                return;
            }
        }

        switch (value) {
            case 'home':
                router.push('/');
                break;
            case 'dashboard':
                router.push('/dashboard');
                break;
            case 'explore':
                router.push('/explore');
                break;
            case 'new-project':
                router.push('/dashboard?new=true');
                break;
            case 'logout':
                signOut().then(() => {
                    toast.success('Logged out successfully');
                    router.push('/');
                });
                break;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md"
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -20 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 px-4"
                    >
                        <Command className="overflow-hidden rounded-2xl border border-edge bg-background shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center border-b border-edge px-4">
                                <Search className="h-5 w-5 text-muted-foreground/50" />
                                <Command.Input
                                    placeholder="Search files, commands, and more..."
                                    className="flex-1 bg-transparent py-5 px-3 text-lg placeholder:text-muted-foreground/40 outline-none"
                                />
                                <div className="flex items-center gap-1.5">
                                    <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border border-edge bg-muted/30 px-2 text-[10px] font-medium text-muted-foreground select-none">
                                        <CmdIcon className="h-2.5 w-2.5" />
                                        <span>K</span>
                                    </kbd>
                                    <kbd className="hidden sm:inline-flex h-6 items-center rounded-md border border-edge bg-muted/30 px-2 text-[10px] font-medium text-muted-foreground select-none">
                                        ESC
                                    </kbd>
                                </div>
                            </div>

                            <Command.List className="max-h-[min(450px,65vh)] overflow-y-auto p-2 scrollbar-none selection:bg-primary/10">
                                <Command.Empty className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="rounded-full bg-muted p-4">
                                            <Search className="h-6 w-6 text-muted-foreground/40" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">No results found</p>
                                            <p className="text-xs text-muted-foreground">Try a different search term or command.</p>
                                        </div>
                                    </div>
                                </Command.Empty>

                                {user && fileNodes.length > 0 && (
                                    <Command.Group>
                                        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                                            Your Files
                                        </div>
                                        {fileNodes
                                            .filter(node => node.type === 'file')
                                            .map(file => (
                                                <CommandItem key={file.id} value={`file-${file.id}`} onSelect={handleSelect}>
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 group-data-[selected=true]:bg-background/20 transition-all">
                                                        <FileIcon filename={file.name} className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-medium text-foreground/90 group-data-[selected=true]:text-foreground leading-none">
                                                            {file.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground group-data-[selected=true]:text-foreground/60">
                                                            {file.is_public ? 'Public' : 'Private'} • Last updated {new Date(file.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                    </Command.Group>
                                )}

                                <Command.Group className="mt-4">
                                    <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 border-t border-edge/30 mt-2 pt-4">
                                        Navigation
                                    </div>
                                    <CommandItem value="home" onSelect={handleSelect}>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground transition-all">
                                            <Home className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-foreground/90 group-data-[selected=true]:text-foreground">Home</span>
                                    </CommandItem>
                                    <CommandItem value="explore" onSelect={handleSelect}>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground transition-all">
                                            <Compass className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-foreground/90 group-data-[selected=true]:text-foreground">Explore</span>
                                    </CommandItem>
                                    {user && (
                                        <CommandItem value="dashboard" onSelect={handleSelect}>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground transition-all">
                                                <LayoutDashboard className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-foreground/90 group-data-[selected=true]:text-foreground">Dashboard</span>
                                        </CommandItem>
                                    )}
                                </Command.Group>

                                {user && (
                                    <Command.Group className="mt-4">
                                        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 border-t border-edge/30 mt-2 pt-4">
                                            Actions
                                        </div>
                                        <CommandItem value="new-project" onSelect={handleSelect}>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground transition-all">
                                                <FolderPlus className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-foreground/90 group-data-[selected=true]:text-foreground">Create New Item</span>
                                        </CommandItem>
                                        <CommandItem value="logout" onSelect={handleSelect}>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive group-data-[selected=true]:bg-destructive group-data-[selected=true]:text-destructive-foreground transition-all">
                                                <LogOut className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-foreground/90 group-data-[selected=true]:text-foreground">Sign Out</span>
                                        </CommandItem>
                                    </Command.Group>
                                )}
                            </Command.List>

                            <div className="flex items-center justify-between border-t border-edge bg-muted/20 px-4 py-3 text-[10px] text-muted-foreground/60 font-medium">
                                <div className="flex gap-6">
                                    <span className="flex items-center gap-1.5">
                                        <kbd className="rounded-[4px] border border-edge bg-background px-1.5 py-0.5 text-[9px]">↑↓</kbd> Navigate
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <kbd className="rounded-[4px] border border-edge bg-background px-1.5 py-0.5 text-[9px]">↵</kbd> Select
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500/50 animate-pulse" />
                                    <span>Cloud Sync Active</span>
                                </div>
                            </div>
                        </Command>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function CommandItem({
    children,
    value,
    onSelect,
}: {
    children: React.ReactNode;
    value: string;
    onSelect: (value: string) => void;
}) {
    return (
        <Command.Item
            value={value}
            onSelect={onSelect}
            className="group flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl cursor-pointer data-[selected=true]:bg-muted/80 data-[selected=true]:shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 active:scale-[0.99]"
        >
            {children}
        </Command.Item>
    );
}
