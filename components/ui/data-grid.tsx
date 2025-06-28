"use client";

import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowUpDown, Edit2, Save, X, AlertCircle, Search } from 'lucide-react';
import { ValidationError } from '@/types/data-models';

interface DataGridProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onUpdate?: (rowIndex: number, updates: Partial<T>) => void;
  validationErrors?: ValidationError[];
  title?: string;
}

interface TableMeta {
  editingRows: Set<number>;
  editingData: Record<number, Record<string, unknown>>;
  updateEditingData: (rowIndex: number, field: string, value: unknown) => void;
}

export function DataGrid<T>({ 
  data, 
  columns, 
  onUpdate, 
  validationErrors = [],
  title 
}: DataGridProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingRows, setEditingRows] = useState<Set<number>>(new Set());
  const [editingData, setEditingData] = useState<Record<number, Partial<T>>>({});

  // Filter out row 0 errors (file-level/structural issues) for display
  const dataRowErrors = validationErrors.filter(error => error.row > 0);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    meta: {
      editingRows,
      editingData,
      updateEditingData: (rowIndex: number, field: string, value: unknown) => {
        setEditingData(prev => ({
          ...prev,
          [rowIndex]: {
            ...prev[rowIndex],
            [field]: value
          }
        }));
      }
    } as TableMeta
  });

  const startEditing = (rowIndex: number) => {
    setEditingRows(prev => new Set([...prev, rowIndex]));
    setEditingData(prev => ({
      ...prev,
      [rowIndex]: { ...data[rowIndex] }
    }));
  };

  const cancelEditing = (rowIndex: number) => {
    setEditingRows(prev => {
      const newSet = new Set(prev);
      newSet.delete(rowIndex);
      return newSet;
    });
    setEditingData(prev => {
      const newData = { ...prev };
      delete newData[rowIndex];
      return newData;
    });
  };

  const saveEditing = (rowIndex: number) => {
    const updates = editingData[rowIndex];
    if (updates && onUpdate) {
      onUpdate(rowIndex, updates);
    }
    cancelEditing(rowIndex);
  };

  const getRowErrors = (rowIndex: number) => {
    // Use consistent 1-based indexing to match parser output
    // Parser uses `index + 1` for row numbers, so we need `rowIndex + 1` here
    return validationErrors.filter(error => error.row === rowIndex + 1);
  };

  const hasRowError = (rowIndex: number) => {
    const errors = getRowErrors(rowIndex);
    return errors.length > 0;
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="secondary">
            {data.length} rows
          </Badge>
        </div>
      )}

      {/* Search and Validation Summary */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        {dataRowErrors.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {dataRowErrors.length} validation errors
          </Badge>
        )}
      </div>

      {/* Validation Summary Alert */}
      {dataRowErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Found {dataRowErrors.length} validation errors in your data. 
            Rows with errors are highlighted below.
          </AlertDescription>
        </Alert>
      )}

      {/* Table Container */}
      <div className="w-full border rounded-md">
        <div className="w-full overflow-auto">
          <Table className="w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <TableHead className="w-[120px] min-w-[120px] text-center">Actions</TableHead>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="min-w-[150px] text-center">
                      {header.isPlaceholder ? null : (
                        <Button
                          variant="ghost"
                          onClick={header.column.getToggleSortingHandler()}
                          className="h-auto p-0 font-semibold hover:bg-transparent"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => {
                  const isEditing = editingRows.has(index);
                  const hasError = hasRowError(index);
                  const rowErrors = getRowErrors(index);

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow 
                        className={`
                          ${hasError ? 'border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900' : ''} 
                          ${isEditing ? 'bg-muted hover:bg-muted/80' : ''}
                          transition-colors
                        `.trim()}
                      >
                        {/* Actions Column */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {isEditing ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => saveEditing(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => cancelEditing(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => startEditing(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                            {hasError && (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        </TableCell>

                        {/* Data Columns */}
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="text-center">
                            {flexRender(cell.column.columnDef.cell, {
                              ...cell.getContext(),
                              isEditing,
                              rowIndex: index,
                            })}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Error Row */}
                      {hasError && (
                        <TableRow className="bg-destructive/5 hover:bg-destructive/5">
                          <TableCell colSpan={table.getAllColumns().length + 1} className="py-3">
                            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <span className="font-medium text-destructive">
                                  Validation Errors for Row {index + 1}:
                                </span>
                              </div>
                              <div className="space-y-2">
                                {rowErrors.map((error, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm">
                                    <Badge variant="destructive" className="text-xs">
                                      {error.field}
                                    </Badge>
                                    <span className="text-destructive">{error.message}</span>
                                    <span className="text-muted-foreground font-mono text-xs bg-muted px-2 py-1 rounded">
                                      Value: &quot;{error.value}&quot;
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-muted-foreground">No data available</div>
                      <div className="text-sm text-muted-foreground">
                        Upload a CSV or Excel file to get started
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}