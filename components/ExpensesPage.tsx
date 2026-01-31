import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  BackHandler,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {useAlert} from '../utils/alert';
import {AnimatedView} from './AnimatedView';
import {AnimatedTouchable} from './AnimatedTouchable';
import {Expense, ExpenseTable} from './ExpensesList';

interface ExpensesPageProps {
  onBack: () => void;
  expenseTable?: ExpenseTable;
  onSave: (table: ExpenseTable) => void;
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({
  onBack,
  expenseTable,
  onSave,
}) => {
  const {colors} = useTheme();
  const {showAlert} = useAlert();
  const [title, setTitle] = useState(expenseTable?.title || '');
  const [expenses, setExpenses] = useState<Expense[]>(
    expenseTable?.expenses || [],
  );

  useEffect(() => {
    if (expenseTable) {
      setTitle(expenseTable.title);
      setExpenses(expenseTable.expenses);
    }
  }, [expenseTable]);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const addNewExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: getTodayDate(),
      expense: '',
      amount: '',
    };
    setExpenses([...expenses, newExpense]);
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    const expenseName = expense?.expense || 'this expense';

    showAlert(
      'Delete Expense',
      `Are you sure you want to delete "${expenseName}"`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setExpenses(expenses.filter(exp => exp.id !== id));
          },
        },
      ],
    );
  };

  const updateExpense = (id: string, field: keyof Expense, value: string) => {
    setExpenses(
      expenses.map(exp => (exp.id === id ? {...exp, [field]: value} : exp)),
    );
  };

  const calculateTotal = () => {
    return expenses.reduce((sum, exp) => {
      const amount = parseFloat(exp.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const handleBack = useCallback(() => {
    if (title.trim() || expenses.length > 0) {
      const tableToSave: ExpenseTable = {
        id: expenseTable?.id || Date.now().toString(),
        title: title.trim() || 'Untitled',
        expenses: expenses,
        createdAt: expenseTable?.createdAt || new Date().toISOString(),
      };
      onSave(tableToSave);
    }
    onBack();
  }, [title, expenses, expenseTable, onSave, onBack]);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleBack();
        return true; // Prevent default behavior (closing the app)
      },
    );

    return () => backHandler.remove();
  }, [handleBack]);

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
    titleContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    titleInput: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      backgroundColor: colors.inputBackground,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.surface,
      marginTop: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    totalAmount: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.success,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.headerBackground,
      paddingVertical: 12,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    headerCol1: {
      width: '28%',
      paddingHorizontal: 4,
    },
    headerCol2: {
      width: '32%',
      paddingHorizontal: 4,
    },
    headerCol3: {
      width: '20%',
      paddingHorizontal: 4,
      alignItems: 'flex-end',
    },
    headerCol4: {
      width: '20%',
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    headerText: {
      color: colors.headerText,
      fontWeight: 'bold',
      fontSize: 14,
    },
    headerTextRight: {
      textAlign: 'right',
    },
    scrollView: {
      flex: 1,
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
    row: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 8,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inputCol1: {
      width: '28%',
      padding: 8,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 4,
      backgroundColor: colors.inputBackground,
      marginRight: 4,
    },
    inputCol2: {
      width: '32%',
      padding: 8,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 4,
      backgroundColor: colors.inputBackground,
      marginRight: 4,
    },
    inputCol3: {
      width: '20%',
      padding: 8,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 4,
      backgroundColor: colors.inputBackground,
      marginRight: 8,
      textAlign: 'right',
    },
    deleteButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.danger,
      borderRadius: 16,
      marginLeft: 'auto',
    },
    deleteText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: 'bold',
    },
    addButton: {
      backgroundColor: colors.success,
      paddingVertical: 16,
      marginHorizontal: 16,
      marginVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <AnimatedTouchable
          onPress={handleBack}
          style={dynamicStyles.backButton}>
          <Text style={dynamicStyles.backText}>← Back</Text>
        </AnimatedTouchable>
        <Text style={dynamicStyles.headerTitle}>Expenses</Text>
        <View style={dynamicStyles.headerSpacer} />
      </View>

      <AnimatedView fadeIn duration={200}>
        <View style={dynamicStyles.titleContainer}>
          <TextInput
            style={dynamicStyles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter expense table title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </AnimatedView>

      <AnimatedView fadeIn duration={250}>
        <View style={dynamicStyles.totalContainer}>
          <Text style={dynamicStyles.totalLabel}>Total</Text>
          <Text style={dynamicStyles.totalAmount}>
            ₹{calculateTotal().toFixed(2)}
          </Text>
        </View>
      </AnimatedView>

      <View style={dynamicStyles.tableHeader}>
        <View style={dynamicStyles.headerCol1}>
          <Text style={dynamicStyles.headerText}>Date</Text>
        </View>
        <View style={dynamicStyles.headerCol2}>
          <Text style={dynamicStyles.headerText}>Expense</Text>
        </View>
        <View style={dynamicStyles.headerCol3}>
          <Text style={[dynamicStyles.headerText, dynamicStyles.headerTextRight]}>
            Amount
          </Text>
        </View>
        <View style={dynamicStyles.headerCol4} />
      </View>

      <ScrollView style={dynamicStyles.scrollView}>
        {expenses.length === 0 ? (
          <AnimatedView fadeIn duration={300}>
            <View style={dynamicStyles.emptyContainer}>
              <Text style={dynamicStyles.emptyText}>
                No expenses yet. Tap "+ Add New Expense" to create one.
              </Text>
            </View>
          </AnimatedView>
        ) : (
          expenses.map((expense, index) => (
            <AnimatedView
              key={expense.id}
              fadeIn
              slideIn="left"
              duration={200}
              style={{marginBottom: 1}}>
              <View style={dynamicStyles.row}>
                <TextInput
                  style={dynamicStyles.inputCol1}
                  value={expense.date}
                  onChangeText={value => updateExpense(expense.id, 'date', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  style={dynamicStyles.inputCol2}
                  value={expense.expense}
                  onChangeText={value =>
                    updateExpense(expense.id, 'expense', value)
                  }
                  placeholder="Enter expense"
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  style={dynamicStyles.inputCol3}
                  value={expense.amount}
                  onChangeText={value =>
                    updateExpense(expense.id, 'amount', value)
                  }
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  textAlign="right"
                />
                <AnimatedTouchable
                  style={dynamicStyles.deleteButton}
                  onPress={() => deleteExpense(expense.id)}>
                  <Text style={dynamicStyles.deleteText}>×</Text>
                </AnimatedTouchable>
              </View>
            </AnimatedView>
          ))
        )}
      </ScrollView>

      <AnimatedView fadeIn slideIn="up" duration={400}>
        <AnimatedTouchable
          style={dynamicStyles.addButton}
          onPress={addNewExpense}>
          <Text style={dynamicStyles.addButtonText}>+ Add New Expense</Text>
        </AnimatedTouchable>
      </AnimatedView>
    </View>
  );
};

export default ExpensesPage;
