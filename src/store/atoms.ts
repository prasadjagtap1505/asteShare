import { atom } from 'jotai';
import type { User, FileNode, EditorState } from '@/types';

// Auth atoms
export const userAtom = atom<User | null>(null);
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
export const isAuthLoadingAtom = atom<boolean>(true);



// File tree atoms
export const fileNodesAtom = atom<FileNode[]>([]);
export const selectedNodeIdAtom = atom<string | null>(null);
export const expandedFolderIdsAtom = atom<Set<string>>(new Set<string>());

// Editor atoms
export const editorStateAtom = atom<EditorState>({
    selectedFileId: null,
    content: '',
    isDirty: false,
});

// UI atoms
export const isSidebarOpenAtom = atom<boolean>(true);
export const isCommandPaletteOpenAtom = atom<boolean>(false);
export const isShareModalOpenAtom = atom<boolean>(false);
export const isCreateModalOpenAtom = atom<boolean>(false);

// Derived atoms
export const selectedFileAtom = atom((get) => {
    const nodes = get(fileNodesAtom);
    const selectedId = get(selectedNodeIdAtom);
    if (!selectedId) return null;
    return nodes.find((n) => n.id === selectedId && n.type === 'file') || null;
});

export const selectedFolderAtom = atom((get) => {
    const nodes = get(fileNodesAtom);
    const selectedId = get(selectedNodeIdAtom);
    if (!selectedId) return null;
    return nodes.find((n) => n.id === selectedId && n.type === 'folder') || null;
});

// File tree structure derived atom
export const fileTreeAtom = atom((get) => {
    const nodes = get(fileNodesAtom);

    const buildTree = (parentId: string | null): FileNode[] => {
        return nodes
            .filter((n) => n.parent_id === parentId)
            .map((n) => ({
                ...n,
                children: n.type === 'folder' ? buildTree(n.id) : [],
            }))
            .sort((a, b) => {
                // Folders first
                if (a.type !== b.type) {
                    return a.type === 'folder' ? -1 : 1;
                }
                // Then alphabetically
                return a.name.localeCompare(b.name);
            });
    };

    return buildTree(null);
});
