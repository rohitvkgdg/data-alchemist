import { ColumnDef, RowData } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Client, Worker, Task } from '@/types/data-models';

// Extend TableMeta to include our custom properties
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    editingRows?: Set<number>;
    editingData?: Record<number, Record<string, unknown>>;
    updateEditingData?: (rowIndex: number, field: string, value: unknown) => void;
  }
}

// Proper TypeScript interface for EditableCell
interface EditableCellProps {
  getValue: () => unknown;
  isEditing: boolean;
  rowIndex: number;
  field: string;
  type?: 'text' | 'email' | 'number' | 'select' | 'status';
  options?: string[];
  table: {
    options: {
      meta?: {
        editingRows?: Set<number>;
        editingData?: Record<number, Record<string, unknown>>;
        updateEditingData?: (rowIndex: number, field: string, value: unknown) => void;
      };
    };
  };
}

// Editable Cell Component with proper types
function EditableCell({ 
  getValue, 
  isEditing, 
  rowIndex,
  field,
  type = 'text',
  options,
  table
}: EditableCellProps) {
  const initialValue = getValue();
  const editingData = table.options.meta?.editingData?.[rowIndex];
  const editValue = editingData?.[field] ?? initialValue;
  const updateEditingData = table.options.meta?.updateEditingData;

  if (!isEditing) {
    if (type === 'status') {
      const stringValue = String(initialValue);
      const variant = stringValue === 'active' ? 'default' : 
                    stringValue === 'inactive' ? 'secondary' : 
                    stringValue === 'pending' ? 'outline' : 'destructive';
      return (
        <div className="flex justify-center">
          <Badge variant={variant as "default" | "destructive" | "outline" | "secondary"}>
            {stringValue}
          </Badge>
        </div>
      );
    }
    if (type === 'email') {
      return (
        <div className="font-mono text-sm text-center">
          {String(initialValue || '-')}
        </div>
      );
    }
    if (type === 'number') {
      return (
        <div className="text-center">
          {initialValue !== undefined && initialValue !== null && initialValue !== '' ? Number(initialValue) : '-'}
        </div>
      );
    }
    return <div className="text-center">{String(initialValue || '-')}</div>;
  }

  if (type === 'select' && options) {
    return (
      <Select 
        value={String(editValue || '')} 
        onValueChange={(value) => updateEditingData?.(rowIndex, field, value)}
      >
        <SelectTrigger className="w-full h-8">
          <SelectValue placeholder={`Select ${field}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: string) => (
            <SelectItem key={option} value={option}>
              <Badge variant="outline" className="text-xs">
                {option}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={type === 'number' ? 'number' : type === 'email' ? 'email' : 'text'}
      value={String(editValue || '')}
      onChange={(e) => updateEditingData?.(rowIndex, field, e.target.value)}
      className="w-full h-8"
      placeholder={`Enter ${field}`}
    />
  );
}

// Client Columns with proper typing
export const clientColumns: ColumnDef<Client>[] = [
  {
    accessorKey: 'id',
    header: 'Client ID',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="id"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="name"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="email"
        type="email"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="phone"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="status"
        type="select"
        options={['active', 'inactive', 'pending']}
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="address"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'metadata',
    header: 'Metadata',
    cell: (props) => {
      const value = props.getValue();
      const jsonString = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      return (
        <div className="max-w-[200px] truncate text-sm text-center" title={jsonString}>
          {jsonString || '-'}
        </div>
      );
    },
  },
];

// Worker Columns with proper typing
export const workerColumns: ColumnDef<Worker>[] = [
  {
    accessorKey: 'id',
    header: 'Worker ID',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="id"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="name"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="email"
        type="email"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'hourlyRate',
    header: 'Hourly Rate',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="hourlyRate"
        type="number"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'availability',
    header: 'Availability',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="availability"
        type="select"
        options={['full-time', 'part-time', 'contract']}
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="status"
        type="select"
        options={['active', 'inactive', 'on-leave']}
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'preferences',
    header: 'Preferences',
    cell: (props) => {
      const value = props.getValue();
      const jsonString = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      return (
        <div className="max-w-[200px] truncate text-sm text-center" title={jsonString}>
          {jsonString || '-'}
        </div>
      );
    },
  },
];

// Task Columns with proper typing
export const taskColumns: ColumnDef<Task>[] = [
  {
    accessorKey: 'id',
    header: 'Task ID',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="id"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="title"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="description"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'assignedTo',
    header: 'Assigned To',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="assignedTo"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="status"
        type="select"
        options={['pending', 'in-progress', 'completed', 'cancelled']}
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="priority"
        type="select"
        options={['low', 'medium', 'high', 'urgent']}
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="dueDate"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'estimatedHours',
    header: 'Est. Hours',
    cell: (props) => (
      <EditableCell 
        getValue={props.getValue}
        isEditing={props.table.options.meta?.editingRows?.has(props.row.index) || false}
        rowIndex={props.row.index}
        field="estimatedHours"
        type="number"
        table={props.table}
      />
    ),
  },
  {
    accessorKey: 'attributes',
    header: 'Attributes',
    cell: (props) => {
      const value = props.getValue();
      const jsonString = typeof value === 'object' ? JSON.stringify(value) : String(value || '');
      return (
        <div className="max-w-[200px] truncate text-sm text-center" title={jsonString}>
          {jsonString || '-'}
        </div>
      );
    },
  },
];