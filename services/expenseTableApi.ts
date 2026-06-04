import {apiClient, extractApiData} from './apiClient';
import {
  ApiExpenseTable,
  mapApiExpenseTableToExpenseTable,
} from '../types/expense';
import type {ExpenseTable} from '../types/expense';

interface PaginatedTablesResponse {
  items?: ApiExpenseTable[];
  expenseTables?: ApiExpenseTable[];
  tables?: ApiExpenseTable[];
  data?: ApiExpenseTable[];
  results?: ApiExpenseTable[];
  rows?: ApiExpenseTable[];
  list?: ApiExpenseTable[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TableDetailsResponse {
  table?: ApiExpenseTable;
  totalAmount?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TablesListResult {
  items: ExpenseTable[];
  pagination: PaginationMeta;
}

export const expenseTableApi = {
  async create(title: string): Promise<ExpenseTable> {
    const response = await apiClient.post('/expense-tables', {title});
    const data = extractApiData<ApiExpenseTable>(response.data);
    return mapApiExpenseTableToExpenseTable(data);
  },

  async list(page = 1, limit = 10, signal?: AbortSignal): Promise<TablesListResult> {
    const response = await apiClient.get('/expense-tables', {
      params: {page, limit},
      signal,
    });

    // API returns: { success, message, data: { items: [...], pagination: {...} } }
    const payload = extractApiData<PaginatedTablesResponse | ApiExpenseTable[]>(
      response.data,
    );

    const rawItems = Array.isArray(payload)
      ? payload
      : payload.items ??
        payload.expenseTables ??
        payload.tables ??
        payload.data ??
        payload.results ??
        [];

    const rawPagination = Array.isArray(payload)
      ? undefined
      : payload.pagination;

    const pagination: PaginationMeta = {
      page: rawPagination?.page ?? page,
      limit: rawPagination?.limit ?? limit,
      total: rawPagination?.total ?? rawItems.length,
      totalPages: rawPagination?.totalPages ?? 1,
    };

    return {
      items: rawItems.map(mapApiExpenseTableToExpenseTable),
      pagination,
    };
  },

  async getById(tableId: string, query?: string): Promise<ExpenseTable> {
    const response = await apiClient.get(`/expense-tables/${tableId}`, {
      params: query ? { q: query } : undefined,
    });

    const payload = extractApiData<TableDetailsResponse | ApiExpenseTable>(
      response.data,
    );

    const tableData =
      payload && typeof payload === 'object' && 'table' in payload
        ? (payload as TableDetailsResponse).table!
        : (payload as ApiExpenseTable);

    return mapApiExpenseTableToExpenseTable(tableData);
  },

  async update(
    tableId: string,
    payload: {title?: string},
  ): Promise<ExpenseTable> {
    const response = await apiClient.patch(
      `/expense-tables/${tableId}`,
      payload,
    );
    const data = extractApiData<ApiExpenseTable>(response.data);
    return mapApiExpenseTableToExpenseTable(data);
  },

  async remove(tableId: string): Promise<void> {
    await apiClient.delete(`/expense-tables/${tableId}`);
  },

  async search(query: string, page = 1, limit = 10, signal?: AbortSignal): Promise<TablesListResult> {
    const response = await apiClient.get('/expense-tables/search', {
      params: {q: query, page, limit},
      signal,
    });

    const payload = extractApiData<PaginatedTablesResponse | ApiExpenseTable[]>(
      response.data,
    );

    const rawItems = Array.isArray(payload)
      ? payload
      : payload.items ??
        payload.expenseTables ??
        payload.tables ??
        payload.data ??
        payload.results ??
        payload.rows ??
        payload.list ??
        [];

    const rawPagination = Array.isArray(payload)
      ? undefined
      : payload.pagination ?? payload.meta;

    const pagination: PaginationMeta = {
      page: rawPagination?.page ?? page,
      limit: rawPagination?.limit ?? limit,
      total: rawPagination?.total ?? rawItems.length,
      totalPages: rawPagination?.totalPages ?? 1,
    };

    return {
      items: rawItems.map(mapApiExpenseTableToExpenseTable),
      pagination,
    };
  },
};
