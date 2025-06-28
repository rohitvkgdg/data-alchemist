import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ValidationResult, ValidationError, ClientSchema, WorkerSchema, TaskSchema } from '@/types/data-models';

export type DataType = 'clients' | 'workers' | 'tasks';

export class FileParser {
    static async parseFile(file: File, dataType: DataType): Promise<ValidationResult<Record<string, unknown>>> {
        try {
            const data = await this.extractDataFromFile(file);
            return this.validateData(data, dataType);
        } catch {
            return {
                data: [],
                errors: [{ row: 0, field: 'file', message: 'File parsing failed', value: null }],
                isValid: false,
                summary: {
                    totalRows: 0,
                    validRows: 0,
                    invalidRows: 0,
                }
            };
        }
    }
    private static async extractDataFromFile(file: File): Promise<Record<string, unknown>[]> {
        if (file.name.endsWith('.csv')) {
            return this.parseCSV(file);
        }
        else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            return this.parseExcel(file);
        }
        else throw new Error('Unsupported file type. Please upload a CSV or Excel file.')
    }

    private static async parseCSV(file: File): Promise<Record<string, unknown>[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => {
                    // Just trim and remove spaces, but preserve camelCase
                    return header.trim().replace(/\s+/g, '');
                },
                transform: (value) => {
                    return typeof value === 'string' ? value.trim() : value;
                },
                complete: (results) => {
                    resolve(results.data as Record<string, unknown>[]);
                },
                error: (error) => {
                    reject(error)
                }
            });
        });
    }

    private static async parseExcel(file: File): Promise<Record<string, unknown>[]> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firestSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firestSheet, { header: 1, defval: null, raw: false });
                    if (jsonData.length === 0) {
                        throw new Error('Excel file is empty');
                    }
                    const headers = (jsonData[0] as string[]).map(h =>
                        h.toString().trim().replace(/[^a-zA-Z0-9]/g, '')
                    );
                    const rows = jsonData.slice(1) as unknown[][];
                    const result = rows.map(row => {
                        const obj: Record<string, unknown> = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || null;
                        })
                        return obj;
                    }).filter(row => Object.values(row).some(value => value !== null && value !== undefined));
                    resolve(result);
                } catch (error) {
                    reject(new Error(`Excel parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
                }
            };
            reader.onerror = (error) => {
                reject(new Error(`File reading error: ${error instanceof Error ? error.message : 'Unknown error'}`));
            }
            reader.readAsArrayBuffer(file);
        });
    }
    private static validateData(data: Record<string, unknown>[], dataType: DataType): ValidationResult<Record<string, unknown>> {
        const schema = this.getSchema(dataType);
        const errors: ValidationError[] = [];
        const validData: Record<string, unknown>[] = [];
        const allData: Record<string, unknown>[] = [];

        // Ensure we start with clean data arrays
        if (data.length === 0) {
            return {
                isValid: true,
                errors: [],
                data: [],
                validData: [],
                summary: {
                    totalRows: 0,
                    validRows: 0,
                    invalidRows: 0
                }
            };
        }

        // 1. Check for missing required columns
        const missingColumnErrors = this.validateMissingRequiredColumns(data, dataType);
        errors.push(...missingColumnErrors);

        // 2. Check for duplicate IDs
        const idCounts = new Map<string, number[]>();
        data.forEach((row, index) => {
            const id = String(row.id || row.ClientID || row.WorkerID || row.TaskID || '').trim();
            if (id) {
                if (!idCounts.has(id)) {
                    idCounts.set(id, []);
                }
                idCounts.get(id)!.push(index + 1);
            }
        });

        // Add duplicate ID errors
        idCounts.forEach((rowNumbers, id) => {
            if (rowNumbers.length > 1) {
                rowNumbers.forEach(rowNumber => {
                    errors.push({
                        row: rowNumber,
                        field: 'id',
                        message: `Duplicate ID "${id}" found in rows: ${rowNumbers.join(', ')}`,
                        value: id
                    });
                });
            }
        });

        // 3. Schema validation and transformation
        data.forEach((row, index) => {
            const result = schema.safeParse(row);
            let processedRow;
            
            if (result.success) {
                // Use the transformed data from schema
                processedRow = {
                    ...result.data,
                    id: result.data.id || `temp-${index}-${Date.now()}`
                };
                validData.push(result.data);
            } else {
                // For invalid data, still apply basic transformations but keep original structure
                processedRow = {
                    ...row,
                    id: row.id || `temp-${index}-${Date.now()}`
                };
                result.error.errors.forEach(error => {
                    errors.push({
                        row: index + 1,
                        field: error.path.join('.'),
                        message: error.message,
                        value: String(row[error.path[0]] || '')
                    })
                });
            }
            
            allData.push(processedRow);
        });

        // 4. Additional validations
        const rangeErrors = this.validateOutOfRangeValues(data, dataType);
        errors.push(...rangeErrors);

        const malformedListErrors = this.validateMalformedLists(data, dataType);
        errors.push(...malformedListErrors);

        if (dataType === 'clients') {
            const priorityErrors = this.validatePriorityLevels(data);
            errors.push(...priorityErrors);
        }

        if (dataType === 'tasks') {
            const durationErrors = this.validateTaskDuration(data);
            errors.push(...durationErrors);
        }

        // Calculate unique invalid rows based on actual errors
        // Exclude row 0 errors (missing columns, file-level issues) from data row count
        const dataRowErrors = errors.filter(error => error.row > 0);
        const invalidRowNumbers = new Set(dataRowErrors.map(error => error.row));
        const uniqueInvalidRows = invalidRowNumbers.size;

        return {
            isValid: errors.length === 0,
            errors,
            data: allData, // Return all rows instead of just valid ones
            validData, // Keep valid data separate for other uses
            summary: {
                totalRows: data.length,
                validRows: data.length - uniqueInvalidRows,
                invalidRows: uniqueInvalidRows
            }
        };
    }

    // Add cross-reference validation function
    static validateCrossReferences(
        clients: Record<string, unknown>[],
        workers: Record<string, unknown>[],
        tasks: Record<string, unknown>[]
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        
        // Get all valid IDs
        const clientIds = new Set(clients.map(c => String(c.id)).filter(id => id && id !== ''));
        const workerIds = new Set(workers.map(w => String(w.id)).filter(id => id && id !== ''));
        const taskIds = new Set(tasks.map(t => String(t.id)).filter(id => id && id !== ''));
        
        // Check task references
        tasks.forEach((task, index) => {
            const rowNumber = index + 1;
            
            // Check assignedTo references
            if (task.assignedTo && String(task.assignedTo).trim() !== '') {
                const assignedTo = String(task.assignedTo).trim();
                if (!workerIds.has(assignedTo)) {
                    errors.push({
                        row: rowNumber,
                        field: 'assignedTo',
                        message: `Worker ID "${assignedTo}" not found in workers data`,
                        value: assignedTo
                    });
                }
            }
            
            // Check clientId references
            if (task.clientId && String(task.clientId).trim() !== '') {
                const clientId = String(task.clientId).trim();
                if (!clientIds.has(clientId)) {
                    errors.push({
                        row: rowNumber,
                        field: 'clientId',
                        message: `Client ID "${clientId}" not found in clients data`,
                        value: clientId
                    });
                }
            }
            
            // Check task dependencies
            if (task.dependencies && typeof task.dependencies === 'string') {
                const deps = task.dependencies.split(',').map(d => d.trim()).filter(d => d);
                deps.forEach(depId => {
                    if (!taskIds.has(depId)) {
                        errors.push({
                            row: rowNumber,
                            field: 'dependencies',
                            message: `Dependency task ID "${depId}" not found in tasks data`,
                            value: depId
                        });
                    }
                });
            }
        });
        
        return errors;
    }

    // Add circular dependency validation function
    static validateCircularDependencies(tasks: Record<string, unknown>[]): ValidationError[] {
        const errors: ValidationError[] = [];
        const taskIds = new Set(tasks.map(t => String(t.id)).filter(id => id && id !== ''));
        
        // Build dependency graph
        const dependencyGraph = new Map<string, string[]>();
        const taskRowMap = new Map<string, number>();
        
        tasks.forEach((task, index) => {
            const taskId = String(task.id);
            taskRowMap.set(taskId, index + 1);
            
            if (task.dependencies && typeof task.dependencies === 'string') {
                const deps = task.dependencies.split(',')
                    .map(d => d.trim())
                    .filter(d => d && taskIds.has(d));
                dependencyGraph.set(taskId, deps);
            } else {
                dependencyGraph.set(taskId, []);
            }
        });
        
        // Check for circular dependencies using DFS
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        
        const hasCycle = (taskId: string, path: string[]): boolean => {
            if (recursionStack.has(taskId)) {
                // Found a cycle - report all tasks in the cycle
                const cycleStart = path.indexOf(taskId);
                const cycleTasks = path.slice(cycleStart).concat([taskId]);
                
                cycleTasks.forEach(cycleTaskId => {
                    const rowNumber = taskRowMap.get(cycleTaskId) || 0;
                    errors.push({
                        row: rowNumber,
                        field: 'dependencies',
                        message: `Circular dependency detected: ${cycleTasks.join(' → ')}`,
                        value: cycleTasks.join(' → ')
                    });
                });
                
                return true;
            }
            
            if (visited.has(taskId)) {
                return false;
            }
            
            visited.add(taskId);
            recursionStack.add(taskId);
            
            const dependencies = dependencyGraph.get(taskId) || [];
            for (const depId of dependencies) {
                if (hasCycle(depId, [...path, taskId])) {
                    return true;
                }
            }
            
            recursionStack.delete(taskId);
            return false;
        };
        
        // Check each task for circular dependencies
        for (const taskId of taskIds) {
            if (!visited.has(taskId)) {
                hasCycle(taskId, []);
            }
        }
        
        return errors;
    }

    // Add out-of-range value validation function
    static validateOutOfRangeValues(data: Record<string, unknown>[], dataType: DataType): ValidationError[] {
        const errors: ValidationError[] = [];
        
        data.forEach((row, index) => {
            const rowNumber = index + 1;
            
            if (dataType === 'workers') {
                // Validate hourly rate ranges
                if (row.hourlyRate !== null && row.hourlyRate !== undefined && row.hourlyRate !== '') {
                    const hourlyRate = Number(row.hourlyRate);
                    if (!isNaN(hourlyRate)) {
                        if (hourlyRate < 0) {
                            errors.push({
                                row: rowNumber,
                                field: 'hourlyRate',
                                message: `Hourly rate cannot be negative (ID: ${row.id})`,
                                value: String(row.hourlyRate)
                            });
                        } else if (hourlyRate > 1000) {
                            errors.push({
                                row: rowNumber,
                                field: 'hourlyRate',
                                message: 'Hourly rate seems unreasonably high (>$1000/hour)',
                                value: String(row.hourlyRate)
                            });
                        }
                    }
                }
                
                // Validate max hours per week (check capacity field for workers data)
                const capacityField = row.capacity || row.maxHoursPerWeek || row.maxLoadPerPhase;
                if (capacityField !== null && capacityField !== undefined && capacityField !== '') {
                    const maxHours = Number(capacityField);
                    if (!isNaN(maxHours)) {
                        if (maxHours < 1) {
                            errors.push({
                                row: rowNumber,
                                field: 'maxLoadPerPhase',
                                message: 'Max hours per week must be at least 1',
                                value: String(capacityField)
                            });
                        } else if (maxHours > 168) {
                            errors.push({
                                row: rowNumber,
                                field: 'maxLoadPerPhase',
                                message: 'Max hours per week cannot exceed 168 hours (24×7)',
                                value: String(capacityField)
                            });
                        }
                    }
                }
            }
            
            if (dataType === 'tasks') {
                const currentDate = new Date();
                const futureLimit = new Date();
                futureLimit.setFullYear(currentDate.getFullYear() + 5); // 5 years in future
                
                // Validate due dates
                if (row.dueDate && typeof row.dueDate === 'string') {
                    const dueDate = new Date(row.dueDate);
                    if (!isNaN(dueDate.getTime())) {
                        const pastLimit = new Date('2000-01-01');
                        
                        if (dueDate < pastLimit) {
                            errors.push({
                                row: rowNumber,
                                field: 'dueDate',
                                message: 'Due date is too far in the past (before 2000)',
                                value: row.dueDate
                            });
                        } else if (dueDate > futureLimit) {
                            errors.push({
                                row: rowNumber,
                                field: 'dueDate',
                                message: 'Due date is too far in the future (>5 years)',
                                value: row.dueDate
                            });
                        }
                    }
                }
                
                // Validate estimated hours
                if (row.estimatedHours !== null && row.estimatedHours !== undefined && row.estimatedHours !== '') {
                    const estimatedHours = Number(row.estimatedHours);
                    if (!isNaN(estimatedHours)) {
                        if (estimatedHours < 0) {
                            errors.push({
                                row: rowNumber,
                                field: 'estimatedHours',
                                message: 'Estimated hours cannot be negative',
                                value: String(row.estimatedHours)
                            });
                        } else if (estimatedHours > 10000) {
                            errors.push({
                                row: rowNumber,
                                field: 'estimatedHours',
                                message: 'Estimated hours seems unreasonably high (>10,000 hours)',
                                value: String(row.estimatedHours)
                            });
                        }
                    }
                }
                
                // Validate actual hours
                if (row.actualHours !== null && row.actualHours !== undefined && row.actualHours !== '') {
                    const actualHours = Number(row.actualHours);
                    if (!isNaN(actualHours)) {
                        if (actualHours < 0) {
                            errors.push({
                                row: rowNumber,
                                field: 'actualHours',
                                message: 'Actual hours cannot be negative',
                                value: String(row.actualHours)
                            });
                        } else if (actualHours > 10000) {
                            errors.push({
                                row: rowNumber,
                                field: 'actualHours',
                                message: 'Actual hours seems unreasonably high (>10,000 hours)',
                                value: String(row.actualHours)
                            });
                        }
                    }
                }
            }
        });
        
        return errors;
    }

    // Enhanced Core Validations
    static validateMissingRequiredColumns(data: Record<string, unknown>[], dataType: DataType): ValidationError[] {
        const errors: ValidationError[] = [];
        
        const requiredColumns = {
            'clients': ['ClientID', 'ClientName', 'PriorityLevel'],
            'workers': ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots'],
            'tasks': ['TaskID', 'TaskName', 'Duration', 'RequiredSkills']
        };

        const required = requiredColumns[dataType];
        if (!required || data.length === 0) return errors;

        const headers = Object.keys(data[0]);
        
        required.forEach(col => {
            // Check both exact match and lowercase version
            const found = headers.some(h => 
                h === col || 
                h.toLowerCase() === col.toLowerCase() ||
                h.toLowerCase().replace(/\s+/g, '') === col.toLowerCase().replace(/\s+/g, '')
            );
            
            if (!found) {
                errors.push({
                    row: 0,
                    field: col,
                    message: `Missing required column: ${col}`,
                    value: `Available columns: ${headers.join(', ')}`
                });
            }
        });

        return errors;
    }

    static validateMalformedLists(data: Record<string, unknown>[], dataType: DataType): ValidationError[] {
        const errors: ValidationError[] = [];
        
        data.forEach((row, index) => {
            const rowNumber = index + 1;
            
            if (dataType === 'workers') {
                // Validate AvailableSlots
                if (row.availableSlots && typeof row.availableSlots === 'string') {
                    try {
                        const cleaned = (row.availableSlots as string).replace(/[\[\]]/g, '');
                        const slots = cleaned.split(',').map(s => parseInt(s.trim()));
                        
                        if (slots.some(s => isNaN(s) || s < 1)) {
                            errors.push({
                                row: rowNumber,
                                field: 'availableSlots',
                                message: 'AvailableSlots must contain valid phase numbers (≥1)',
                                value: String(row.availableSlots)
                            });
                        }
                    } catch {
                        errors.push({
                            row: rowNumber,
                            field: 'availableSlots',
                            message: 'Malformed AvailableSlots format',
                            value: String(row.availableSlots)
                        });
                    }
                }
            }
            
            if (dataType === 'tasks') {
                // Validate PreferredPhases
                if (row.preferredPhases && typeof row.preferredPhases === 'string') {
                    try {
                        const val = row.preferredPhases as string;
                        const cleaned = val.replace(/[\[\]]/g, '').trim();
                        
                        if (cleaned.includes('-')) {
                            const [start, end] = cleaned.split('-').map(s => parseInt(s.trim()));
                            if (isNaN(start) || isNaN(end) || start > end || start < 1) {
                                errors.push({
                                    row: rowNumber,
                                    field: 'preferredPhases',
                                    message: 'Invalid phase range format or values',
                                    value: String(row.preferredPhases)
                                });
                            }
                        } else {
                            const phases = cleaned.split(',').map(s => parseInt(s.trim()));
                            if (phases.some(p => isNaN(p) || p < 1)) {
                                errors.push({
                                    row: rowNumber,
                                    field: 'preferredPhases',
                                    message: 'PreferredPhases must contain valid phase numbers (≥1)',
                                    value: String(row.preferredPhases)
                                });
                            }
                        }
                    } catch {
                        errors.push({
                            row: rowNumber,
                            field: 'preferredPhases',
                            message: 'Malformed PreferredPhases format',
                            value: String(row.preferredPhases)
                        });
                    }
                }
            }
        });
        
        return errors;
    }

    static validatePriorityLevels(data: Record<string, unknown>[]): ValidationError[] {
        const errors: ValidationError[] = [];
        
        data.forEach((row, index) => {
            const rowNumber = index + 1;
            
            if (row.priorityLevel !== null && row.priorityLevel !== undefined) {
                const priority = Number(row.priorityLevel);
                if (isNaN(priority) || priority < 1 || priority > 5) {
                    errors.push({
                        row: rowNumber,
                        field: 'priorityLevel',
                        message: 'PriorityLevel must be between 1 and 5',
                        value: String(row.priorityLevel)
                    });
                }
            }
        });
        
        return errors;
    }

    static validateTaskDuration(data: Record<string, unknown>[]): ValidationError[] {
        const errors: ValidationError[] = [];
        
        data.forEach((row, index) => {
            const rowNumber = index + 1;
            
            if (row.duration !== null && row.duration !== undefined) {
                const duration = Number(row.duration);
                if (isNaN(duration) || duration < 1) {
                    errors.push({
                        row: rowNumber,
                        field: 'duration',
                        message: 'Duration must be ≥ 1 phase',
                        value: String(row.duration)
                    });
                }
            }
        });
        
        return errors;
    }

    static validateSkillCoverage(
        workers: Record<string, unknown>[],
        tasks: Record<string, unknown>[]
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        
        // Get all worker skills
        const allWorkerSkills = new Set<string>();
        workers.forEach(worker => {
            if (worker.skills && Array.isArray(worker.skills)) {
                (worker.skills as string[]).forEach(skill => {
                    allWorkerSkills.add(skill.toLowerCase().trim());
                });
            }
        });
        
        // Check each task's required skills
        tasks.forEach((task, index) => {
            const rowNumber = index + 1;
            
            if (task.requiredSkills && Array.isArray(task.requiredSkills)) {
                (task.requiredSkills as string[]).forEach(skill => {
                    const normalizedSkill = skill.toLowerCase().trim();
                    if (!allWorkerSkills.has(normalizedSkill)) {
                        errors.push({
                            row: rowNumber,
                            field: 'requiredSkills',
                            message: `Required skill "${skill}" not found in any worker`,
                            value: skill
                        });
                    }
                });
            }
        });
        
        return errors;
    }

    static validateWorkerCapacity(
        workers: Record<string, unknown>[],
        tasks: Record<string, unknown>[]
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        
        // Group tasks by phase and calculate required capacity
        const phaseCapacity = new Map<number, number>();
        
        tasks.forEach(task => {
            if (task.preferredPhases && Array.isArray(task.preferredPhases) && task.duration) {
                const duration = Number(task.duration);
                const maxConcurrent = Number(task.maxConcurrent) || 1;
                
                (task.preferredPhases as number[]).forEach(phase => {
                    const current = phaseCapacity.get(phase) || 0;
                    phaseCapacity.set(phase, current + (duration * maxConcurrent));
                });
            }
        });
        
        // Calculate available worker capacity per phase
        const workerCapacity = new Map<number, number>();
        
        workers.forEach(worker => {
            if (worker.availableSlots && Array.isArray(worker.availableSlots)) {
                const maxLoad = Number(worker.maxLoadPerPhase) || 8;
                
                (worker.availableSlots as number[]).forEach(phase => {
                    const current = workerCapacity.get(phase) || 0;
                    workerCapacity.set(phase, current + maxLoad);
                });
            }
        });
        
        // Check for phase saturation
        phaseCapacity.forEach((required, phase) => {
            const available = workerCapacity.get(phase) || 0;
            
            if (required > available) {
                errors.push({
                    row: 0,
                    field: 'phaseCapacity',
                    message: `Phase ${phase} is oversaturated: requires ${required} slots, only ${available} available`,
                    value: `Phase ${phase}: ${required}/${available}`
                });
            }
        });
        
        return errors;
    }

    private static getSchema(dataType: DataType) {
        switch (dataType) {
            case 'clients': return ClientSchema;
            case 'workers': return WorkerSchema;
            case 'tasks': return TaskSchema;
            default: throw new Error(`Unknown data type: ${dataType}`)
        }
    }
}