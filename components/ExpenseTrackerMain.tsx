import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Loader from './Loader';
import {useTheme} from '../contexts/ThemeContext';
import {useAlert} from '../utils/alert';
import {fonts} from '../utils/fonts';
import {AnimatedView} from './AnimatedView';
import {AnimatedTouchable} from './AnimatedTouchable';
import ExpensesPage from './ExpensesPage';
import ExpensesList from './ExpensesList';
import {expenseTableApi} from '../services/expenseTableApi';
import {expenseApi} from '../services/expenseApi';
import type {Expense, ExpenseTable} from '../types/expense';

const ExpenseTrackerMain: React.FC = () => {
  const {colors} = useTheme();
  const {showAlert} = useAlert();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [expenseTables, setExpenseTables] = useState<ExpenseTable[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'list' | 'expenses'>(
    'home',
  );
  const [previousView, setPreviousView] = useState<
    'home' | 'list' | 'expenses'
  >('home');
  const [currentTable, setCurrentTable] = useState<ExpenseTable | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 5;

  const loadTables = async (page: number = 1, query: string = '') => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let result;
      if (query.trim()) {
        result = await expenseTableApi.search(query.trim(), page, PAGE_LIMIT, controller.signal);
      } else {
        result = await expenseTableApi.list(page, PAGE_LIMIT, controller.signal);
      }
      
      if (abortControllerRef.current === controller) {
        setExpenseTables(result.items);
        setCurrentPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        setIsLoading(false);
      }
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.message === 'canceled') {
        return;
      }
      if (abortControllerRef.current === controller) {
        setExpenseTables([]);
        const msg = query.trim()
          ? `Failed to search for "${query}". Please try again.`
          : 'Failed to load expense tables from server.';
        showAlert('Error', msg);
        if (__DEV__) {
          console.error('[loadTables] error:', error);
          if (error && typeof error === 'object' && 'response' in error) {
            console.error('[loadTables] response status:', (error as any).response?.status);
            console.error('[loadTables] response data:', JSON.stringify((error as any).response?.data, null, 2));
          }
        }
        setIsLoading(false);
      }
    }
  };

  const syncExpenses = async (
    tableId: string,
    previousExpenses: Expense[],
    nextExpenses: Expense[],
  ) => {
    const previousMap = new Map(previousExpenses.map(exp => [exp.id, exp]));
    const nextMap = new Map(nextExpenses.map(exp => [exp.id, exp]));

    for (const exp of nextExpenses) {
      const existing = previousMap.get(exp.id);
      if (!existing) {
        await expenseApi.create(tableId, exp);
        continue;
      }

      const hasChanged =
        existing.date !== exp.date ||
        existing.expense !== exp.expense ||
        existing.amount !== exp.amount;

      if (hasChanged) {
        await expenseApi.update(tableId, exp.id, {
          date: exp.date,
          expense: exp.expense,
          amount: exp.amount,
        });
      }
    }

    for (const exp of previousExpenses) {
      if (!nextMap.has(exp.id)) {
        await expenseApi.remove(tableId, exp.id);
      }
    }
  };

  const handleCreateNew = () => {
    setPreviousView(currentView);
    setCurrentTable(undefined);
    setCurrentView('expenses');
  };

  const handleViewExisting = () => {
    setIsLoading(true);
    setCurrentPage(1);
    setSearchQuery('');
    setExpenseTables([]);
    setCurrentView('list');
    loadTables(1, '');
  };

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    loadTables(page, searchQuery);
  };

  const handleSelectTable = (table: ExpenseTable) => {
    const selectTable = async () => {
      setPreviousView(currentView);
      setCurrentView('expenses');
      setIsLoading(true);

      try {
        const fullTable = await expenseTableApi.getById(table.id);
        setCurrentTable(fullTable);
      } catch (error) {
        setCurrentTable(table);
        showAlert('Error', 'Could not load full table details.');
      } finally {
        setIsLoading(false);
      }
    };

    selectTable();
  };

  const handleSaveTable = async (table: ExpenseTable) => {
    if (isSyncing) {
      return;
    }

    const previousTables = [...expenseTables];
    const existingIndex = expenseTables.findIndex(t => t.id === table.id);
    const previousTable = existingIndex >= 0 ? expenseTables[existingIndex] : undefined;

    if (existingIndex >= 0) {
      const updated = [...expenseTables];
      updated[existingIndex] = table;
      setExpenseTables(updated);
    } else {
      setExpenseTables([...expenseTables, table]);
    }

    setIsSyncing(true);

    try {
      let tableId = table.id;

      if (!previousTable) {
        const created = await expenseTableApi.create(table.title);
        tableId = created.id;
        await syncExpenses(tableId, [], table.expenses);
      } else {
        await expenseTableApi.update(tableId, {title: table.title});
        await syncExpenses(tableId, currentTable?.expenses || [], table.expenses);
      }

      const refreshedTable = await expenseTableApi.getById(tableId);
      setCurrentTable(refreshedTable);
      setExpenseTables(current =>
        current.some(t => t.id === table.id)
          ? current.map(t => (t.id === table.id ? refreshedTable : t))
          : [...current, refreshedTable],
      );
    } catch (error) {
      setExpenseTables(previousTables);
      setCurrentTable(previousTable);
      showAlert('Error', 'Failed to save expense table.');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteTable = (id: string) => {
    if (isSyncing) {
      return;
    }

    const table = expenseTables.find(t => t.id === id);
    const tableName = table?.title || 'this expense table';

    showAlert('Delete Expense Table', `Are you sure you want to delete "${tableName}"`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const previousTables = [...expenseTables];
          const remainingOnPage = previousTables.filter(t => t.id !== id).length;
          setExpenseTables(previousTables.filter(t => t.id !== id));
          setIsSyncing(true);

          try {
            await expenseTableApi.remove(id);
            // If this was the last item on a non-first page, step back
            const targetPage =
              remainingOnPage === 0 && currentPage > 1
                ? currentPage - 1
                : currentPage;
            setIsLoading(true);
            await loadTables(targetPage, searchQuery);
          } catch (error) {
            setExpenseTables(previousTables);
            showAlert('Error', 'Failed to delete expense table.');
          } finally {
            setIsSyncing(false);
          }
        },
      },
    ]);
  };

  if (currentView === 'expenses') {
    return (
      <AnimatedView fadeIn slideIn="right" duration={250} style={{flex: 1}}>
        <ExpensesPage
          onBack={() => setCurrentView(previousView)}
          expenseTable={currentTable}
          onSave={handleSaveTable}
          isSyncing={isSyncing}
          isLoading={isLoading}
          onSearchExpenses={async (query) => {
            if (currentTable) {
              setIsLoading(true);
              try {
                const searchedTable = await expenseTableApi.getById(currentTable.id, query);
                setCurrentTable(searchedTable);
              } catch (error) {
                showAlert('Error', 'Failed to search expenses.');
              } finally {
                setIsLoading(false);
              }
            }
          }}
        />
      </AnimatedView>
    );
  }

  if (currentView === 'list') {
    return (
      <AnimatedView fadeIn slideIn="right" duration={250} style={{flex: 1}}>
        <ExpensesList
          expenseTables={expenseTables}
          onSelectTable={handleSelectTable}
          onCreateNew={handleCreateNew}
          onBack={() => {
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
              abortControllerRef.current = null;
            }
            setIsLoading(false);
            setCurrentView('home');
          }}
          onDeleteTable={handleDeleteTable}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          searchQuery={searchQuery}
          onSearch={(query) => {
            setSearchQuery(query);
            setIsLoading(true);
            setCurrentPage(1);
            loadTables(1, query);
          }}
        />
      </AnimatedView>
    );
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 30,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
      fontFamily: fonts.bold,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
      fontFamily: fonts.regular,
      letterSpacing: 0.2,
    },
    createButton: {
      backgroundColor: colors.success,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 8,
      shadowColor: colors.shadowColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    viewButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 8,
      marginTop: 16,
      shadowColor: colors.shadowColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: fonts.semiBold,
      letterSpacing: 0.5,
    },
  });

  return (
    <AnimatedView fadeIn duration={300} style={{flex: 1}}>
      <View style={dynamicStyles.container}>
        <AnimatedView fadeIn duration={400}>
          <Text style={dynamicStyles.title}>Expense Tracker</Text>
        </AnimatedView>
        <AnimatedView fadeIn duration={500}>
          <Text style={dynamicStyles.subtitle}>Track your expenses easily</Text>
        </AnimatedView>
        {isSyncing && (
          <Loader 
            style={{marginTop: 16}}
            message="Syncing changes..." 
            size="small"
          />
        )}

        <AnimatedView fadeIn slideIn="up" duration={600}>
          <AnimatedTouchable
            style={dynamicStyles.createButton}
            onPress={handleCreateNew}>
            <Text style={dynamicStyles.buttonText}>+ Create New Expenses</Text>
          </AnimatedTouchable>
        </AnimatedView>

        <AnimatedView fadeIn slideIn="up" duration={700}>
          <AnimatedTouchable
            style={dynamicStyles.viewButton}
            onPress={handleViewExisting}>
            <Text style={dynamicStyles.buttonText}>📋 View Existing Expenses</Text>
          </AnimatedTouchable>
        </AnimatedView>
      </View>
    </AnimatedView>
  );
};

export default ExpenseTrackerMain;
