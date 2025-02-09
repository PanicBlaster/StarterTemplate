import { ToolbarAction, Metric } from '../page-toolbar/page-toolbar.types';

export type FormFieldType = 'text' | 'number' | 'date' | 'select';

export interface SelectOption {
  label: string;
  value: any;
}

export interface FormField {
  key: string;
  label: string;
  type: FormFieldType;
  options?: SelectOption[]; // For select fields
  required?: boolean;
  disabled?: boolean;
}

export interface ItemDetailConfig {
  header: string;
  isEditable: boolean;
  supportsAdd: boolean;
  supportsDelete: boolean;
  customToolbarItems?: ToolbarAction[];
  metrics?: Metric[];
  formLayout: FormField[];
}
