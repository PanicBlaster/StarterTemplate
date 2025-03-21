export interface QueryResultItem<T> {
  item: T;
  id: string;
}

export interface QueryResult<T> {
  items: QueryResultItem<T>[];
  total: number;
  take: number;
  skip: number;
}

export interface QueryOptions {
  id?: string;
  isNew?: boolean;
  take?: number;
  skip?: number;
  tenantId?: string;
  userId?: string;
  all?: boolean;
  excludeMine?: boolean;
  filter?: string;
}

export interface ProcessResult {
  id: string;
  success: boolean;
  message?: string;
}
