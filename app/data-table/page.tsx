"use client";

import React, { useState } from 'react';
import { AppLayout } from "@/components/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataCharts, QuickStats } from '@/components/charts/data-charts';
import { useDataStore } from '@/store/data-store';
import { clientColumns, workerColumns, taskColumns } from '@/lib/table-columns';
import { DataAnalyzer, DataExport } from '@/lib/data-analysis';
import { BarChart3, Table } from 'lucide-react';

export default function DataTablePage() {
  const { 
    clients, workers, tasks,
    updateClient, updateWorker, updateTask,
    clientValidationResults, workerValidationResults, taskValidationResults
  } = useDataStore();

  const [activeTab, setActiveTab] = useState('clients');

  // Analyze data
  const clientAnalysis = DataAnalyzer.analyzeClients(clients, clientValidationResults || undefined);
  const workerAnalysis = DataAnalyzer.analyzeWorkers(workers, workerValidationResults || undefined);
  const taskAnalysis = DataAnalyzer.analyzeTasks(tasks, taskValidationResults || undefined);

  // Handle updates
  const handleClientUpdate = (rowIndex: number, updates: Record<string, unknown>) => {
    const client = clients[rowIndex];
    if (client) updateClient(client.id, updates);
  };

  const handleWorkerUpdate = (rowIndex: number, updates: Record<string, unknown>) => {
    const worker = workers[rowIndex];
    if (worker) updateWorker(worker.id, updates);
  };

  const handleTaskUpdate = (rowIndex: number, updates: Record<string, unknown>) => {
    const task = tasks[rowIndex];
    if (task) updateTask(task.id, updates);
  };

  return (
    <AppLayout>
      <div className="w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Data Table & Analytics</h1>
          <p className="text-muted-foreground">
            View, edit, and analyze your uploaded data
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="clients" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Table className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Clients ({clients.length})</span>
              <span className="sm:hidden">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="workers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Table className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Workers ({workers.length})</span>
              <span className="sm:hidden">Workers</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Table className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Tasks ({tasks.length})</span>
              <span className="sm:hidden">Tasks</span>
            </TabsTrigger>
          </TabsList>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            {clients.length > 0 ? (
              <>
                {/* Export Button */}
                <div className="flex justify-end">
                  <DataExport 
                    data={clients} 
                    filename="clients-export" 
                    title="Clients" 
                  />
                </div>

                {/* Quick Stats */}
                <QuickStats 
                  totalRecords={clientAnalysis.totalRecords}
                  validRecords={clientAnalysis.validRecords}
                  invalidRecords={clientAnalysis.invalidRecords}
                  validationRate={clientAnalysis.validationRate}
                />

                {/* Data Views */}
                <Tabs defaultValue="table" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="table" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <Table className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Table View</span>
                      <span className="sm:hidden">Table</span>
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Analytics</span>
                      <span className="sm:hidden">Charts</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="table">
                    <Card>
                      <CardHeader>
                        <CardTitle>Client Data</CardTitle>
                        <CardDescription>
                          Review and edit your uploaded client data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DataGrid
                          data={clients}
                          columns={clientColumns}
                          onUpdate={handleClientUpdate}
                          validationErrors={clientValidationResults?.errors || []}
                          title="Clients"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="charts">
                    <DataCharts
                      statusData={DataAnalyzer.getChartData(clientAnalysis.statusDistribution)}
                      completenessData={Object.entries(clientAnalysis.fieldCompleteness).map(([field, completeness]) => ({
                        field,
                        completeness: completeness as number
                      }))}
                      title="Clients"
                    />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No client data uploaded yet.</p>
                    <p className="text-sm">Go to the Upload Data page to get started.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-6">
            {workers.length > 0 ? (
              <>
                <div className="flex justify-end">
                  <DataExport 
                    data={workers} 
                    filename="workers-export" 
                    title="Workers" 
                  />
                </div>

                <QuickStats 
                  totalRecords={workerAnalysis.totalRecords}
                  validRecords={workerAnalysis.validRecords}
                  invalidRecords={workerAnalysis.invalidRecords}
                  validationRate={workerAnalysis.validationRate}
                />

                <Tabs defaultValue="table" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="table" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <Table className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Table View</span>
                      <span className="sm:hidden">Table</span>
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Analytics</span>
                      <span className="sm:hidden">Charts</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="table">
                    <Card>
                      <CardHeader>
                        <CardTitle>Worker Data</CardTitle>
                        <CardDescription>
                          Review and edit your uploaded worker data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DataGrid
                          data={workers}
                          columns={workerColumns}
                          onUpdate={handleWorkerUpdate}
                          validationErrors={workerValidationResults?.errors || []}
                          title="Workers"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="charts">
                    <DataCharts
                      statusData={DataAnalyzer.getChartData(workerAnalysis.statusDistribution)}
                      completenessData={Object.entries(workerAnalysis.fieldCompleteness).map(([field, completeness]) => ({
                        field,
                        completeness: completeness as number
                      }))}
                      title="Workers"
                    />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No worker data uploaded yet.</p>
                    <p className="text-sm">Go to the Upload Data page to get started.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {tasks.length > 0 ? (
              <>
                <div className="flex justify-end">
                  <DataExport 
                    data={tasks} 
                    filename="tasks-export" 
                    title="Tasks" 
                  />
                </div>

                <QuickStats 
                  totalRecords={taskAnalysis.totalRecords}
                  validRecords={taskAnalysis.validRecords}
                  invalidRecords={taskAnalysis.invalidRecords}
                  validationRate={taskAnalysis.validationRate}
                />

                <Tabs defaultValue="table" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="table" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <Table className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Table View</span>
                      <span className="sm:hidden">Table</span>
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Analytics</span>
                      <span className="sm:hidden">Charts</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="table">
                    <Card>
                      <CardHeader>
                        <CardTitle>Task Data</CardTitle>
                        <CardDescription>
                          Review and edit your uploaded task data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DataGrid
                          data={tasks}
                          columns={taskColumns}
                          onUpdate={handleTaskUpdate}
                          validationErrors={taskValidationResults?.errors || []}
                          title="Tasks"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="charts">
                    <DataCharts
                      statusData={DataAnalyzer.getChartData(taskAnalysis.statusDistribution)}
                      completenessData={Object.entries(taskAnalysis.fieldCompleteness).map(([field, completeness]) => ({
                        field,
                        completeness: completeness as number
                      }))}
                      title="Tasks"
                    />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No task data uploaded yet.</p>
                    <p className="text-sm">Go to the Upload Data page to get started.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
