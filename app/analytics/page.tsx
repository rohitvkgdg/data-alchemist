"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataStore } from '@/store/data-store';
import { DataAnalyzer } from '@/lib/data-analysis';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { DataCharts } from '@/components/charts/data-charts';
import { AppLayout } from '@/components/app-layout';
import { BarChart3, TrendingUp, Activity, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const { 
    clients, workers, tasks,
    clientValidationResults, workerValidationResults, taskValidationResults
  } = useDataStore();

  // Analyze data
  const clientAnalysis = DataAnalyzer.analyzeClients(clients, clientValidationResults || undefined);
  const workerAnalysis = DataAnalyzer.analyzeWorkers(workers, workerValidationResults || undefined);
  const taskAnalysis = DataAnalyzer.analyzeTasks(tasks, taskValidationResults || undefined);

  const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0;

  if (!hasData) {
    return (
      <AppLayout title="Advanced Analytics">
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
          <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-muted-foreground">No Data Available</h2>
            <p className="text-muted-foreground max-w-md">
              Upload your CSV or Excel files first to see comprehensive analytics and visualizations.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Advanced Analytics">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights and visualizations across all your data
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              {clients.length + workers.length + tasks.length} total records
            </div>
          </div>
        </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="correlations" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Correlations
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <AnalyticsDashboard 
            clients={clients}
            workers={workers}
            tasks={tasks}
            validationResults={{
              clients: clientValidationResults,
              workers: workerValidationResults,
              tasks: taskValidationResults
            }}
          />
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {clients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Trends
                  </CardTitle>
                  <CardDescription>
                    Status distribution and field completeness for clients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataCharts
                    statusData={DataAnalyzer.getChartData(clientAnalysis.statusDistribution)}
                    completenessData={Object.entries(clientAnalysis.fieldCompleteness).map(([field, completeness]) => ({
                      field,
                      completeness: completeness as number
                    }))}
                    title="Clients"
                  />
                </CardContent>
              </Card>
            )}
            
            {workers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Worker Trends
                  </CardTitle>
                  <CardDescription>
                    Performance metrics and availability trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataCharts
                    statusData={DataAnalyzer.getChartData(workerAnalysis.statusDistribution)}
                    completenessData={Object.entries(workerAnalysis.fieldCompleteness).map(([field, completeness]) => ({
                      field,
                      completeness: completeness as number
                    }))}
                    title="Workers"
                  />
                </CardContent>
              </Card>
            )}

            {tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Task Trends
                  </CardTitle>
                  <CardDescription>
                    Task completion and priority analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataCharts
                    statusData={DataAnalyzer.getChartData(taskAnalysis.statusDistribution)}
                    completenessData={Object.entries(taskAnalysis.fieldCompleteness).map(([field, completeness]) => ({
                      field,
                      completeness: completeness as number
                    }))}
                    title="Tasks"
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Advanced Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Time Series Analysis</CardTitle>
              <CardDescription>
                Data patterns and trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Time Series Analysis</p>
                <p>Upload data with timestamps to see trends over time</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlations Tab */}
        <TabsContent value="correlations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client-Worker Relationships</CardTitle>
                <CardDescription>
                  Discover patterns between clients and assigned workers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced correlation analysis coming soon...</p>
                  <p className="text-sm mt-2">
                    Upload related data to see cross-dataset insights
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Efficiency Patterns</CardTitle>
                <CardDescription>
                  Analyze task completion rates and worker performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Efficiency analysis available with more data</p>
                  <p className="text-sm mt-2">
                    Link tasks to workers for detailed insights
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workload Forecasting</CardTitle>
                <CardDescription>
                  Predict future workload and resource needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>AI-powered forecasting coming soon...</p>
                  <p className="text-sm mt-2">
                    Requires historical data for accurate predictions
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Optimization</CardTitle>
                <CardDescription>
                  Optimize worker allocation and task scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Optimization models in development...</p>
                  <p className="text-sm mt-2">
                    Advanced ML models for resource planning
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
