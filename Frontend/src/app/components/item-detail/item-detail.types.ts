import { Observable } from 'rxjs';
import { ToolbarAction, Metric } from '../page-toolbar/page-toolbar.types';
import { ProcessResult, QueryOptions } from '../../dto/query.dto';
import { Params } from '@angular/router';

export type FormFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'password'
  | 'email'
  | 'editor';

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
  newOnly?: boolean;
}

export interface ItemDetailDataService<T> {
  parseParams: (params: Params, queryParams: Params) => QueryOptions;
  loadItem(params: QueryOptions): Observable<T>;
  createItem(query: QueryOptions, item: any): Observable<ProcessResult>;
  updateItem(query: QueryOptions, item: any): Observable<ProcessResult>;
  deleteItem(query: QueryOptions): Observable<ProcessResult>;
}

export interface ItemDetailConfig {
  header: string;
  isEditable: boolean;
  supportsAdd: boolean;
  supportsDelete: boolean;
  breadcrumbField?: string;
  customToolbarItems?: ToolbarAction[];
  metrics?: Metric[];
  formLayout: FormField[];
  dataService: ItemDetailDataService<any>;
  updateSuccessMessage: string;
}
