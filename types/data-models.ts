import { z } from 'zod';

export const ClientSchema = z.object({
    id: z.string().min(1, "ClientID is required"),
    name: z.string().min(1, "ClientName is required"),
    priorityLevel: z.union([z.string(), z.number()]).transform((val) => {
        const num = Number(val);
        return isNaN(num) ? 1 : Math.min(Math.max(num, 1), 5);
    }).default(1),
    requestedTaskIDs: z.string().transform((val) => {
        return val ? val.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
    }).optional(),
    groupTag: z.string().optional(),
    attributesJSON: z.string().transform((val, ctx) => {
        if (!val || val.trim() === '') return {};
        try {
            return JSON.parse(val);
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid JSON format in attributesJSON field"
            });
            return z.NEVER;
        }
    }).optional(),
    // Legacy fields for backward compatibility
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['active', 'inactive', 'pending']).default('active'),
    metadata: z.string().transform((val, ctx) => {
        if (!val || val.trim() === '') return {};
        try {
            return JSON.parse(val);
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid JSON format in metadata field"
            });
            return z.NEVER;
        }
    }).optional(),
})

export const WorkerSchema = z.object({
    id: z.string().min(1, "WorkerID is required"),
    name: z.string().min(1, "WorkerName is required"),
    skills: z.string().transform((val) => {
        return val ? val.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
    }).optional(),
    availableSlots: z.string().transform((val) => {
        if (!val || val.trim() === '') return [];
        try {
            // Handle array format like "[1,2,3]" or comma-separated "1,2,3"
            const cleaned = val.replace(/[\[\]]/g, '');
            return cleaned.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        } catch {
            return [];
        }
    }).optional(),
    maxLoadPerPhase: z.union([z.string(), z.number()]).transform((val) => {
        const num = Number(val);
        return isNaN(num) ? 8 : Math.max(num, 1);
    }).default(8),
    workerGroup: z.string().optional(),
    qualificationLevel: z.union([z.string(), z.number()]).transform((val) => {
        const num = Number(val);
        return isNaN(num) ? 1 : Math.min(Math.max(num, 1), 10);
    }).default(1),
    // Handle both camelCase and lowercase variations for backward compatibility
    hourlyRate: z.any().optional(),
    hourlyrate: z.any().optional(),
    availability: z.enum(['full-time', 'part-time','contract']).default('full-time'),
    maxHoursPerWeek: z.any().optional(),
    maxhoursperweek: z.any().optional(),
    capacity: z.any().optional(), // Add support for capacity field
    status: z.enum(['active', 'inactive','on-leave']).default('active'),
    email: z.string().email("Invalid email address").optional(),
    preferences: z.string().transform((val, ctx) => {
        if (!val || val.trim() === '') return {};
        try {
            return JSON.parse(val);
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid JSON format in preferences field"
            });
            return z.NEVER;
        }
    }).optional(),
}).transform((data) => {
    // Normalize field names and apply transformations
    const normalizeNumber = (val: any) => {
        if (val === null || val === undefined || val === '') return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    };

    // Get hourlyRate from either field name
    const hourlyRateValue = data.hourlyRate ?? data.hourlyrate;
    const maxHoursValue = data.maxHoursPerWeek ?? data.maxhoursperweek ?? data.capacity;

    return {
        id: data.id,
        name: data.name,
        email: data.email,
        skills: data.skills,
        availableSlots: data.availableSlots,
        maxLoadPerPhase: data.maxLoadPerPhase,
        workerGroup: data.workerGroup,
        qualificationLevel: data.qualificationLevel,
        hourlyRate: normalizeNumber(hourlyRateValue),
        availability: data.availability,
        maxHoursPerWeek: maxHoursValue !== null && maxHoursValue !== undefined && maxHoursValue !== '' 
            ? normalizeNumber(maxHoursValue) || 40 
            : 40,
        status: data.status,
        preferences: data.preferences,
    };
})

