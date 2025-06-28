"use client";

import React from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartData } from '@/lib/data-analysis';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface DataChartsProps {
  statusData: ChartData[];
  completenessData: { field: string; completeness: number; }[];
  title: string;
}

export function DataCharts({ statusData, completenessData, title }: DataChartsProps) {
  return (
    <div className="space-y-6">
      {/* Status Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>
            Distribution of {title.toLowerCase()} by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Status Summary */}
          <div className="flex flex-wrap gap-2 mt-4">
            {statusData.map((item, index) => (
              <Badge 
                key={item.name} 
                variant="outline" 
                className="flex items-center gap-1"
                style={{ borderColor: COLORS[index % COLORS.length] }}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.name}: {item.value} ({item.percentage}%)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Completeness Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Data Completeness</CardTitle>
          <CardDescription>
            Percentage of filled fields for each column
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completenessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="field" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Completeness']}
                />
                <Bar 
                  dataKey="completeness" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuickStatsProps {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  validationRate: number;
}

export function QuickStats({ totalRecords, validRecords, invalidRecords, validationRate }: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRecords}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valid Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{validRecords}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invalid Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{invalidRecords}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Validation Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <span className={validationRate >= 90 ? 'text-green-600' : validationRate >= 70 ? 'text-yellow-600' : validationRate < 70 ? 'text-red-500' : ''}>
              {validationRate}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}