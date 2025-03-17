import { Observable } from 'rxjs';

export interface DashboardCardData {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: string;
  color?: string;
  link?: string;
  backgroundColor?: string;
  onClick?: () => void;
}

export interface DashboardChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  title: string;
  data: any;
  options?: any;
  height?: string;
}

export interface DashboardTableData {
  title: string;
  columns: {
    field: string;
    header: string;
    type?: 'text' | 'date' | 'number' | 'boolean';
    format?: string;
  }[];
  data: any[];
  showPaginator?: boolean;
  onRowSelect?: (row: any) => void;
}

export interface DashboardItem {
  type: 'card' | 'chart' | 'table';
  colSpan?: number; // Number of grid columns this item should span
  data: DashboardCardData | DashboardChartData | DashboardTableData;
  loadItems?: () => Observable<any>;
}

export interface DashboardConfig {
  header: string;
  subheader?: string;
  customToolbarItems?: {
    label: string;
    icon: string;
    onClick: () => void;
  }[];
  items: DashboardItem[];
  refreshInterval?: number; // In milliseconds
}
