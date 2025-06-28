"use client";

import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>
      </SidebarInset>
        
        <main className="flex-1 p-6 pt-20 md:pt-0 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Welcome to Data Alchemist</h2>
              <p className="text-muted-foreground mt-2">
                Transform your raw data into meaningful insights with our powerful visualization tools.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full">
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Upload Your Data</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started by uploading your CSV or Excel files to begin analysis.
                  </p>
                  {/* File upload component will go here */}
                </div>
              </div>
            </div>
          </div>
        </main>
    </>
  );
}
