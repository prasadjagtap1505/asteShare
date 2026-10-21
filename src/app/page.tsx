'use client';

import React from 'react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { Compass, LayoutDashboard, Code2, ArrowRight } from 'lucide-react';
import { userAtom } from '@/store';
import { ScrollVelocityContainer, ScrollVelocityRow, AnimatedBlurTestimonials, LinkPreview } from '@/components/ui';

const TESTIMONIALS = [
  {
    message: "PasteShare is the fastest way I've found to share code snippets with my team. The folder structure support is a game changer.",
    avatar: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", fallback: "FX" }
  },
  {
    message: "Clean UI, zero friction. It's exactly what I needed for my coding tutorials.",
    avatar: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka", fallback: "AK" }
  },
  {
    message: "The instant link generation and grid-based design make it feel incredibly premium.",
    avatar: { src: "https://api.dicebear.com/7.x/avataaars/svg?seed=Julian", fallback: "JN" }
  }
];

export default function HomePage() {
  const [user] = useAtom(userAtom);

  return (
    <main className="mx-auto px-2 py-12 md:max-w-3xl">
      {/* Hero Panel */}
      <section className="panel">
        <div className="panel-header border-b border-[var(--edge)]">
          <div className="flex items-center gap-3">
            <Code2 className="h-6 w-6" />
            <span className="panel-title">PasteShare</span>
          </div>
        </div>
        <div className="panel-content space-y-4">
          <p className="text-muted-foreground">
            Create files and folders, paste your code, and share instantly.
          </p>

          {/* Navigation Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link href="/explore" className="block">
              <div className="group rounded-lg border border-[var(--edge)] p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Compass className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Explore</h3>
                      <p className="text-sm text-muted-foreground">Browse public files</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link href={user ? "/dashboard" : "/auth"} className="block">
              <div className="group rounded-lg border border-[var(--edge)] p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{user ? "Dashboard" : "Get Started"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user ? "Manage your files" : "Sign in to create files"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <div className="h-12 border-x border-[var(--edge)] bg-muted/5 sm:h-14" />

      {/* Velocity Scroll Effect */}
      <section className="panel py-20 overflow-hidden bg-muted/5">
        <ScrollVelocityContainer>
          <ScrollVelocityRow
            baseVelocity={2}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter opacity-15"
          >
            Paste Share •&nbsp;
          </ScrollVelocityRow>
          <ScrollVelocityRow
            baseVelocity={-2}
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter opacity-15"
          >
            Paste Share •&nbsp;
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      </section>

      <div className="h-12 border-x border-[var(--edge)] bg-muted/5 sm:h-14" />

      {/* Features Panel */}
      <section className="panel">
        <div className="panel-header border-b border-[var(--edge)]">
          <h2 className="text-lg font-semibold">How it works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <div className="p-4 border-b sm:border-b-0 sm:border-r border-[var(--edge)]">
            <div className="text-2xl font-bold text-muted-foreground/50 mb-2">1</div>
            <h3 className="font-medium mb-1">Create</h3>
            <p className="text-sm text-muted-foreground">Make folders like &quot;C++&quot; and files like &quot;hello.cpp&quot;</p>
          </div>
          <div className="p-4 border-b sm:border-b-0 sm:border-r border-[var(--edge)]">
            <div className="text-2xl font-bold text-muted-foreground/50 mb-2">2</div>
            <h3 className="font-medium mb-1">Paste</h3>
            <p className="text-sm text-muted-foreground">Click a file and type or paste your code</p>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-muted-foreground/50 mb-2">3</div>
            <h3 className="font-medium mb-1">Share</h3>
            <p className="text-sm text-muted-foreground">Generate a link and share with anyone</p>
          </div>
        </div>
      </section>

      {/* Extended Decorative Grids */}
      <div className="grid grid-cols-1">
        <div className="panel !border-t-0 min-h-64 flex flex-col items-center justify-center p-12 bg-muted/5">
          <div className="max-w-md w-full">
            <AnimatedBlurTestimonials data={TESTIMONIALS} />
          </div>
        </div>
      </div>

      <div className="panel !border-t-0 h-32 bg-muted/5" />
      <div className="panel !border-t-0 h-16 border-b flex items-center justify-center">
        <div className="text-sm text-muted-foreground font-medium tracking-tight">
          Developed By{" "}
          <LinkPreview
            url="https://geetmore.live"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-foreground underline decoration-[var(--edge)] underline-offset-4 hover:decoration-foreground transition-colors"
          >
            Prasad Jagtap
          </LinkPreview>
        </div>
      </div>
    </main>
  );
}
