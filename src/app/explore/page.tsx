'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
    Search,
    Globe,
    Calendar,
    ArrowRight,
    FileText,
} from 'lucide-react';
import { FileIcon } from '@/components/file-icon';
import { getPublicFileNodes } from '@/lib/db';
import { formatRelativeTime } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import type { FileNode } from '@/types';

export default function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: files,
        error,
        isLoading,
    } = useSWR('public-files', getPublicFileNodes);

    const filteredFiles = files?.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="mx-auto space-y-12 px-2 py-8 md:max-w-3xl">
            {/* Header Panel */}
            <section className="panel">
                <div className="panel-header border-b border-[var(--edge)]">
                    <div className="flex items-center justify-between">
                        <h1 className="panel-title">Explore</h1>
                        <Badge variant="secondary">
                            {filteredFiles?.length || 0} files
                        </Badge>
                    </div>
                </div>
                <div className="panel-content">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search public files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </section>

            {/* Files Grid Panel */}
            <section className="panel">
                <div className="panel-header border-b border-[var(--edge)]">
                    <h2 className="text-lg font-semibold">Public Files</h2>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Spinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="panel-content text-center py-12">
                        <p className="text-destructive">Failed to load files</p>
                    </div>
                ) : filteredFiles?.length === 0 ? (
                    <div className="panel-content text-center py-12">
                        <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="font-semibold mb-1">No public files found</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : 'Be the first to share a file!'}
                        </p>
                        <Link href="/dashboard">
                            <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4 mr-2" />
                                Create a File
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--edge)]">
                        {filteredFiles?.map((file) => (
                            <FileCard key={file.id} file={file} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function FileCard({ file }: { file: FileNode }) {
    return (
        <Link href={`/share/${file.share_id}`}>
            <div className="group p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                        <FileIcon filename={file.name} className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                            <h3 className="font-medium truncate group-hover:underline">
                                {file.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatRelativeTime(file.created_at)}</span>
                            </div>
                        </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                </div>
            </div>
        </Link>
    );
}
