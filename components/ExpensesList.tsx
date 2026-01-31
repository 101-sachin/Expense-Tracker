import React, {useEffect} from 'react';
import {View, Text, ScrollView, StyleSheet, BackHandler} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {AnimatedView} from './AnimatedView';
import {AnimatedTouchable} from './AnimatedTouchable';

export interface ExpenseTable {
  id: string;
  title: string;
  expenses: Expense[];
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string;
  expense: string;
  amount: string;
}

interface ExpensesListProps {
  expenseTables: ExpenseTable[];
  onSelectTable: (table: ExpenseTable) => void;
  onCreateNew: () => void;
  onBack: () => void;
  onDeleteTable: (id: string) => void;
}

const ExpensesList: React.FC<ExpensesListProps> = ({
  expenseTables,
  onSelectTable,
  onCreateNew,
  onBack,
  onDeleteTable,
}) => {
  const {colors} = useTheme();

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onBack();
        return true; // Prevent default behavior (closing the app)
      },
    );

    return () => backHandler.remove();
  }, [onBack]);

  const calculateTotal = (expenses: Expense[]) => {
    return expenses.reduce((sum, exp) => {
      const amount = parseFloat(exp.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 8,
    },
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerSpacer: {
      width: 60,
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tableCard: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadowColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    tableContent: {
      flex: 1,
    },
    tableTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    tableInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tableCount: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    tableTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.success,
    },
    deleteButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.danger,
      borderRadius: 16,
      marginLeft: 12,
    },
    deleteText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    createButton: {
      backgroundColor: colors.success,
      paddingVertical: 16,
      marginHorizontal: 16,
      marginVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <AnimatedTouchable
          onPress={onBack}
          style={dynamicStyles.backButton}>
          <Text style={dynamicStyles.backText}>← Back</Text>
        </AnimatedTouchable>
        <Text style={dynamicStyles.headerTitle}>My Expense Tables</Text>
        <View style={dynamicStyles.headerSpacer} />
      </View>

      <ScrollView style={dynamicStyles.scrollView}>
        {expenseTables.length === 0 ? (
          <AnimatedView fadeIn duration={300}>
            <View style={dynamicStyles.emptyContainer}>
              <Text style={dynamicStyles.emptyText}>
                No expense tables yet.{'\n'}Create your first one!
              </Text>
            </View>
          </AnimatedView>
        ) : (
          expenseTables.map((table, index) => {
            const total = calculateTotal(table.expenses);
            const expenseCount = table.expenses.length;
            return (
              <AnimatedView
                key={table.id}
                fadeIn
                slideIn="left"
                duration={200}
                style={{marginBottom: 12}}>
                <View style={dynamicStyles.tableCard}>
                  <AnimatedTouchable
                    style={{flex: 1}}
                    onPress={() => onSelectTable(table)}>
                    <View style={dynamicStyles.tableContent}>
                      <Text style={dynamicStyles.tableTitle}>
                        {table.title}
                      </Text>
                      <View style={dynamicStyles.tableInfo}>
                        <Text style={dynamicStyles.tableCount}>
                          {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
                        </Text>
                        <Text style={dynamicStyles.tableTotal}>
                          ₹{total.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </AnimatedTouchable>
                  <AnimatedTouchable
                    style={dynamicStyles.deleteButton}
                    onPress={() => onDeleteTable(table.id)}>
                    <Text style={dynamicStyles.deleteText}>×</Text>
                  </AnimatedTouchable>
                </View>
              </AnimatedView>
            );
          })
        )}
      </ScrollView>

      <AnimatedView fadeIn slideIn="up" duration={400}>
        <AnimatedTouchable
          style={dynamicStyles.createButton}
          onPress={onCreateNew}>
          <Text style={dynamicStyles.createButtonText}>
            + Create New Expense Table
          </Text>
        </AnimatedTouchable>
      </AnimatedView>
    </View>
  );
};

export default ExpensesList;
