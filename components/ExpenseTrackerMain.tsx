import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../contexts/ThemeContext';
import {useAlert} from '../utils/alert';
import {AnimatedView} from './AnimatedView';
import {AnimatedTouchable} from './AnimatedTouchable';
import ExpensesPage from './ExpensesPage';
import ExpensesList, {ExpenseTable} from './ExpensesList';

const STORAGE_KEY = '@expense_tables';

const ExpenseTrackerMain: React.FC = () => {
  const {colors} = useTheme();
  const {showAlert} = useAlert();
  const [expenseTables, setExpenseTables] = useState<ExpenseTable[]>([]);
  const [currentView, setCurrentView] = useState<
    'home' | 'list' | 'expenses'
  >('home');
  const [previousView, setPreviousView] = useState<
    'home' | 'list' | 'expenses'
  >('home');
  const [currentTable, setCurrentTable] = useState<ExpenseTable | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data to storage whenever expenseTables changes
  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [expenseTables, isLoading]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data !== null) {
        const parsedData = JSON.parse(data);
        // Validate that parsedData is an array
        if (Array.isArray(parsedData)) {
          setExpenseTables(parsedData);
        } else {
          // If data is corrupted, clear it and start fresh
          await AsyncStorage.removeItem(STORAGE_KEY);
          setExpenseTables([]);
        }
      } else {
        // No data found, start with empty array
        setExpenseTables([]);
      }
    } catch (error) {
      // If there's any error (data cleared, corrupted, etc.), start fresh
      console.error('Error loading data:', error);
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } catch (clearError) {
        // Ignore clear errors
      }
      setExpenseTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenseTables));
    } catch (error) {
      // If save fails (e.g., storage full, permission denied), log but don't crash
      console.error('Error saving data:', error);
      // App continues to work even if save fails
    }
  };

  const handleCreateNew = () => {
    setPreviousView(currentView);
    setCurrentTable(undefined);
    setCurrentView('expenses');
  };

  const handleViewExisting = () => {
    setCurrentView('list');
  };

  const handleSelectTable = (table: ExpenseTable) => {
    setPreviousView(currentView);
    setCurrentTable(table);
    setCurrentView('expenses');
  };

  const handleSaveTable = (table: ExpenseTable) => {
    const existingIndex = expenseTables.findIndex(t => t.id === table.id);
    if (existingIndex >= 0) {
      const updated = [...expenseTables];
      updated[existingIndex] = table;
      setExpenseTables(updated);
    } else {
      setExpenseTables([...expenseTables, table]);
    }
  };

  const handleDeleteTable = (id: string) => {
    const table = expenseTables.find(t => t.id === id);
    const tableName = table?.title || 'this expense table';
    
    showAlert(
      'Delete Expense Table',
      `Are you sure you want to delete "${tableName}"`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setExpenseTables(expenseTables.filter(t => t.id !== id));
          },
        },
      ]
    );
  };

  if (currentView === 'expenses') {
    return (
      <AnimatedView fadeIn slideIn="right" duration={250} style={{flex: 1}}>
        <ExpensesPage
          onBack={() => setCurrentView(previousView)}
          expenseTable={currentTable}
          onSave={handleSaveTable}
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
          onBack={() => setCurrentView('home')}
          onDeleteTable={handleDeleteTable}
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
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 40,
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
            <Text style={dynamicStyles.buttonText}>
              📋 View Existing Expenses
            </Text>
          </AnimatedTouchable>
        </AnimatedView>
      </View>
    </AnimatedView>
  );
};

export default ExpenseTrackerMain;
