"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Activity
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

interface AnalyticsDashboardProps {
  clients: Array<{status: string; [key: string]: unknown}>;
  workers: Array<{status: string; [key: string]: unknown}>;
  tasks: Array<{status: string; [key: string]: unknown}>;
  validationResults: {
    clients: {errors?: Array<unknown>} | null;
    workers: {errors?: Array<unknown>} | null;
    tasks: {errors?: Array<unknown>} | null;
  };
}

export function AnalyticsDashboard({ 
  clients, 
  workers, 
  tasks, 
  validationResults 
}: AnalyticsDashboardProps) {
  
  // Calculate overview metrics
  const overviewMetrics = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalWorkers: workers.length,
    availableWorkers: workers.filter(w => w.status === 'active').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    totalErrors: (validationResults.clients?.errors?.length || 0) + 
                 (validationResults.workers?.errors?.length || 0) + 
                 (validationResults.tasks?.errors?.length || 0),
  };

  // Status distribution data
  const clientStatusData = clients.reduce((acc: Record<string, number>, client) => {
    acc[client.status] = (acc[client.status] || 0) + 1;
    return acc;
  }, {});

  const workerStatusData = workers.reduce((acc: Record<string, number>, worker) => {
    acc[worker.status] = (acc[worker.status] || 0) + 1;
    return acc;
  }, {});

  const taskStatusData = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const clientChartData = Object.entries(clientStatusData).map(([status, count]) => ({
    name: status,
    value: count as number,
    percentage: Math.round(((count as number) / clients.length) * 100)
  }));

  const workerChartData = Object.entries(workerStatusData).map(([status, count]) => ({
    name: status,
    value: count as number,
    percentage: Math.round(((count as number) / workers.length) * 100)
  }));

  const taskChartData = Object.entries(taskStatusData).map(([status, count]) => ({
    name: status,
    value: count as number,
    percentage: Math.round(((count as number) / tasks.length) * 100)
  }));

  // Data quality metrics
  const dataQualityMetrics = [
    {
      name: 'Clients',
      total: clients.length,
      valid: clients.length - (validationResults.clients?.errors ? 
        new Set(validationResults.clients.errors.map((error: any) => error.row)).size : 0),
      errors: validationResults.clients?.errors?.length || 0,
      quality: clients.length > 0 ? Math.round(((clients.length - (validationResults.clients?.errors ? 
        new Set(validationResults.clients.errors.map((error: any) => error.row)).size : 0)) / clients.length) * 100) : 100
    },
    {
      name: 'Workers',
      total: workers.length,
      valid: workers.length - (validationResults.workers?.errors ? 
        new Set(validationResults.workers.errors.map((error: any) => error.row)).size : 0),
      errors: validationResults.workers?.errors?.length || 0,
      quality: workers.length > 0 ? Math.round(((workers.length - (validationResults.workers?.errors ? 
        new Set(validationResults.workers.errors.map((error: any) => error.row)).size : 0)) / workers.length) * 100) : 100
    },
    {
      name: 'Tasks',
      total: tasks.length,
      valid: tasks.length - (validationResults.tasks?.errors ? 
        new Set(validationResults.tasks.errors.map((error: any) => error.row)).size : 0),
      errors: validationResults.tasks?.errors?.length || 0,
      quality: tasks.length > 0 ? Math.round(((tasks.length - (validationResults.tasks?.errors ? 
        new Set(validationResults.tasks.errors.map((error: any) => error.row)).size : 0)) / tasks.length) * 100) : 100
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewMetrics.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {overviewMetrics.activeClients} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewMetrics.totalWorkers}</div>
            <p className="text-xs text-muted-foreground">
              {overviewMetrics.availableWorkers} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewMetrics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {overviewMetrics.completedTasks} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overviewMetrics.totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              Across all datasets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Client Status Chart */}
            {clients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Client Status</CardTitle>
                  <CardDescription>Distribution of client statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clientChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name} (${percentage}%)`}
                        >
                          {clientChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-4">
                    {clientChartData.map((item) => (
                      <Badge key={item.name} variant="outline" className="text-xs">
                        {item.name}: {String(item.value)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Worker Status Chart */}
            {workers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Worker Status</CardTitle>
                  <CardDescription>Distribution of worker statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={workerChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name} (${percentage}%)`}
                        >
                          {workerChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-4">
                    {workerChartData.map((item) => (
                      <Badge key={item.name} variant="outline" className="text-xs">
                        {item.name}: {String(item.value)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Task Status Chart */}
            {tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Task Status</CardTitle>
                  <CardDescription>Distribution of task statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percentage }) => `${name} (${percentage}%)`}
                        >
                          {taskChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-4">
                    {taskChartData.map((item) => (
                      <Badge key={item.name} variant="outline" className="text-xs">
                        {item.name}: {String(item.value)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          {/* Data Quality Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Data Quality Overview</CardTitle>
              <CardDescription>Quality metrics for all datasets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataQualityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'quality' ? `${value}%` : value,
                        name === 'quality' ? 'Quality Score' : 
                        name === 'valid' ? 'Valid Records' :
                        name === 'errors' ? 'Error Count' : 'Total Records'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Total Records" />
                    <Bar dataKey="valid" fill="#82ca9d" name="Valid Records" />
                    <Bar dataKey="errors" fill="#ff6b6b" name="Errors" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quality Score Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            {dataQualityMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name} Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={
                      metric.quality >= 90 ? 'text-green-600' :
                      metric.quality >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }>
                      {metric.quality}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metric.valid}/{metric.total} records valid
                  </p>
                  {metric.errors > 0 && (
                    <Badge variant="destructive" className="mt-2 text-xs">
                      {metric.errors} errors
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Upload Trends</CardTitle>
              <CardDescription>Trends and patterns in your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Trends analysis will be available once you have more data points.</p>
                <p className="text-sm mt-2">Upload more files to see trends over time.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}