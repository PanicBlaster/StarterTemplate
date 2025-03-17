import { Observable } from 'rxjs';
import { ToolbarAction, Metric } from '../page-toolbar/page-toolbar.types';
import {
  ProcessResult,
  QueryOptions,
  QueryResult,
} from '../common-dto/query.dto';
import { Params } from '@angular/router';
import { ColumnDefinition } from '../item-list/item-list.types';

export type FormFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'password'
  | 'email'
  | 'editor'
  | 'checkbox'
  | 'textarea';

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
  updateMetrics?(params: QueryOptions, items: any): Metric[];

  loadGridItems?(params: QueryOptions): Observable<QueryResult<any>>; // New method for loading grid items
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

  // New grid/table related properties
  gridColumns?: ColumnDefinition[];
  gridHeader?: string;
  gridRowSelect?: (item: any) => void;
  gridRowDelete?: (item: any) => void;
}

export type DisplayMode = 'desktop' | 'mobile';

// Add this function to help determine display mode
export function getDisplayMode(): DisplayMode {
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}
