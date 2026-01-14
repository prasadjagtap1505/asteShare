import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { FollowerPointerCard } from '@/components/ui/following-pointer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PasteShare - Share Code & Text Instantly',
  description: 'Create, organize, and share code snippets, text, and entire folder structures with zero friction. Perfect for students and developers.',
  keywords: ['paste', 'code sharing', 'snippets', 'text sharing', 'developer tools'],
  authors: [{ name: 'PasteShare' }],
  icons: {
    icon: '/FAVICON.png',
  },
  openGraph: {
    title: 'PasteShare - Share Code & Text Instantly',
    description: 'Create, organize, and share code snippets, text, and entire folder structures with zero friction.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <FollowerPointerCard title="Anonymous" className="min-h-screen">
          <Providers>
            <main className="min-h-screen">{children}</main>
          </Providers>
        </FollowerPointerCard>
      </body>
    </html>
  );
}
