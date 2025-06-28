import { create } from "zustand";
import { Client, Worker, Task, ValidationError, ValidationResult } from "../types/data-models";

export interface DataStore {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];

  //Upload state
  isUploading: boolean;
  uploadProgress: number;
  
  //Validation state
  clientValidationResults: ValidationResult<Client> | null;
  workerValidationResults: ValidationResult<Worker> | null;
  taskValidationResults: ValidationResult<Task> | null;

  //Actions
    setClients: (clients: Client[], validation?: ValidationResult<Client>) => void;
    setWorkers: (workers: Worker[], validation?: ValidationResult<Worker>) => void;
    setTasks: (tasks: Task[], validation?: ValidationResult<Task>) => void;
    updateClient: (client: Client, updates: Partial<Client>) => void;
    updateWorker: (worker: Worker, updates: Partial<Worker>) => void;
    updateTask: (task: Task, updates: Partial<Task>) => void;
    setUploadState: (isUploading: boolean, progress: number) => void;
    clearData: () => void;
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
  
  updateClient: (client, updates) => set((state) => ({
    clients: state.clients.map(c => 
      c.id === client.id ? { ...c, ...updates } : c
    )
  })),
  
  updateWorker: (worker, updates) => set((state) => ({
    workers: state.workers.map((w) => 
      w.id === worker.id ? {...w, ...updates} : w
    )
  })),
  
  updateTask: (task, updates) => set((state) => ({
    tasks: state.tasks.map((t) => 
      t.id === task.id ? {...t, ...updates} : t
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
}));