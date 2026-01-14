import { supabase } from './supabase/client';
import { generateShareId } from './utils';
import type { FileNode, FileNodeType } from '@/types';

// Share link TTL in hours
const SHARE_LINK_TTL_HOURS = 5;

// ============================================
// File Nodes
// ============================================

export async function getFileNodes(userId: string): Promise<FileNode[]> {
    const { data, error } = await supabase
        .from('file_nodes')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function getFileNodeByShareId(shareId: string): Promise<FileNode | null> {
    const { data, error } = await supabase
        .from('file_nodes')
        .select('*')
        .eq('share_id', shareId)
        .single();

    if (error) return null;
    return data;
}

export async function getPublicFileNodes(): Promise<FileNode[]> {
    const { data, error } = await supabase
        .from('file_nodes')
        .select('*')
        .eq('is_public', true)
        .eq('type', 'file')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createFileNode(
    ownerId: string,
    parentId: string | null,
    type: FileNodeType,
    name: string,
    content: string | null = null
): Promise<FileNode> {
    const { data, error } = await supabase
        .from('file_nodes')
        .insert({
            owner_id: ownerId,
            parent_id: parentId,
            type,
            name,
            content,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateFileContent(
    nodeId: string,
    content: string
): Promise<void> {
    const { error } = await supabase
        .from('file_nodes')
        .update({ content })
        .eq('id', nodeId);

    if (error) throw error;
}

export async function updateFileNode(
    nodeId: string,
    updates: Partial<FileNode>
): Promise<void> {
    const { error } = await supabase
        .from('file_nodes')
        .update(updates)
        .eq('id', nodeId);

    if (error) throw error;
}

export async function deleteFileNode(nodeId: string): Promise<void> {
    const { error } = await supabase
        .from('file_nodes')
        .delete()
        .eq('id', nodeId);

    if (error) throw error;
}

// Generate share link with 5-hour TTL
export async function generateShareLink(nodeId: string): Promise<string> {
    const shareId = generateShareId();

    // Calculate expiry time (5 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + SHARE_LINK_TTL_HOURS);

    const { error } = await supabase
        .from('file_nodes')
        .update({
            share_id: shareId,
            share_expires_at: expiresAt.toISOString()
        })
        .eq('id', nodeId);

    if (error) throw error;
    return shareId;
}

// Regenerate share link (resets the TTL)
export async function regenerateShareLink(nodeId: string): Promise<string> {
    return generateShareLink(nodeId);
}

export async function togglePublic(nodeId: string, isPublic: boolean): Promise<void> {
    const { error } = await supabase
        .from('file_nodes')
        .update({ is_public: isPublic })
        .eq('id', nodeId);

    if (error) throw error;
}

// Get children of a folder
export async function getChildNodes(parentId: string): Promise<FileNode[]> {
    const { data, error } = await supabase
        .from('file_nodes')
        .select('*')
        .eq('parent_id', parentId)
        .order('type', { ascending: false })
        .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
}
