import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Client, Worker, Task, ValidationResult, ValidationError, ClientSchema, WorkerSchema, TaskSchema } from '@/types/data-models';

export type DataType = 'clients' | 'workers' | 'tasks';

export class FileParser {
    static async parseFile(file: File, dataType: DataType): Promise<ValidationResult<any>> {
        try {
            const data = await this.extractDataFromFile(file);
            return this.validateData(data, dataType);
        } catch (error) {
            console.error('Error parsing file:', error);
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
    private static async extractDataFromFile(file: File): Promise<any[]> {
        if (file.name.endsWith('.csv')) {
            return this.parseCSV(file);
        }
        else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            return this.parseExcel(file);
        }
        else throw new Error('Unsupported file type. Please upload a CSV or Excel file.')
    }

    private static async parseCSV(file: File): Promise<any[]> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => {
                    return header.trim().toLowerCase().replace(/\s+/g, '');
                },
                transform: (value) => {
                    return typeof value === 'string' ? value.trim() : value;
                },
                complete: (results) => {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    console.log('CSV parsed successfully:', results.data.length, 'rows');
                    resolve(results.data);
                },
                error: (error) => {
                    console.error('CSV parsing error:', error);
                    reject(error)
                }
            });
        });
    }

    private static async parseExcel(file: File): Promise<any[]> {
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
                        h.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, '')
                    );
                    const rows = jsonData.slice(1) as any[][];
                    const result = rows.map(row => {
                        const obj: any = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || null;
                        })
                        return obj;
                    }).filter(row => Object.values(row).some(value => value !== null && value !== undefined));
                    console.log('Excel parsed successfully:', result.length, 'rows');
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
    private static validateData(data: any[], dataType: DataType): ValidationResult<any> {
        const schema = this.getSchema(dataType);
        const errors: ValidationError[] = [];
        const validData: any[] = [];

        data.forEach((row, index) => {
            const result = schema.safeParse(row);
            if (result.success) validData.push(result.data);
            else {
                result.error.errors.forEach(error => {
                    errors.push({
                        row: index + 1,
                        field: error.path.join('.'),
                        message: error.message,
                        value: error.path.reduce((obj, key) => obj?.[key], row)
                    })
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            data: validData,
            summary: {
                totalRows: data.length,
                validRows: validData.length,
                invalidRows: data.length - validData.length
            }
        };
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