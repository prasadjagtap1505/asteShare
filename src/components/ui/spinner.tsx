import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'default' | 'lg';
}

const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6',
};

export function Spinner({ size = 'default', className, ...props }: SpinnerProps) {
    return (
        <div
            role="status"
            className={cn("flex items-center justify-center", className)}
            {...props}
        >
            <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export function FullPageSpinner() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );
}
