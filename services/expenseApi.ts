import {apiClient, extractApiData} from './apiClient';
import {
  ApiExpense,
  ApiExpenseTable,
  Expense,
  mapApiExpenseToExpense,
  mapExpenseToApiExpensePayload,
} from '../types/expense';

export const expenseApi = {
  async create(tableId: string, payload: Expense): Promise<Expense> {
    const response = await apiClient.post(
      `/expense-tables/${tableId}/expenses`,
      mapExpenseToApiExpensePayload(payload),
    );

    const raw = extractApiData<ApiExpenseTable | ApiExpense>(response.data);

    // Backend may return the full table (old shape) or a bare expense (new shape)
    if ('expenses' in raw && Array.isArray((raw as ApiExpenseTable).expenses)) {
      const expenses = (raw as ApiExpenseTable).expenses ?? [];
      const created = expenses[expenses.length - 1];
      if (!created) {
        throw new Error('create expense: no expense returned in response');
      }
      return mapApiExpenseToExpense(created);
    }

    return mapApiExpenseToExpense(raw as ApiExpense);
  },

  async update(
    tableId: string,
    expenseId: string,
    payload: Partial<Expense>,
  ): Promise<Expense> {
    const body: Partial<{date: string; expense: string; amount: number}> = {};
    if (payload.date !== undefined) {
      body.date = payload.date;
    }
    if (payload.expense !== undefined) {
      body.expense = payload.expense;
    }
    if (payload.amount !== undefined) {
      body.amount = Number.parseFloat(payload.amount) || 0;
    }

    const response = await apiClient.patch(
      `/expense-tables/${tableId}/expenses/${expenseId}`,
      body,
    );

    // The API may return the full updated table OR a bare expense object.
    // Shape A (full table): { _id, title, expenses: [...] }
    // Shape B (bare expense): { _id, date, expense, amount }
    const raw = extractApiData<ApiExpenseTable | ApiExpense>(response.data);

    if ('expenses' in raw && Array.isArray((raw as ApiExpenseTable).expenses)) {
      // Shape A – embedded table returned; find the updated expense by id
      const expenses = (raw as ApiExpenseTable).expenses ?? [];
      const updated = expenses.find(
        exp => (exp._id ?? exp.id) === expenseId,
      );
      if (!updated) {
        throw new Error('update expense: could not find expense in response');
      }
      return mapApiExpenseToExpense(updated);
    }

    // Shape B – bare expense returned directly
    return mapApiExpenseToExpense(raw as ApiExpense);
  },

  async remove(tableId: string, expenseId: string): Promise<void> {
    await apiClient.delete(
      `/expense-tables/${tableId}/expenses/${expenseId}`,
    );
  },
};
