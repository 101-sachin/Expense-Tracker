export interface Expense {
  id: string;
  date: string;
  expense: string;
  amount: string;
}

export interface ExpenseTable {
  id: string;
  title: string;
  expenses: Expense[];
  createdAt: string;
  expenseCount?: number;
  totalAmount?: number;
}

export interface ApiExpense {
  id?: string;
  _id?: string;
  date: string;
  expense: string;
  amount: number;
}

export interface ApiExpenseTable {
  id?: string;
  _id?: string;
  title: string;
  expenses?: ApiExpense[];
  createdAt: string;
  expenseCount?: number;
  totalAmount?: number;
}

export const mapApiExpenseToExpense = (expense: ApiExpense): Expense => ({
  id: expense.id ?? expense._id ?? '',
  date: expense.date,
  expense: expense.expense,
  amount: expense.amount.toFixed(2),
});

export const mapExpenseToApiExpensePayload = (expense: Expense) => ({
  date: expense.date,
  expense: expense.expense,
  amount: Number.parseFloat(expense.amount) || 0,
});

export const mapApiExpenseTableToExpenseTable = (
  table: ApiExpenseTable,
): ExpenseTable => ({
  id: table.id ?? table._id ?? '',
  title: table.title,
  createdAt: table.createdAt,
  expenses: (table.expenses ?? []).map(mapApiExpenseToExpense),
  expenseCount: table.expenseCount,
  totalAmount: table.totalAmount,
});
