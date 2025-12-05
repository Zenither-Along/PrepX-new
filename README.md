<p align="center">
  <img src="public/logo-light.png" alt="PrepX Logo" width="200" />
</p>

<h1 align="center">PrepX</h1>

<p align="center">
  <strong>Transform your learning experience with AI-powered personalized paths</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## ✨ Features

### 🎯 Core Learning Features

- **📚 Learning Paths** - Create structured, hierarchical learning paths with branches and items
- **🤖 AI Path Generator** - Generate complete learning paths from text, PDFs, or topics using Google Gemini
- **✏️ AI Content Editor** - Get AI assistance to generate content sections, branches, and items
- **💬 AI Chat Assistant** - Ask questions about your learning content with context-aware responses
- **📝 Rich Text Editor** - Create beautiful content with headings, lists, code blocks, and more
- **🧠 Smart Quizzes** - Generate AI-powered quizzes from your learning content

### 👥 Collaboration & Classrooms

- **🏫 Classrooms** - Create virtual classrooms for educators to manage students
- **📋 Assignments** - Assign learning paths to students with due dates and progress tracking
- **📊 Progress Analytics** - Track student completion and engagement

### 👤 User Experience

- **🔐 Authentication** - Secure sign-in with Clerk (Google, GitHub, Email)
- **🌓 Dark/Light Mode** - Full theme support for comfortable learning
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **🌍 Explore Page** - Discover public learning paths from the community
- **🔥 Streak Tracking** - Maintain learning consistency with daily streaks

### 💎 Free Tier

| Feature          | Limit    |
| ---------------- | -------- |
| AI Chat Messages | 50/day   |
| Quiz Generations | 10/month |
| Path Generations | 3/month  |
| AI Content Edits | 20/month |

---

## 🛠️ Tech Stack

| Category           | Technology                                                                  |
| ------------------ | --------------------------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) (App Router)                              |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                               |
| **Styling**        | [Tailwind CSS 4](https://tailwindcss.com/)                                  |
| **UI Components**  | [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Authentication** | [Clerk](https://clerk.com/)                                                 |
| **Database**       | [Supabase](https://supabase.com/) (PostgreSQL)                              |
| **AI**             | [Google Gemini](https://ai.google.dev/)                                     |
| **Rich Text**      | [Tiptap](https://tiptap.dev/)                                               |
| **Drag & Drop**    | [dnd-kit](https://dndkit.com/)                                              |
| **Charts**         | [Recharts](https://recharts.org/)                                           |
| **Animations**     | [Framer Motion](https://www.framer.com/motion/)                             |
| **State**          | [Zustand](https://zustand.docs.pmnd.rs/)                                    |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account
- Clerk account
- Google AI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Zenither-Along/PrepX-new.git
   cd PrepX-new
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required values (see [Environment Variables](#environment-variables))

4. **Run database migrations**

   - Go to your Supabase Dashboard → SQL Editor
   - Run the migration files from `supabase/migrations/` in order

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# Clerk URLs (optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

---

## 📁 Project Structure

```
PrepX/
├── public/                 # Static assets (logos, images)
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── (auth)/        # Auth pages (sign-in, sign-up)
│   │   ├── dashboard/     # Main dashboard
│   │   ├── editor/        # Path editor
│   │   ├── view/          # Path viewer
│   │   ├── classrooms/    # Classroom management
│   │   ├── profile/       # User profile
│   │   ├── pricing/       # Pricing page
│   │   └── ...
│   ├── components/        # React components
│   │   ├── ui/            # Base UI components (shadcn)
│   │   ├── editor/        # Editor-specific components
│   │   ├── landing/       # Landing page components
│   │   ├── profile/       # Profile components
│   │   └── ...
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
├── supabase/
│   └── migrations/        # Database migrations
└── ...
```

---

## 📄 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is proprietary software. All rights reserved.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Clerk](https://clerk.com/) - Authentication made simple
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Google Gemini](https://ai.google.dev/) - Powerful AI capabilities

---

<p align="center">
  Made with ❤️ by the PrepX Team
</p>
