'use client';

import React from 'react';
import { Mail, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmailVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: 'success' | 'error';
    email?: string;
    onResendEmail?: () => void;
    isResending?: boolean;
}

export function EmailVerificationModal({
    isOpen,
    onClose,
    variant,
    email,
    onResendEmail,
    isResending = false,
}: EmailVerificationModalProps) {
    if (!isOpen) return null;

    const isSuccess = variant === 'success';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred backdrop */}
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal content */}
            <div
                className={cn(
                    "relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl",
                    "bg-background/95 border border-[var(--edge)]",
                    "shadow-2xl shadow-black/10 dark:shadow-black/30",
                    "animate-in fade-in-0 zoom-in-95 duration-300"
                )}
            >
                {/* Icon */}
                <div className={cn(
                    "mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6",
                    "transition-all duration-500",
                    isSuccess
                        ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30"
                        : "bg-gradient-to-br from-destructive/20 to-destructive/10 border border-destructive/30"
                )}>
                    {isSuccess ? (
                        <Mail className="w-10 h-10 text-emerald-500 animate-pulse" />
                    ) : (
                        <AlertCircle className="w-10 h-10 text-destructive animate-pulse" />
                    )}
                </div>

                {/* Title */}
                <h2 className={cn(
                    "text-2xl font-bold text-center mb-3",
                    isSuccess ? "text-foreground" : "text-destructive"
                )}>
                    {isSuccess ? 'Check Your Email' : 'Email Not Verified'}
                </h2>

                {/* Description */}
                <p className="text-center text-muted-foreground mb-6 leading-relaxed">
                    {isSuccess ? (
                        <>
                            We&apos;ve sent a verification link to
                            {email && (
                                <span className="block mt-1 font-semibold text-foreground">
                                    {email}
                                </span>
                            )}
                            <span className="block mt-2">
                                Please check your inbox and click the verification link to activate your account.
                            </span>
                        </>
                    ) : (
                        <>
                            Your email address hasn&apos;t been verified yet.
                            {email && (
                                <span className="block mt-1 font-semibold text-foreground">
                                    {email}
                                </span>
                            )}
                            <span className="block mt-2">
                                Please check your Gmail inbox and click the <strong>&quot;Verify Email&quot;</strong> button to continue.
                            </span>
                        </>
                    )}
                </p>

                {/* Visual indicator */}
                <div className={cn(
                    "flex items-center justify-center gap-3 py-4 px-5 rounded-xl mb-6",
                    "bg-gradient-to-r",
                    isSuccess
                        ? "from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20"
                        : "from-destructive/10 via-destructive/5 to-transparent border border-destructive/20"
                )}>
                    <div className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        isSuccess ? "bg-emerald-500" : "bg-destructive"
                    )} />
                    <span className="text-sm text-muted-foreground">
                        {isSuccess
                            ? "Waiting for email verification..."
                            : "Verification required to continue"
                        }
                    </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {onResendEmail && (
                        <Button
                            variant="outline"
                            onClick={onResendEmail}
                            disabled={isResending}
                            className="w-full group"
                        >
                            <RefreshCw className={cn(
                                "w-4 h-4 mr-2 transition-transform",
                                isResending && "animate-spin"
                            )} />
                            {isResending ? 'Sending...' : 'Resend Verification Email'}
                        </Button>
                    )}
                    <Button
                        onClick={onClose}
                        className="w-full"
                    >
                        {isSuccess ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Got it, I&apos;ll check my email
                            </>
                        ) : (
                            'Close'
                        )}
                    </Button>
                </div>

                {/* Help text */}
                <p className="mt-4 text-xs text-center text-muted-foreground">
                    Didn&apos;t receive the email? Check your spam folder or{' '}
                    <button
                        onClick={onResendEmail}
                        className="underline hover:text-foreground transition-colors"
                    >
                        request a new one
                    </button>
                </p>
            </div>
        </div>
    );
}
