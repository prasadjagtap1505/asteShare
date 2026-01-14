'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom, useSetAtom } from 'jotai';
import useSWR from 'swr';
import {
    FilePlus,
    FolderPlus,
    Share2,
    Trash2,
    Copy,
    Check,
    Globe,
    FileText,
    ChevronRight,
    ChevronDown,
    MoreHorizontal,
} from 'lucide-react';
import { FileIcon } from '@/components/file-icon';
import {
    userAtom,
    fileNodesAtom,
    selectedNodeIdAtom,
    editorStateAtom,
} from '@/store';
import {
    getFileNodes,
    createFileNode,
    updateFileContent,
    deleteFileNode,
    generateShareLink,
    togglePublic,
} from '@/lib/db';
import { copyToClipboard, getShareUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { FileNode, FileNodeType } from '@/types';

export default function DashboardPage() {
    const router = useRouter();
    const [user] = useAtom(userAtom);
    const [fileNodes, setFileNodes] = useAtom(fileNodesAtom);
    const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom);
    const [editorState, setEditorState] = useAtom(editorStateAtom);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [createType, setCreateType] = useState<FileNodeType>('file');
    const [createParentId, setCreateParentId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [copied, setCopied] = useState(false);

    const [nodeToDelete, setNodeToDelete] = useState<FileNode | null>(null);

    const {
        data: nodes,
        isLoading,
        mutate: mutateNodes,
    } = useSWR(
        user ? `file-nodes-${user.id}` : null,
        () => (user ? getFileNodes(user.id) : [])
    );

    useEffect(() => {
        if (nodes) {
            setFileNodes(nodes);

            // Automatically expand all folders when nodes are loaded
            const folderIds = nodes
                .filter((n) => n.type === 'folder')
                .map((n) => n.id);
            setExpandedFolders(new Set(folderIds));

            // If no file is selected, select the first one automatically
            if (!selectedFile && nodes.length > 0) {
                const firstFile = nodes.find((n) => n.type === 'file');
                if (firstFile) {
                    setSelectedFile(firstFile);
                    setSelectedNodeId(firstFile.id);
                    setEditorState({
                        selectedFileId: firstFile.id,
                        content: firstFile.content || '',
                        isDirty: false,
                    });
                }
            }
        }
    }, [nodes, setFileNodes, selectedFile, setSelectedNodeId, setEditorState]);

    useEffect(() => {
        if (!user) {
            router.push('/auth');
        }
    }, [user, router]);

    const handleSave = async () => {
        if (!selectedFile || !editorState.isDirty) return;
        try {
            await updateFileContent(selectedFile.id, editorState.content);
            await mutateNodes();
            setEditorState((prev) => ({ ...prev, isDirty: false }));
            toast.success('Saved!');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to save');
        }
    };

    // Keyboard shortcut for save
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                if (editorState.isDirty && selectedFile) {
                    handleSave();
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [editorState.isDirty, selectedFile, handleSave]);

    const handleCreate = async () => {
        if (!user || !newName.trim()) return;
        try {
            await createFileNode(
                user.id,
                createParentId,
                createType,
                newName.trim(),
                createType === 'file' ? '' : null
            );
            await mutateNodes();
            setIsCreateOpen(false);
            setNewName('');
            toast.success(`${createType === 'file' ? 'File' : 'Folder'} created!`);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to create');
        }
    };

    const confirmDelete = (node: FileNode) => {
        setNodeToDelete(node);
        setIsDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!nodeToDelete) return;
        try {
            await deleteFileNode(nodeToDelete.id);
            await mutateNodes();

            // If we deleted the currently selected file, clear selection
            if (selectedFile?.id === nodeToDelete.id) {
                setSelectedFile(null);
                setSelectedNodeId(null);
                setEditorState({ selectedFileId: null, content: '', isDirty: false });
            }

            setNodeToDelete(null);
            setIsDeleteOpen(false);
            toast.success('Deleted!');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete');
        }
    };



    const handleSelectFile = (node: FileNode) => {
        if (node.type === 'folder') {
            toggleFolder(node.id);
            return;
        }
        setSelectedFile(node);
        setSelectedNodeId(node.id);
        setEditorState({
            selectedFileId: node.id,
            content: node.content || '',
            isDirty: false,
        });
    };

    const toggleFolder = (folderId: string) => {
        setExpandedFolders((prev) => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    const handleContentChange = (content: string) => {
        setEditorState((prev) => ({
            ...prev,
            content,
            isDirty: true,
        }));
    };

    const openCreate = (type: FileNodeType, parentId: string | null = null) => {
        setCreateType(type);
        setCreateParentId(parentId);
        setNewName('');
        setIsCreateOpen(true);
    };

    const handleGenerateLink = async () => {
        if (!selectedFile) return;
        try {
            const shareId = await generateShareLink(selectedFile.id);
            await mutateNodes();
            setSelectedFile((prev) => (prev ? { ...prev, share_id: shareId } : null));
            await copyToClipboard(getShareUrl(shareId));
            setCopied(true);
            toast.success('Link copied!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to generate link');
        }
    };

    const handleTogglePublic = async (isPublic: boolean) => {
        if (!selectedFile) return;
        try {
            let shareId = selectedFile.share_id;

            // If making public and no share link exists, generate one
            if (isPublic && !shareId) {
                shareId = await generateShareLink(selectedFile.id);
            }

            await togglePublic(selectedFile.id, isPublic);
            await mutateNodes();

            setSelectedFile((prev) => (prev ? {
                ...prev,
                is_public: isPublic,
                share_id: shareId
            } : null));

            toast.success(isPublic ? 'Now public!' : 'Now private');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to update');
        }
    };

    const handleCopyLink = async () => {
        if (!selectedFile?.share_id) return;
        await copyToClipboard(getShareUrl(selectedFile.share_id));
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Build tree structure
    const rootNodes = fileNodes.filter((n) => n.parent_id === null);
    const getChildren = (parentId: string) =>
        fileNodes.filter((n) => n.parent_id === parentId);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <main className="mx-auto px-2 py-6 md:max-w-5xl">
            <div className="panel h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="panel-header border-b border-[var(--edge)] flex items-center justify-between shrink-0">
                    <h2 className="font-semibold">My Files</h2>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openCreate('file')}>
                            <FilePlus className="h-4 w-4 mr-1" />
                            File
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openCreate('folder')}>
                            <FolderPlus className="h-4 w-4 mr-1" />
                            Folder
                        </Button>
                    </div>
                </div>

                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* File Tree */}
                    <div className="w-64 border-r border-[var(--edge)] overflow-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Spinner />
                            </div>
                        ) : rootNodes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <FolderPlus className="h-10 w-10 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground mb-3">No files yet</p>
                                <Button size="sm" variant="outline" onClick={() => openCreate('folder')}>
                                    Create Folder
                                </Button>
                            </div>
                        ) : (
                            <div className="p-2">
                                {rootNodes
                                    .sort((a, b) => {
                                        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                                        return a.name.localeCompare(b.name);
                                    })
                                    .map((node) => (
                                        <TreeNode
                                            key={node.id}
                                            node={node}
                                            level={0}
                                            selectedId={selectedNodeId}
                                            expandedFolders={expandedFolders}
                                            getChildren={getChildren}
                                            onSelect={handleSelectFile}
                                            onToggle={toggleFolder}
                                            onCreateFile={(parentId) => openCreate('file', parentId)}
                                            onCreateFolder={(parentId) => openCreate('folder', parentId)}
                                            onDelete={confirmDelete}
                                        />
                                    ))}
                            </div>
                        )}
                    </div>

                    {/* Editor */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {selectedFile ? (
                            <>
                                {/* File Header */}
                                <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--edge)] shrink-0">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileIcon filename={selectedFile.name} className="h-4 w-4 shrink-0" />
                                        <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                                        {editorState.isDirty && (
                                            <span className="text-xs text-muted-foreground">•</span>
                                        )}
                                        {selectedFile.is_public && (
                                            <Badge variant="success" className="text-[10px] px-1.5 py-0">Public</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => setIsShareOpen(true)} className="h-7">
                                            <Share2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => confirmDelete(selectedFile)}
                                            className="h-7 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Editor Area */}
                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <textarea
                                        value={editorState.content}
                                        onChange={(e) => handleContentChange(e.target.value)}
                                        placeholder="Start typing..."
                                        className="w-full h-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed focus:outline-none placeholder:text-muted-foreground overflow-auto whitespace-pre"
                                        spellCheck={false}
                                    />
                                </div>

                                {/* Save Button */}
                                {editorState.isDirty && (
                                    <div className="px-3 py-2 border-t border-[var(--edge)] shrink-0">
                                        <Button size="sm" onClick={handleSave}>
                                            Save (⌘S)
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">Select a file to edit</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create {createType === 'file' ? 'File' : 'Folder'}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder={createType === 'file' ? 'example.cpp' : 'Folder name'}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!newName.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share File</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="public-toggle">Make public (visible in Explore)</Label>
                            <Switch
                                id="public-toggle"
                                checked={selectedFile?.is_public || false}
                                onCheckedChange={handleTogglePublic}
                            />
                        </div>

                        {selectedFile?.share_id ? (
                            <div className="space-y-2">
                                <Label>Share Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={getShareUrl(selectedFile.share_id)}
                                        readOnly
                                        className="font-mono text-xs"
                                    />
                                    <Button variant="outline" onClick={handleCopyLink}>
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Link expires 5 hours after generation. Click below to regenerate.
                                </p>
                                <Button variant="outline" size="sm" onClick={handleGenerateLink} className="w-full">
                                    Regenerate Link (Reset TTL)
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Button onClick={handleGenerateLink} className="w-full">
                                    Generate Share Link
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    Share links expire after 5 hours
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete {nodeToDelete?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground py-4">
                        Are you sure you want to delete &quot;{nodeToDelete?.name}&quot;?
                        {nodeToDelete?.type === 'folder' && ' All files inside will also be deleted.'}
                        This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

// Tree Node Component
function TreeNode({
    node,
    level,
    selectedId,
    expandedFolders,
    getChildren,
    onSelect,
    onToggle,
    onCreateFile,
    onCreateFolder,
    onDelete,
}: {
    node: FileNode;
    level: number;
    selectedId: string | null;
    expandedFolders: Set<string>;
    getChildren: (parentId: string) => FileNode[];
    onSelect: (node: FileNode) => void;
    onToggle: (folderId: string) => void;
    onCreateFile: (parentId: string) => void;
    onCreateFolder: (parentId: string) => void;
    onDelete: (node: FileNode) => void;
}) {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedId === node.id;
    const children = isFolder ? getChildren(node.id) : [];

    return (
        <div>
            <div
                className={`group flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-sm ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => onSelect(node)}
            >
                {isFolder ? (
                    <>
                        {isExpanded ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                        ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        )}
                        <span className="truncate flex-1">{node.name}</span>
                    </>
                ) : (
                    <>
                        <FileIcon filename={node.name} className="h-3 w-3 shrink-0 ml-3" />
                        <span className="truncate flex-1">{node.name}</span>
                        {node.is_public && <Globe className="h-3 w-3 text-muted-foreground shrink-0" />}
                    </>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 hover:bg-background rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {isFolder && (
                            <>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateFile(node.id); }}>
                                    <FilePlus className="h-4 w-4 mr-2" />
                                    New File
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCreateFolder(node.id); }}>
                                    <FolderPlus className="h-4 w-4 mr-2" />
                                    New Folder
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                            </>
                        )}
                        <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onDelete(node); }}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {isFolder && isExpanded && children.length > 0 && (
                <div>
                    {children
                        .sort((a, b) => {
                            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                            return a.name.localeCompare(b.name);
                        })
                        .map((child) => (
                            <TreeNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                selectedId={selectedId}
                                expandedFolders={expandedFolders}
                                getChildren={getChildren}
                                onSelect={onSelect}
                                onToggle={onToggle}
                                onCreateFile={onCreateFile}
                                onCreateFolder={onCreateFolder}
                                onDelete={onDelete}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
