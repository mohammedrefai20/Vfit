import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import ChatWidget from "@/components/ChatWidget";
import { ThemeProvider } from "@/lib/theme-context";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "V Fit",
  description: "AI-powered fitness planning and coaching",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${inter.variable}`}>
        <ThemeProvider>
        <AuthProvider>
          {children}
          <ChatWidget />
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}