'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import {
    Calendar,
    Copy,
    Check,
    FileText,
    AlertCircle,
    Globe,
    Clock,
} from 'lucide-react';
import { FileIcon } from '@/components/file-icon';
import { getFileNodeByShareId } from '@/lib/db';
import { copyToClipboard, formatRelativeTime, getShareUrl } from '@/lib/utils';
import { isShareExpired } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

export default function SharePage() {
    const params = useParams();
    const shareId = params.id as string;
    const [copied, setCopied] = useState(false);
    const [contentCopied, setContentCopied] = useState(false);

    const {
        data: file,
        error,
        isLoading,
    } = useSWR(
        shareId ? `file-share-${shareId}` : null,
        () => getFileNodeByShareId(shareId)
    );

    const handleCopyLink = async () => {
        await copyToClipboard(getShareUrl(shareId));
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyContent = async () => {
        if (!file?.content) return;
        await copyToClipboard(file.content);
        setContentCopied(true);
        toast.success('Content copied!');
        setTimeout(() => setContentCopied(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    // Check if link is expired
    const expired = file ? isShareExpired(file.share_expires_at) : false;

    if (error || !file || expired) {
        return (
            <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                    {expired ? (
                        <>
                            <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h1 className="text-2xl font-semibold mb-2">Link Expired</h1>
                            <p className="text-muted-foreground mb-6">
                                This share link has expired. Share links are only valid for 5 hours.
                                Ask the owner to generate a new link.
                            </p>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h1 className="text-2xl font-semibold mb-2">File Not Found</h1>
                            <p className="text-muted-foreground mb-6">
                                This file doesn&apos;t exist or is no longer shared.
                            </p>
                        </>
                    )}
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Calculate time remaining
    const getTimeRemaining = () => {
        if (!file.share_expires_at) return null;
        const expires = new Date(file.share_expires_at);
        const now = new Date();
        const diff = expires.getTime() - now.getTime();
        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m remaining`;
        }
        return `${minutes}m remaining`;
    };

    const timeRemaining = getTimeRemaining();

    return (
        <main className="mx-auto px-2 py-6 md:max-w-3xl">
            {/* Header */}
            <div className="panel mb-6">
                <div className="panel-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <FileIcon filename={file.name} className="h-5 w-5 shrink-0 mt-0.5" />
                        <div>
                            <h1 className="text-xl font-semibold">{file.name}</h1>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatRelativeTime(file.created_at)}</span>
                                {timeRemaining && (
                                    <>
                                        <span>•</span>
                                        <Clock className="h-3 w-3" />
                                        <span>{timeRemaining}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {file.is_public && (
                            <Badge variant="success">
                                <Globe className="h-3 w-3 mr-1" />
                                Public
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyLink}
                            className="h-7 px-2 gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="panel">
                <div className="panel-header border-b border-[var(--edge)] flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Content</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyContent}
                        className="h-7 px-2 gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                    >
                        {contentCopied ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy Content
                            </>
                        )}
                    </Button>
                </div>
                <div className="p-4">
                    <pre className="font-mono text-sm whitespace-pre-wrap break-words bg-muted/30 rounded-md p-4 overflow-x-auto">
                        {file.content || <span className="text-muted-foreground italic">No content</span>}
                    </pre>
                </div>
            </div>
        </main>
    );
}
