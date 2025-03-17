import { Observable } from 'rxjs';
import { Params } from '@angular/router';
import { QueryOptions, QueryResult } from '../common-dto/query.dto';
import { MediaDto } from '../../dto/media.dto';
import { Metric, ToolbarAction } from '../page-toolbar/page-toolbar.types';

export interface MediaListDataService {
  parseParams: (params: Params, queryParams: Params) => QueryOptions;
  loadItems(params: QueryOptions): Observable<QueryResult<MediaDto>>;
  updateHeader?(params: QueryOptions, items: any[], total: number): string;
  updateMetrics?(params: QueryOptions, items: any[], total: number): Metric[];
}

export interface MediaListConfig {
  header: string;
  customToolbarItems?: ToolbarAction[];
  metrics?: Metric[];
  dataService: MediaListDataService;
  onSelect?: (item: MediaDto) => void;
  maxColumns?: number; // For responsive design
  openContent?: (item: MediaDto, event: Event) => void;
  enableSearch?: boolean;
}
