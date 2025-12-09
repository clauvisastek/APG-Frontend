export interface ColumnDefinition {
  name: string;
  label: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'enum';
  description?: string;
  example?: string;
  enumValues?: string[];
}

export interface ImportConfig {
  title: string;
  description: string;
  columns: ColumnDefinition[];
  templateFileName: string;
  importEndpoint: string;
  downloadTemplateEndpoint?: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors?: ImportError[];
  message: string;
}

export interface ImportError {
  line?: number;
  column?: string;
  message: string;
}
