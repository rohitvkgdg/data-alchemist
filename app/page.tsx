"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { useDataStore } from "@/store/data-store";

export default function Home() {
  const { clients, workers, tasks, clientValidationResults } = useDataStore();
  return (
    <>
      <AppSidebar />
      <SidebarInset className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b md:hidden">
          <SidebarTrigger className="-ml-1" />
        </header>

        <main className="flex-1 p-6 pt-20 justify-center self-center min-w-full overflow-auto">
          <div className="w-full max-w-3xl mx-auto">
            <div className="mb-8" >
              <h2 className="text-5xl font-bold tracking-tight text-center">Welcome to Data Alchemist</h2>
              <p className="text-muted-foreground mt-2 text-center">
                Transform your raw data into meaningful insights with our powerful visualization tools.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="col-span-full">
                <div className="rounded-lg border bg-card p-2">
                  <FileUpload dataType="clients" />
                </div>
              </div>
              {/* Display Workers Data for Debugging */}
              {clients.length > 0 && (
                <div className="col-span-full">
                  <div className="rounded-lg border bg-card p-2">
                    <h3 className="text-lg font-semibold mb-4">Clients Data</h3>
                    <pre className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-lg">
                      <code className="text-sm text-neutral-700 dark:text-neutral-300">
                        {JSON.stringify(clients, null, 2)}
                      </code>
                    </pre>
                    {clientValidationResults && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Valid: {clientValidationResults.summary.validRows} |
                          Errors: {clientValidationResults.summary.invalidRows} |
                          Total: {clientValidationResults.summary.totalRows}
                        </p>
                        {clientValidationResults.errors.length > 0 && (
                          <details className="mt-2">
                            <summary className="text-sm font-medium cursor-pointer">
                              View Errors ({clientValidationResults.errors.length})
                            </summary>
                            <pre className="text-xs p-2 rounded mt-2 max-h-32 overflow-auto">
                              <code className="text-sm text-neutral-700 dark:text-neutral-300">
                                {JSON.stringify(clientValidationResults.errors.slice(0, 5), null, 2)}
                              </code>
                            </pre>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
