export type FileNodeType = 'file' | 'folder';

export interface FileNode {
    id: string;
    owner_id: string;
    parent_id: string | null;
    type: FileNodeType;
    name: string;
    content: string | null;
    is_public: boolean;
    share_id: string | null;
    share_expires_at: string | null;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
}

export interface EditorState {
    selectedFileId: string | null;
    content: string;
    isDirty: boolean;
}

// Helper to check if a share link is expired
export function isShareExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
}
