import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { FloatingAIAssistant } from "@/components/ai/floating-ai-assistant";
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Data Alchemist",
  description: "Transform your data with powerful visualization tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="candyland" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
        <SidebarProvider>
          <div className="flex h-screen w-full bg-background">
            {children}
          </div>
          <FloatingAIAssistant />
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
      </body>
    </html>
  );
}
