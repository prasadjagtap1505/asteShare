'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import { Code2, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp, resendVerificationEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmailVerificationModal } from '@/components/ui/email-verification-modal';
import { toast } from 'sonner';
import Link from 'next/link';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Email verification modal state
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [modalVariant, setModalVariant] = useState<'success' | 'error'>('success');
    const [verificationEmail, setVerificationEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const signupForm = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: '', password: '', confirmPassword: '' },
    });

    const handleResendEmail = async () => {
        if (!verificationEmail) return;

        setIsResending(true);
        try {
            await resendVerificationEmail(verificationEmail);
            toast.success('Verification email sent! Check your inbox.');
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to resend email');
        } finally {
            setIsResending(false);
        }
    };

    const handleLogin = async (data: LoginFormData) => {
        setIsSubmitting(true);
        try {
            await signIn(data.email, data.password);
            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (error: unknown) {
            // Check if the error is about email not being verified
            const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
            if (errorMessage.includes('email not confirmed') ||
                errorMessage.includes('email not verified') ||
                errorMessage.includes('confirm your email')) {
                // Show verification error modal
                setVerificationEmail(data.email);
                setModalVariant('error');
                setShowVerificationModal(true);
            } else {
                toast.error(error instanceof Error ? error.message : 'Failed to sign in');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignup = async (data: SignupFormData) => {
        setIsSubmitting(true);
        try {
            await signUp(data.email, data.password);
            // Show success modal instead of redirecting
            setVerificationEmail(data.email);
            setModalVariant('success');
            setShowVerificationModal(true);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Failed to create account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setShowVerificationModal(false);
        if (modalVariant === 'success') {
            // Switch to login mode after successful signup
            setIsLogin(true);
            signupForm.reset();
        }
    };

    const switchMode = () => {
        setIsLogin(!isLogin);
        loginForm.reset();
        signupForm.reset();
    };

    return (
        <main className="mx-auto space-y-12 px-2 py-12 md:max-w-md">
            <section className="panel">
                <div className="panel-header border-b border-[var(--edge)] text-center">
                    <Link href="/" className="inline-flex items-center gap-2 mb-2">
                        <Code2 className="h-5 w-5" />
                        <span className="font-semibold">PasteShare</span>
                    </Link>
                    <h1 className="text-xl font-semibold">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isLogin
                            ? 'Sign in to access your projects'
                            : 'Sign up to start sharing code'}
                    </p>
                </div>

                <div className="panel-content">
                    {isLogin ? (
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="login-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-9"
                                        {...loginForm.register('email')}
                                    />
                                </div>
                                {loginForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {loginForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="login-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pl-9 pr-9"
                                        {...loginForm.register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {loginForm.formState.errors.password && (
                                    <p className="text-sm text-destructive">
                                        {loginForm.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signup-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="signup-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-9"
                                        {...signupForm.register('email')}
                                    />
                                </div>
                                {signupForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {signupForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="signup-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pl-9 pr-9"
                                        {...signupForm.register('password')}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {signupForm.formState.errors.password && (
                                    <p className="text-sm text-destructive">
                                        {signupForm.formState.errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signup-confirm">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="signup-confirm"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pl-9"
                                        {...signupForm.register('confirmPassword')}
                                    />
                                </div>
                                {signupForm.formState.errors.confirmPassword && (
                                    <p className="text-sm text-destructive">
                                        {signupForm.formState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                        </form>
                    )}

                    <div className="mt-4 pt-4 border-t border-[var(--edge)] text-center">
                        <p className="text-sm text-muted-foreground">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                type="button"
                                onClick={switchMode}
                                className="ml-1 font-medium hover:underline"
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>
            </section>

            {/* Email Verification Modal */}
            <EmailVerificationModal
                isOpen={showVerificationModal}
                onClose={handleModalClose}
                variant={modalVariant}
                email={verificationEmail}
                onResendEmail={handleResendEmail}
                isResending={isResending}
            />
        </main>
    );
}
