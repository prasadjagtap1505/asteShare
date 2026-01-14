# PasteShare 🚀

A production-ready web application where users can paste text, code, files, or entire folder structures, save them, and share them easily without retyping links.

## ✨ Features

- **File & Folder Workspace**: Create nested folders and files with a VS Code-like file tree
- **Paste Any Content**: Support for text, code, configurations, and any content
- **One-Click Sharing**: Generate shareable links instantly
- **Public Gallery**: Discover publicly shared projects in the Explore page
- **User Dashboard**: Manage all your projects with quick actions
- **Zero Friction**: Share and view projects without any barriers

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router & Turbopack
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** + **Radix UI** for components
- **Magic UI** for file tree component
- **Framer Motion** for animations
- **Jotai** for state management
- **SWR** for data fetching
- **React Hook Form** + **Zod** for forms

### Backend
- **Supabase** for PostgreSQL database
- **Supabase Auth** for email/password authentication
- **Row Level Security (RLS)** for data protection

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### 1. Clone and Install

```bash
cd paste
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Get your project URL and anon key from **Settings > API**

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/auth/      # Authentication page
│   ├── dashboard/        # User dashboard
│   ├── explore/          # Public projects gallery
│   ├── share/[id]/       # Shared project viewer
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
│
├── components/
│   ├── editor/           # Content editor
│   ├── file-tree/        # File tree component
│   ├── modals/           # Modal dialogs
│   └── ui/               # shadcn/ui components
│
├── lib/
│   ├── supabase/         # Supabase clients
│   ├── auth.ts           # Auth helpers
│   ├── db.ts             # Database operations
│   └── utils.ts          # Utility functions
│
├── store/                # Jotai atoms
└── types/                # TypeScript types
```

## 🗄️ Database Schema

### Tables

- **projects**: User projects with title, visibility, and share settings
- **file_nodes**: Files and folders with hierarchical structure

### Row Level Security

- Users can only CRUD their own projects
- Public projects are readable by everyone
- Projects with share_id are accessible via link

## 🔐 Authentication

- Email + Password authentication via Supabase Auth
- Minimum 8 character passwords
- Persistent sessions with auto-refresh
- Protected routes: `/dashboard`
- Public routes: `/`, `/explore`, `/share/[id]`

## 🎨 Key Features

### Command Palette (⌘K)
Quick navigation and actions with keyboard shortcuts.

### File Tree
VS Code-like file tree with:
- Nested folders
- File/folder icons
- Expand/collapse folders
- Visual indicators

### Sharing Options
1. **Generate Share Link**: Creates a unique URL for read-only access
2. **Share with Everybody**: Makes the project public and visible in Explore

### Dark Mode
Dark mode by default with a premium, modern UI aesthetic.

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Built with ❤️ using Next.js, Supabase, and shadcn/ui
