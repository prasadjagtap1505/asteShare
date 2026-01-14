'use client';

import React from 'react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { Compass, LayoutDashboard, Code2, ArrowRight } from 'lucide-react';
import { userAtom } from '@/store';

export default function HomePage() {
  const [user] = useAtom(userAtom);

  return (
    <main className="mx-auto space-y-12 px-2 py-12 md:max-w-3xl">
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

      {/* Features Panel */}
      <section className="panel">
        <div className="panel-header border-b border-[var(--edge)]">
          <h2 className="text-lg font-semibold">How it works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <div className="p-4 border-b sm:border-b-0 sm:border-r border-[var(--edge)]">
            <div className="text-2xl font-bold text-muted-foreground/50 mb-2">1</div>
            <h3 className="font-medium mb-1">Create</h3>
            <p className="text-sm text-muted-foreground">Make folders like "C++" and files like "hello.cpp"</p>
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
    </main>
  );
}
