import { atom } from 'jotai';
import type { User, FileNode, EditorState } from '@/types';

// Auth state
export const userAtom = atom<User | null>(null);
export const isAuthLoadingAtom = atom<boolean>(true);

// File system state
export const fileNodesAtom = atom<FileNode[]>([]);
export const selectedNodeIdAtom = atom<string | null>(null);

// Editor state
export const editorStateAtom = atom<EditorState>({
    selectedFileId: null,
    content: '',
    isDirty: false,
});

// UI state
export const isCommandPaletteOpenAtom = atom<boolean>(false);