export const TaskSchema = z.object({
    id: z.string().min(1, "TaskID is required"),
    title: z.string().min(1, "TaskName is required"),
    category: z.string().optional(),
    duration: z.union([z.string(), z.number()]).transform((val) => {
        const num = Number(val);
        return isNaN(num) ? 1 : Math.max(num, 1);
    }).default(1),
    requiredSkills: z.string().transform((val) => {
        return val ? val.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
    }).optional(),
    preferredPhases: z.string().transform((val) => {
        if (!val || val.trim() === '') return [];
        try {
            // Handle range syntax like "1-3" or array syntax "[1,2,3]" or comma-separated "1,2,3"
            const cleaned = val.replace(/[\[\]]/g, '').trim();
            
            // Check for range syntax like "1-3"
            if (cleaned.includes('-')) {
                const [start, end] = cleaned.split('-').map(s => parseInt(s.trim()));
                if (!isNaN(start) && !isNaN(end) && start <= end) {
                    return Array.from({length: end - start + 1}, (_, i) => start + i);
                }
            }
            
            // Handle comma-separated values
            return cleaned.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        } catch {
            return [];
        }
    }).optional(),
    maxConcurrent: z.union([z.string(), z.number()]).transform((val) => {
        const num = Number(val);
        return isNaN(num) ? 1 : Math.max(num, 1);
    }).default(1),
    // Legacy fields for backward compatibility
    description: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).default('pending'),
    priority: z.enum(['low', 'medium', 'high','urgent']).default('medium'),
    dueDate: z.string().optional(),
    duedate: z.string().optional(),
    assignedTo: z.string().optional(),
    assignedto: z.string().optional(),
    clientId: z.string().optional(),
    clientid: z.string().optional(),
    createdAt: z.date().default(() => new Date()),
    createdat: z.date().optional(),
    estimatedHours: z.any().optional(),
    estimatedhours: z.any().optional(),
    actualHours: z.any().optional(),
    actualhours: z.any().optional(),
    dependencies: z.string().transform((val) => {
    return val ? val.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  }).optional(),
    attributes: z.string().transform((val, ctx) => {
        if (!val || val.trim() === '') return {};
        try {
            return JSON.parse(val);
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid JSON format in attributes field"
            });
            return z.NEVER;
        }
    }).optional(),
}).transform((data) => {
    const normalizeNumber = (val: any) => {
        if (val === null || val === undefined || val === '') return undefined;
        const num = Number(val);
        return isNaN(num) ? undefined : num;
    };

    // Get values from either field name variation
    const dueDateValue = data.dueDate ?? data.duedate;
    const assignedToValue = data.assignedTo ?? data.assignedto;
    const clientIdValue = data.clientId ?? data.clientid;
    const createdAtValue = data.createdAt ?? data.createdat ?? new Date();
    const estimatedHoursValue = data.estimatedHours ?? data.estimatedhours;
    const actualHoursValue = data.actualHours ?? data.actualhours;

    const result = {
        id: data.id,
        title: data.title,
        category: data.category,
        duration: data.duration,
        requiredSkills: data.requiredSkills,
        preferredPhases: data.preferredPhases,
        maxConcurrent: data.maxConcurrent,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: dueDateValue,
        assignedTo: assignedToValue,
        clientId: clientIdValue,
        createdAt: createdAtValue,
        estimatedHours: normalizeNumber(estimatedHoursValue),
        actualHours: normalizeNumber(actualHoursValue),
        dependencies: data.dependencies,
        attributes: data.attributes,
    };

    return result;
}).refine(data => {
    if (data.actualHours && data.estimatedHours && data.actualHours > data.estimatedHours) {
        return false;
    }
    return true;
}, {
    message: "Actual hours cannot exceed estimated hours",
});

// Business Rule Schemas
export const RuleSchema = z.object({
    id: z.string().min(1, "Rule ID is required"),
    type: z.enum([
        'co-run',
        'slot-restriction', 
        'load-limit',
        'phase-window',
        'pattern-match',
        'precedence-override'
    ]),
    name: z.string().min(1, "Rule name is required"),
    description: z.string().optional(),
    priority: z.number().default(1),
    isActive: z.boolean().default(true),
    parameters: z.record(z.any()), // Flexible parameters based on rule type
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

export type Rule = z.infer<typeof RuleSchema>;

// Prioritization Weight Schema
export const PrioritizationWeightSchema = z.object({
    criteriaName: z.string(),
    weight: z.number().min(0).max(1),
    description: z.string().optional(),
});

export type PrioritizationWeight = z.infer<typeof PrioritizationWeightSchema>;

// Export Configuration Schema
export const ExportConfigSchema = z.object({
    includeClients: z.boolean().default(true),
    includeWorkers: z.boolean().default(true),
    includeTasks: z.boolean().default(true),
    includeRules: z.boolean().default(true),
    includePrioritization: z.boolean().default(true),
    format: z.enum(['xlsx', 'csv', 'json']).default('xlsx'),
    validDataOnly: z.boolean().default(false),
});

export type ExportConfig = z.infer<typeof ExportConfigSchema>;

export type Client = z.infer<typeof ClientSchema>;
export type Worker = z.infer<typeof WorkerSchema>;
export type Task = z.infer<typeof TaskSchema>;

export interface ValidationError {
    row: number;
    field: string;
    message: string;
    value: string | number | boolean | null;
}

export interface ValidationResult<T> {
    isValid: boolean;
    errors: ValidationError[];
    data: T[]; // All data (valid + invalid for display)
    validData?: T[]; // Only valid data (for export/processing)
    summary: {
        totalRows: number;
        validRows: number;
        invalidRows: number;
    }
}