"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { DataGrid } from '@/components/ui/data-grid';
import { DataCharts, QuickStats } from '@/components/charts/data-charts';
import { RuleEngine } from '@/components/rules/rule-engine';
import { AIQueryInterface } from '@/components/ai/ai-query-interface';
import { useDataStore } from '@/store/data-store';
import { clientColumns, workerColumns, taskColumns } from '@/lib/table-columns';
import { DataAnalyzer, DataExport } from '@/lib/data-analysis';
import { BarChart3, Table, Upload, Settings, Bot } from 'lucide-react';

export function DataWorkspace() {
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
    <div className="w-full space-y-6">
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Clients ({clients.length})
          </TabsTrigger>
          <TabsTrigger value="workers" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Workers ({workers.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Client Data
                  </CardTitle>
                  <CardDescription>
                    Upload your CSV or Excel file containing client information
                  </CardDescription>
                </div>
                <DataExport 
                  data={clients} 
                  filename="clients-export" 
                  title="Clients" 
                />
              </div>
            </CardHeader>
            <CardContent>
              <FileUpload dataType="clients" />
            </CardContent>
          </Card>

          {clients.length > 0 && (
            <>
              {/* Quick Stats */}
              <QuickStats 
                totalRecords={clientAnalysis.totalRecords}
                validRecords={clientAnalysis.validRecords}
                invalidRecords={clientAnalysis.invalidRecords}
                validationRate={clientAnalysis.validationRate}
              />

              {/* Data Views */}
              <Tabs defaultValue="table" className="w-full">
                <TabsList>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
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
          )}
        </TabsContent>

        {/* Workers Tab */}
        <TabsContent value="workers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Worker Data
                  </CardTitle>
                  <CardDescription>
                    Upload your CSV or Excel file containing worker information
                  </CardDescription>
                </div>
                <DataExport 
                  data={workers} 
                  filename="workers-export" 
                  title="Workers" 
                />
              </div>
            </CardHeader>
            <CardContent>
              <FileUpload dataType="workers" />
            </CardContent>
          </Card>

          {workers.length > 0 && (
            <>
              <QuickStats 
                totalRecords={workerAnalysis.totalRecords}
                validRecords={workerAnalysis.validRecords}
                invalidRecords={workerAnalysis.invalidRecords}
                validationRate={workerAnalysis.validationRate}
              />

              <Tabs defaultValue="table" className="w-full">
                <TabsList>
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="charts">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="table">
                  <Card>
                    <CardContent className="pt-6">
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
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Task Data
                  </CardTitle>
                  <CardDescription>
                    Upload your CSV or Excel file containing task information
                  </CardDescription>
                </div>
                <DataExport 
                  data={tasks} 
                  filename="tasks-export" 
                  title="Tasks" 
                />
              </div>
            </CardHeader>
            <CardContent>
              <FileUpload dataType="tasks" />
            </CardContent>
          </Card>

          {tasks.length > 0 && (
            <>
              <QuickStats 
                totalRecords={taskAnalysis.totalRecords}
                validRecords={taskAnalysis.validRecords}
                invalidRecords={taskAnalysis.invalidRecords}
                validationRate={taskAnalysis.validationRate}
              />

              <Tabs defaultValue="table" className="w-full">
                <TabsList>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
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
          )}
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <RuleEngine />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="space-y-6">
          <AIQueryInterface />
        </TabsContent>
      </Tabs>
    </div>
  );
}