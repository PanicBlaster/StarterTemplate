import { Observable } from 'rxjs';
import { ToolbarAction, Metric } from '../page-toolbar/page-toolbar.types';
import { ProcessResult, QueryOptions } from '../../dto/query.dto';

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

export interface ItemDetailDataService<T> {
  loadItem(params: QueryOptions): Observable<T>;
  createItem(item: any): Observable<ProcessResult>;
  updateItem(id: string, item: any): Observable<ProcessResult>;
  deleteItem(id: string): Observable<ProcessResult>;
}

export interface ItemDetailConfig {
  header: string;
  isEditable: boolean;
  supportsAdd: boolean;
  supportsDelete: boolean;
  customToolbarItems?: ToolbarAction[];
  metrics?: Metric[];
  formLayout: FormField[];
  dataService: ItemDetailDataService<any>;
}
