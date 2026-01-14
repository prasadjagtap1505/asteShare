import React from 'react';
import {
    FileText,
    FileCode,
    FileCode2,
    Database,
    Binary,
    Braces,
    Layout,
    Type,
    Image as ImageIcon,
    Music,
    Video,
    Archive,
    Terminal,
    Atom,
    Hash,
    CodeXml,
    Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileIconProps {
    filename: string;
    className?: string;
}

export const FileIcon = ({ filename, className }: FileIconProps) => {
    const parts = filename.toLowerCase().split('.');
    const extension = parts.pop();
    const basename = parts.join('.');

    // Check for full filenames (like .gitignore, Makefile, etc.)
    const lowerName = filename.toLowerCase();
    if (lowerName === '.gitignore' || lowerName === '.gitconfig') {
        return <Hash className={cn("text-orange-600", className)} />;
    }
    if (lowerName === 'dockerfile' || lowerName.includes('docker-compose')) {
        return <Terminal className={cn("text-blue-400", className)} />;
    }
    if (lowerName === 'makefile') {
        return <Terminal className={cn("text-slate-400", className)} />;
    }
    if (lowerName === 'package.json') {
        return <Braces className={cn("text-red-500", className)} />;
    }

    switch (extension) {
        // Scripts & Languages
        case 'js':
        case 'mjs':
        case 'cjs':
            return <Terminal className={cn("text-yellow-400", className)} />;
        case 'ts':
        case 'mts':
            return <Terminal className={cn("text-blue-400", className)} />;
        case 'py':
            return <Terminal className={cn("text-blue-500", className)} />;
        case 'c':
        case 'cpp':
        case 'cc':
        case 'h':
        case 'hpp':
            return <FileCode className={cn("text-blue-600", className)} />;
        case 'go':
            return <Terminal className={cn("text-cyan-400", className)} />;
        case 'rs':
            return <Terminal className={cn("text-orange-600", className)} />;
        case 'java':
            return <Terminal className={cn("text-red-500", className)} />;
        case 'php':
            return <Terminal className={cn("text-purple-400", className)} />;
        case 'rb':
            return <Terminal className={cn("text-red-600", className)} />;

        // Web & Frameworks
        case 'jsx':
        case 'tsx':
            return <Atom className={cn("text-sky-400", className)} />;
        case 'html':
        case 'htm':
            return <CodeXml className={cn("text-orange-500", className)} />;
        case 'css':
        case 'scss':
        case 'sass':
        case 'less':
            return <Palette className={cn("text-blue-400", className)} />;

        // Data & Config
        case 'sql':
            return <Database className={cn("text-pink-500", className)} />;
        case 'json':
            return <Braces className={cn("text-yellow-500", className)} />;
        case 'xml':
        case 'svg':
            return <CodeXml className={cn("text-orange-400", className)} />;
        case 'yaml':
        case 'yml':
            return <Hash className={cn("text-purple-500", className)} />;
        case 'toml':
            return <Hash className={cn("text-slate-400", className)} />;
        case 'env':
            return <Hash className={cn("text-yellow-600", className)} />;

        // Documents
        case 'md':
        case 'mdx':
            return <FileText className={cn("text-blue-300", className)} />;
        case 'txt':
            return <FileText className={cn("text-slate-400", className)} />;
        case 'pdf':
            return <FileText className={cn("text-red-500", className)} />;

        // Media
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
        case 'avif':
            return <ImageIcon className={cn("text-purple-500", className)} />;
        case 'mp3':
        case 'wav':
        case 'ogg':
            return <Music className={cn("text-pink-400", className)} />;
        case 'mp4':
        case 'webm':
            return <Video className={cn("text-indigo-400", className)} />;

        // Archives
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return <Archive className={cn("text-amber-600", className)} />;

        default:
            return <FileText className={className} />;
    }
};
