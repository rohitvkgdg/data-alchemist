"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Client, Worker, Task, ValidationResult } from '@/types/data-models';

export interface DataSummary {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  validationRate: number;
  fieldCompleteness: Record<string, number>;
  statusDistribution: Record<string, number>;
}

export interface ChartData {
  name: string;
  value: number;
  percentage: number;
}

export class DataAnalyzer {
  static analyzeClients(clients: Client[], validationResults?: ValidationResult<Client>): DataSummary {
    const total = clients.length;
    
    // Calculate field completeness
    const fieldCompleteness = {
      id: this.calculateCompleteness(clients, 'id'),
      name: this.calculateCompleteness(clients, 'name'),
      email: this.calculateCompleteness(clients, 'email'),
      phone: this.calculateCompleteness(clients, 'phone'),
      address: this.calculateCompleteness(clients, 'address'),
      status: this.calculateCompleteness(clients, 'status'),
    };

    // Calculate status distribution
    const statusDistribution = this.calculateDistribution(clients, 'status');

    // Calculate valid records based on validation results (exclude row 0 errors)
    const dataRowErrors = validationResults?.errors ? 
      validationResults.errors.filter(error => error.row > 0) : [];
    const errorRows = dataRowErrors.length > 0 ? 
      new Set(dataRowErrors.map(error => error.row)).size : 0;
    const validRecords = total - errorRows;
    const invalidRecords = errorRows;
    const validationRate = total > 0 ? Math.round((validRecords / total) * 100) : 0;

    return {
      totalRecords: total,
      validRecords,
      invalidRecords,
      validationRate,
      fieldCompleteness,
      statusDistribution,
    };
  }

  static analyzeWorkers(workers: Worker[], validationResults?: ValidationResult<Worker>): DataSummary {
    const total = workers.length;
    
    const fieldCompleteness = {
      id: this.calculateCompleteness(workers, 'id'),
      name: this.calculateCompleteness(workers, 'name'),
      email: this.calculateCompleteness(workers, 'email'),
      hourlyRate: this.calculateCompleteness(workers, 'hourlyRate'),
      availability: this.calculateCompleteness(workers, 'availability'),
      status: this.calculateCompleteness(workers, 'status'),
    };

    const statusDistribution = this.calculateDistribution(workers, 'status');

    // Calculate valid records based on validation results (exclude row 0 errors)
    const dataRowErrors = validationResults?.errors ? 
      validationResults.errors.filter(error => error.row > 0) : [];
    const errorRows = dataRowErrors.length > 0 ? 
      new Set(dataRowErrors.map(error => error.row)).size : 0;
    const validRecords = total - errorRows;
    const invalidRecords = errorRows;
    const validationRate = total > 0 ? Math.round((validRecords / total) * 100) : 0;

    return {
      totalRecords: total,
      validRecords,
      invalidRecords,
      validationRate,
      fieldCompleteness,
      statusDistribution,
    };
  }

  static analyzeTasks(tasks: Task[], validationResults?: ValidationResult<Task>): DataSummary {
    const total = tasks.length;
    
    const fieldCompleteness = {
      id: this.calculateCompleteness(tasks, 'id'),
      title: this.calculateCompleteness(tasks, 'title'),
      description: this.calculateCompleteness(tasks, 'description'),
      status: this.calculateCompleteness(tasks, 'status'),
      priority: this.calculateCompleteness(tasks, 'priority'),
      assignedTo: this.calculateCompleteness(tasks, 'assignedTo'),
    };

    const statusDistribution = this.calculateDistribution(tasks, 'status');

    // Calculate valid records based on validation results (exclude row 0 errors)
    const dataRowErrors = validationResults?.errors ? 
      validationResults.errors.filter(error => error.row > 0) : [];
    const errorRows = dataRowErrors.length > 0 ? 
      new Set(dataRowErrors.map(error => error.row)).size : 0;
    const validRecords = total - errorRows;
    const invalidRecords = errorRows;
    const validationRate = total > 0 ? Math.round((validRecords / total) * 100) : 0;

    return {
      totalRecords: total,
      validRecords,
      invalidRecords,
      validationRate,
      fieldCompleteness,
      statusDistribution,
    };
  }

  private static calculateCompleteness(data: Array<Record<string, unknown>>, field: string): number {
    if (data.length === 0) return 0;
    const filled = data.filter(item => {
      const value = item[field];
      return value !== null && value !== undefined && value !== '';
    }).length;
    return Math.round((filled / data.length) * 100);
  }

  private static calculateDistribution(data: Array<Record<string, unknown>>, field: string): Record<string, number> {
    const distribution: Record<string, number> = {};
    data.forEach(item => {
      const value = String(item[field] || 'Unknown');
      distribution[value] = (distribution[value] || 0) + 1;
    });
    return distribution;
  }

  static getChartData(distribution: Record<string, number>): ChartData[] {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / total) * 100)
    }));
  }
}

interface DataExportProps {
  data: Array<Record<string, unknown>>;
  filename: string;
  title?: string;
}

export function DataExport({ data, filename, title }: DataExportProps) {
  const exportToCSV = () => {
    if (data.length === 0) {
      toast.error('No data to export', {
        description: 'Upload some data first before exporting.'
      });
      return;
    }

    try {
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            
            // Handle null, undefined, and empty values
            if (value === null || value === undefined) {
              return '';
            }
            
            // Convert to string
            const stringValue = String(value);
            
            // Escape commas, quotes, and newlines
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            
            return stringValue;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('CSV exported successfully!', {
          description: `${data.length} records exported to ${filename}.csv`
        });
      } else {
        toast.error('Export not supported', {
          description: 'CSV download not supported in this browser.'
        });
      }
    } catch {
      toast.error('Export failed', {
        description: 'Failed to export CSV. Please try again.'
      });
    }
  };

  const exportToExcel = () => {
    if (data.length === 0) {
      toast.error('No data to export', {
        description: 'Upload some data first before exporting.'
      });
      return;
    }

    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, title || 'Data');
      XLSX.writeFile(wb, `${filename}.xlsx`);
      
      toast.success('Excel exported successfully!', {
        description: `${data.length} records exported to ${filename}.xlsx`
      });
    } catch {
      toast.error('Export failed', {
        description: 'Failed to export Excel. Please try again.'
      });
    }
  };

  const exportToJSON = () => {
    if (data.length === 0) {
      toast.error('No data to export', {
        description: 'Upload some data first before exporting.'
      });
      return;
    }

    try {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('JSON exported successfully!', {
          description: `${data.length} records exported to ${filename}.json`
        });
      } else {
        toast.error('Export not supported', {
          description: 'JSON download not supported in this browser.'
        });
      }
    } catch {
      toast.error('Export failed', {
        description: 'Failed to export JSON. Please try again.'
      });
    }
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export ({data.length} rows)
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}