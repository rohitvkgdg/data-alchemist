import { create } from "zustand";
import { Client, Worker, Task, ValidationError, ValidationResult } from "../types/data-models";
import { FileParser } from "../lib/parser";

export interface DataStore {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];

  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  
  // Validation state
  clientValidationResults: ValidationResult<Client> | null;
  workerValidationResults: ValidationResult<Worker> | null;
  taskValidationResults: ValidationResult<Task> | null;

  // Actions
    setClients: (clients: Client[], validation?: ValidationResult<Client>) => void;
    setWorkers: (workers: Worker[], validation?: ValidationResult<Worker>) => void;
    setTasks: (tasks: Task[], validation?: ValidationResult<Task>) => void;
    updateClient: (id: string, updates: Partial<Client>) => void;
    updateWorker: (id: string, updates: Partial<Worker>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    setUploadState: (isUploading: boolean, progress: number) => void;
    clearData: () => void;
    validateCrossReferences: () => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  clients: [],
  workers: [],
  tasks: [],

  isUploading: false,
  uploadProgress: 0,

  clientValidationResults: null,
  workerValidationResults: null,
  taskValidationResults: null,

  setClients: (clients, validation) => set({ 
    clients,
    clientValidationResults: validation || null
  }),
  setWorkers: (workers, validation) => set({ 
    workers,
    workerValidationResults: validation || null
}),
  setTasks: (tasks, validation) => set({ 
    tasks,
    taskValidationResults: validation || null
 }),
  
  updateClient: (id, updates) => set((state) => ({
    clients: state.clients.map(client => 
      client.id === id ? { ...client, ...updates } : client
    )
  })),
  
  updateWorker: (id, updates) => set((state) => ({
    workers: state.workers.map((worker) => 
      worker.id === id ? {...worker, ...updates} : worker
    )
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((task) => 
      task.id === id ? {...task, ...updates} : task
    )
  })),

  setUploadState: (isUploading, progress = 0) => set({ isUploading, uploadProgress: progress }),
  
  clearData: () => set({
    clients: [],
    workers: [],
    tasks: [],
    isUploading: false,
    uploadProgress: 0,
    clientValidationResults: null,
    workerValidationResults: null,
    taskValidationResults: null
  }),

  validateCrossReferences: () => {
    const { clients, workers, tasks, taskValidationResults } = get();
    
    const crossRefErrors = FileParser.validateCrossReferences(
      clients.map(c => ({ ...c })),
      workers.map(w => ({ ...w })),
      tasks.map(t => ({ ...t }))
    );
    
    const circularDepErrors = FileParser.validateCircularDependencies(
      tasks.map(t => ({ ...t }))
    );
    
    // Merge with existing task validation errors
    const skillCoverageErrors = FileParser.validateSkillCoverage(
      workers.map(w => ({ ...w })),
      tasks.map(t => ({ ...t }))
    );

    const capacityErrors = FileParser.validateWorkerCapacity(
      workers.map(w => ({ ...w })),
      tasks.map(t => ({ ...t }))
    );

    const allNewErrors = [
      ...crossRefErrors, 
      ...circularDepErrors,
      ...skillCoverageErrors,
      ...capacityErrors
    ];
    
    if (allNewErrors.length > 0) {
      const existingErrors = taskValidationResults?.errors || [];
      const allErrors = [...existingErrors, ...allNewErrors];
      
      // Update task validation results with all cross-validation errors
      const updatedValidation: ValidationResult<Task> = {
        isValid: allErrors.length === 0,
        errors: allErrors,
        data: tasks,
        validData: taskValidationResults?.validData || [],
        summary: {
          totalRows: tasks.length,
          validRows: tasks.length - allErrors.length,
          invalidRows: allErrors.length
        }
      };
      
      set({ taskValidationResults: updatedValidation });
    }
  }
}));