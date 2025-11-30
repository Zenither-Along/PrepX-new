import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog";
import { PathGenerationProvider } from "@/context/PathGenerationContext";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PrepX - Transform How You Learn & Teach",
    template: "%s | PrepX"
  },
  description: "Create structured learning paths with branching topics, AI-powered content generation, and collaborative classrooms. The modern way to organize and share knowledge.",
  keywords: ["learning", "education", "AI", "study", "teaching", "learning paths", "classrooms", "online education", "structured learning"],
  authors: [{ name: "PrepX Team" }],
  creator: "PrepX",
  publisher: "PrepX",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://prepx.com'), // Update with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://prepx.com',
    title: 'PrepX - Transform How You Learn & Teach',
    description: 'Create structured learning paths with branching topics, AI-powered content generation, and collaborative classrooms.',
    siteName: 'PrepX',
    images: [
      {
        url: '/og-image.png', // You'll need to create this
        width: 1200,
        height: 630,
        alt: 'PrepX - Structured Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PrepX - Transform How You Learn & Teach',
    description: 'Create structured learning paths with branching topics, AI-powered content generation, and collaborative classrooms.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${instrumentSans.variable} antialiased font-sans`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PathGenerationProvider>
              {children}
              <RoleSelectionDialog />
            </PathGenerationProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
