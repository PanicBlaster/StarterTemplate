import { Observable } from 'rxjs';
import { QueryOptions } from '../common-dto/query.dto';
import { MediaDto } from '../../dto/media.dto';
import { Params } from '@angular/router';
import { Metric, ToolbarAction } from '../page-toolbar/page-toolbar.types';

export interface MediaDetailDataService {
  loadItem(params: QueryOptions): Observable<MediaDto>;
  parseParams: (params: Params, queryParams: Params) => QueryOptions;
  updateMetrics?(params: QueryOptions, items: any): Metric[];
}

export interface MediaDetailConfig {
  header: string;
  dataService: MediaDetailDataService;
  customToolbarItems?: ToolbarAction[];
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  showThumbnail?: boolean;
  metrics?: Metric[];
}
