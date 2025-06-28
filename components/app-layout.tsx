"use client";

import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { FloatingAIAssistant } from "@/components/ai/floating-ai-assistant";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 lg:h-0 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
        </header>
        <main className="flex-1 p-6 pt-14 overflow-auto">
          {children}
        </main>
      </SidebarInset>
      <FloatingAIAssistant />
    </>
  );
}
