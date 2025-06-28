import { z } from 'zod';

export const ClientSchema = z.object({
    id: z.string().min(1, "ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['active', 'inactive', 'pending']).default('active'),
})

export const WorkerSchema = z.object({
    id: z.string().min(1, "ID is required"),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional(),
    skills: z.string().transform((val) => {
    return val ? val.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  }).optional(),
    hourlyRate: z.number().min(0, "Hourly rate must be a positive number").optional(),
    availability: z.enum(['full-time', 'part-time','contract']).default('full-time'),
    maxHoursPerWeek: z.number().min(1, "Max hours per week must be a positive number").default(40),
    status: z.enum(['active', 'inactive','on-leave']).default('active'),
})

export const TaskSchema = z.object({
    id: z.string().min(1, "ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']).default('pending'),
    priority: z.enum(['low', 'medium', 'high','urgent']).default('medium'),
    dueDate: z.string().optional(),
    assignedTo: z.string().uuid().optional(), // Worker ID
    clientId: z.string().uuid().optional(), // Client ID
    createdAt: z.date().default(() => new Date()),
    estimatedHours: z.number().min(0, "Estimated hours must be a positive number").optional(),
    actualHours: z.number().min(0, "Actual hours must be a positive number").optional(),
    dependencies: z.string().transform((val) => {
    return val ? val.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  }).optional(),
}).refine(data => {
    if (data.actualHours && data.estimatedHours && data.actualHours > data.estimatedHours) {
        return false;
    }
    return true;
}, {
    message: "Actual hours cannot exceed estimated hours",
});

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
    data: T[];
    summary: {
        totalRows: number;
        validRows: number;
        invalidRows: number;
    }
}