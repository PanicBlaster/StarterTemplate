import { Observable } from 'rxjs';
import { QueryOptions, QueryResult } from '../../dto/query.dto';

export interface SelectDialogColumn {
  field: string;
  header: string;
  type: 'text' | 'date' | 'number' | 'boolean' | 'id';
  format?: string;
  width?: string;
}

export interface SelectDialogDataService<T> {
  loadItems(params: QueryOptions): Observable<QueryResult<T>>;
  selectItems(items: T[]): void;
}

export interface SelectDialogConfig<T> {
  header: string;
  columns: SelectDialogColumn[];
  dataService: SelectDialogDataService<T>;
}
