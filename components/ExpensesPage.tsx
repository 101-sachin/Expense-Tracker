import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  BackHandler,
  Animated,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {useAlert} from '../utils/alert';
import {fonts} from '../utils/fonts';
import {AnimatedView} from './AnimatedView';
import {AnimatedTouchable} from './AnimatedTouchable';
import Loader from './Loader';
import type {Expense, ExpenseTable} from '../types/expense';

interface ExpensesPageProps {
  onBack: () => void;
  expenseTable?: ExpenseTable;
  onSave: (table: ExpenseTable) => Promise<void>;
  isSyncing?: boolean;
  isLoading?: boolean;
  onSearchExpenses?: (query: string) => void;
}

// ─── Skeleton pulse hook ──────────────────────────────────────────────────────
const useSkeletonPulse = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 1, duration: 700, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 0.4, duration: 700, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return opacity;
};

// ─── Component ────────────────────────────────────────────────────────────────
const SKELETON_ROW_COUNT = 4;

const ExpensesPage: React.FC<ExpensesPageProps> = ({
  onBack,
  expenseTable,
  onSave,
  isSyncing = false,
  isLoading = false,
  onSearchExpenses,
}) => {
  const {colors, isDark} = useTheme();
  const {showAlert} = useAlert();
  const skeletonPulse = useSkeletonPulse();

  const skeletonBase = isDark ? '#374151' : '#E5E7EB';
  const skeletonCardBg = isDark ? '#1F2937' : '#FFFFFF';

  const [title, setTitle] = useState(expenseTable?.title || '');
  const [expenses, setExpenses] = useState<Expense[]>(
    expenseTable?.expenses || [],
  );
  const [isSaved, setIsSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    if (localSearch === searchQuery) return;
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
      onSearchExpenses?.(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchExpenses]);

  useEffect(() => {
    if (expenseTable) {
      setTitle(expenseTable.title);
      setExpenses(expenseTable.expenses);
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [expenseTable]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const validateDate = (dateString: string): string => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateString.trim() === '' || !dateRegex.test(dateString.trim())) {
      return getTodayDate();
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return getTodayDate();
    return dateString.trim();
  };

  const validateAmount = (amountString: string): string => {
    const cleaned = amountString.replace(/[^\d.-]/g, '');
    if (cleaned.trim() === '' || isNaN(parseFloat(cleaned))) return '0.00';
    const numAmount = Math.abs(parseFloat(cleaned));
    return Math.min(numAmount, 999999999.99).toFixed(2);
  };

  const truncateText = (text: string, maxLength: number): string =>
    text.length > maxLength ? text.substring(0, maxLength) : text;

  const prepareTableForSave = (): ExpenseTable => {
    const cleanedExpenses = expenses.map(exp => ({
      ...exp,
      amount: validateAmount(exp.amount),
      date: validateDate(exp.date),
      expense: truncateText(exp.expense.trim(), 200),
    }));
    return {
      id: expenseTable?.id || Date.now().toString(),
      title: truncateText(title.trim(), 100) || 'Untitled',
      expenses: cleanedExpenses,
      createdAt: expenseTable?.createdAt || new Date().toISOString(),
    };
  };

  const addNewExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: getTodayDate(),
      expense: '',
      amount: '',
    };
    setExpenses([...expenses, newExpense]);
    setIsSaved(false);
  };

  const deleteExpense = (id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    showAlert('Delete Expense', `Are you sure you want to delete "${expense?.expense || 'this expense'}"`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setExpenses(expenses.filter(exp => exp.id !== id));
          setIsSaved(false);
        },
      },
    ]);
  };

  const updateExpense = (id: string, field: keyof Expense, value: string) => {
    setExpenses(expenses.map(exp => (exp.id === id ? {...exp, [field]: value} : exp)));
    setIsSaved(false);
  };

  const calculateTotal = () =>
    expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      showAlert('Title Required', 'Please enter a title for the expenses before saving.', [
        {text: 'OK', style: 'default'},
      ]);
      return;
    }
    try {
      await onSave(prepareTableForSave());
      setIsSaved(true);
      showAlert('Success', 'Expenses saved successfully!', [{text: 'OK', style: 'default'}]);
    } catch (_) {
      // Main container handles rollback + alert
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, expenses, expenseTable, onSave, showAlert]);

  const handleBack = useCallback(() => onBack(), [onBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => backHandler.remove();
  }, [handleBack]);

  // ─── Dynamic styles ───────────────────────────────────────────────────────
  const dynamicStyles = StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
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
    backButton: {padding: 8, paddingVertical: 8, justifyContent: 'center', alignItems: 'center'},
    backText: {
      fontSize: 16, color: colors.primary, fontWeight: '600',
      lineHeight: 18, textAlign: 'center', fontFamily: fonts.semiBold, letterSpacing: 0.2,
    },
    headerTitle: {
      fontSize: 20, fontWeight: 'bold', color: colors.text,
      fontFamily: fonts.bold, letterSpacing: 0.3,
    },
    saveButton: {
      padding: 8, paddingHorizontal: 12, justifyContent: 'center',
      alignItems: 'center', backgroundColor: colors.primary, borderRadius: 6,
    },
    saveButtonText: {
      fontSize: 14, color: '#FFFFFF', fontWeight: '600',
      fontFamily: fonts.semiBold, letterSpacing: 0.3,
    },
    titleContainer: {
      paddingHorizontal: 16, paddingVertical: 12,
      backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    titleInput: {
      fontSize: 16, fontWeight: '600', color: colors.text,
      padding: 12, borderWidth: 1, borderColor: colors.inputBorder,
      borderRadius: 8, backgroundColor: colors.inputBackground,
      fontFamily: fonts.medium, letterSpacing: 0.2,
    },
    totalContainer: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.surface,
      marginTop: 8, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    totalLabel: {
      fontSize: 18, fontWeight: '600', color: colors.text,
      fontFamily: fonts.semiBold, letterSpacing: 0.2,
    },
    totalAmount: {
      fontSize: 20, fontWeight: 'bold', color: colors.success,
      fontFamily: fonts.bold, letterSpacing: 0.3,
    },
    tableHeader: {
      flexDirection: 'row', backgroundColor: colors.headerBackground,
      paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center',
    },
    headerCol1: {width: '28%', paddingHorizontal: 4},
    headerCol2: {width: '32%', paddingHorizontal: 4},
    headerCol3: {width: '20%', paddingHorizontal: 4, alignItems: 'flex-end'},
    headerCol4: {width: '20%', alignItems: 'flex-end', justifyContent: 'center'},
    headerText: {
      color: colors.headerText, fontWeight: 'bold', fontSize: 14,
      fontFamily: fonts.semiBold, letterSpacing: 0.3,
    },
    headerTextRight: {textAlign: 'right'},
    scrollView: {flex: 1},
    emptyContainer: {padding: 40, alignItems: 'center', justifyContent: 'center'},
    emptyText: {
      fontSize: 16, color: colors.textSecondary, textAlign: 'center',
      fontFamily: fonts.regular, letterSpacing: 0.2,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInput: {
      flex: 1,
      backgroundColor: colors.inputBackground || (isDark ? '#374151' : '#F3F4F6'),
      color: colors.text,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      fontFamily: fonts.regular,
      borderWidth: 1,
      borderColor: colors.inputBorder || colors.border,
    },
    clearButton: {
      position: 'absolute',
      right: 10,
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    clearIconText: {
      color: colors.textSecondary,
      fontSize: 22,
      fontWeight: '300',
      lineHeight: 22,
    },
    row: {
      flexDirection: 'row', backgroundColor: colors.surface,
      borderBottomWidth: 1, borderBottomColor: colors.border,
      paddingVertical: 8, paddingHorizontal: 8,
      alignItems: 'center', justifyContent: 'space-between',
    },
    inputCol1: {
      width: '28%', padding: 8, fontSize: 14, color: colors.text,
      borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 4,
      backgroundColor: colors.inputBackground, marginRight: 4, fontFamily: fonts.regular,
    },
    inputCol2: {
      width: '32%', padding: 8, fontSize: 14, color: colors.text,
      borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 4,
      backgroundColor: colors.inputBackground, marginRight: 4, fontFamily: fonts.regular,
    },
    inputCol3: {
      width: '20%', padding: 8, fontSize: 14, color: colors.text,
      borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 4,
      backgroundColor: colors.inputBackground, marginRight: 8, textAlign: 'right',
      fontFamily: fonts.regular,
    },
    deleteButton: {
      width: 32, height: 32, justifyContent: 'center', alignItems: 'center',
      backgroundColor: colors.danger, borderRadius: 16, marginLeft: 16,
    },
    deleteText: {color: '#FFFFFF', fontSize: 20, fontWeight: 'bold'},
    addButton: {
      backgroundColor: colors.success, paddingVertical: 16,
      marginHorizontal: 16, marginVertical: 16, borderRadius: 8, alignItems: 'center',
    },
    addButtonText: {
      color: '#FFFFFF', fontSize: 16, fontWeight: 'bold',
      fontFamily: fonts.semiBold, letterSpacing: 0.5,
    },
  });

  // ─── Skeleton helpers ─────────────────────────────────────────────────────
  const skBar = (w: number | string, h: number, extra?: object) => (
    <View
      style={{
        width: w as any,
        height: h,
        borderRadius: 6,
        backgroundColor: skeletonBase,
        ...(extra ?? {}),
      }}
    />
  );

  // ─── Skeleton UI ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={dynamicStyles.container}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <AnimatedTouchable onPress={handleBack} style={dynamicStyles.backButton}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={dynamicStyles.backText}>←</Text>
              <Text style={[dynamicStyles.backText, {marginLeft: 4}]}>back</Text>
            </View>
          </AnimatedTouchable>
          <Text style={dynamicStyles.headerTitle}>Expenses</Text>
          {/* Save button skeleton */}
          <Animated.View
            style={{
              width: 54, height: 34, borderRadius: 6,
              backgroundColor: skeletonBase, opacity: skeletonPulse,
            }}
          />
        </View>

        {/* Title input skeleton */}
        <Animated.View
          style={{
            paddingHorizontal: 16, paddingVertical: 12,
            backgroundColor: colors.surface,
            borderBottomWidth: 1, borderBottomColor: colors.border,
            opacity: skeletonPulse,
          }}>
          {skBar('80%', 40)}
        </Animated.View>

        {/* Total area skeleton */}
        <Animated.View
          style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: 16, paddingVertical: 16,
            backgroundColor: colors.surface, marginTop: 8,
            borderBottomWidth: 1, borderBottomColor: colors.border,
            opacity: skeletonPulse,
          }}>
          {skBar('25%', 20)}
          {skBar('32%', 22)}
        </Animated.View>

        {/* Table column headers — keep real headers for layout context */}
        <View style={dynamicStyles.tableHeader}>
          <View style={dynamicStyles.headerCol1}>
            <Text style={dynamicStyles.headerText}>Date</Text>
          </View>
          <View style={dynamicStyles.headerCol2}>
            <Text style={dynamicStyles.headerText}>Expense</Text>
          </View>
          <View style={dynamicStyles.headerCol3}>
            <Text style={[dynamicStyles.headerText, dynamicStyles.headerTextRight]}>Amount</Text>
          </View>
          <View style={dynamicStyles.headerCol4} />
        </View>

        {/* Skeleton expense rows */}
        <ScrollView style={dynamicStyles.scrollView}>
          {Array.from({length: SKELETON_ROW_COUNT}).map((_, i) => (
            <Animated.View
              // eslint-disable-next-line react/no-array-index-key
              key={`sk-row-${i}`}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 10, paddingHorizontal: 8,
                backgroundColor: skeletonCardBg,
                borderBottomWidth: 1, borderBottomColor: colors.border,
                opacity: skeletonPulse,
              }}>
              {skBar('27%', 36, {borderRadius: 4, marginRight: 4})}
              {skBar('31%', 36, {borderRadius: 4, marginRight: 4})}
              {skBar('19%', 36, {borderRadius: 4, marginRight: 8})}
              <View
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: skeletonBase,
                }}
              />
            </Animated.View>
          ))}
        </ScrollView>

        {/* Add button skeleton */}
        <Animated.View
          style={{
            marginHorizontal: 16, marginVertical: 16,
            height: 52, borderRadius: 8,
            backgroundColor: skeletonBase, opacity: skeletonPulse,
          }}
        />
      </View>
    );
  }

  // ─── Normal UI ────────────────────────────────────────────────────────────
  return (
    <View style={dynamicStyles.container}>
      {isSyncing && (
        <Loader fullScreen message="Saving expenses..." color="#FFFFFF" />
      )}
      <View style={dynamicStyles.header}>
        <AnimatedTouchable onPress={handleBack} style={dynamicStyles.backButton}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={dynamicStyles.backText}>←</Text>
            <Text style={[dynamicStyles.backText, {marginLeft: 4}]}>back</Text>
          </View>
        </AnimatedTouchable>
        <Text style={dynamicStyles.headerTitle}>Expenses</Text>
        <AnimatedTouchable
          onPress={() => void handleSave()}
          disabled={isSyncing}
          style={dynamicStyles.saveButton}>
          {isSyncing ? (
            <Loader minimal size="small" color="#FFFFFF" message="Saving..." style={{padding: 0}} />
          ) : (
            <Text style={dynamicStyles.saveButtonText}>Save</Text>
          )}
        </AnimatedTouchable>
      </View>

      <AnimatedView fadeIn duration={200}>
        <View style={dynamicStyles.titleContainer}>
          <TextInput
            style={dynamicStyles.titleInput}
            value={title}
            onChangeText={text => {setTitle(text); setIsSaved(false);}}
            placeholder="Enter expenses title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </AnimatedView>

      <AnimatedView fadeIn duration={250}>
        <View style={dynamicStyles.totalContainer}>
          <Text style={dynamicStyles.totalLabel}>Total</Text>
          <Text style={dynamicStyles.totalAmount}>₹{calculateTotal().toFixed(2)}</Text>
        </View>
      </AnimatedView>

      <View style={dynamicStyles.searchContainer}>
        <View style={dynamicStyles.searchInputContainer}>
          <TextInput
            style={[dynamicStyles.searchInput, localSearch ? { paddingRight: 36 } : {}]}
            placeholder="Search expenses..."
            placeholderTextColor={colors.textSecondary}
            value={localSearch}
            onChangeText={setLocalSearch}
          />
        </View>
      </View>

      <View style={dynamicStyles.tableHeader}>
        <View style={dynamicStyles.headerCol1}>
          <Text style={dynamicStyles.headerText}>Date</Text>
        </View>
        <View style={dynamicStyles.headerCol2}>
          <Text style={dynamicStyles.headerText}>Expense</Text>
        </View>
        <View style={dynamicStyles.headerCol3}>
          <Text style={[dynamicStyles.headerText, dynamicStyles.headerTextRight]}>Amount</Text>
        </View>
        <View style={dynamicStyles.headerCol4} />
      </View>

      <ScrollView style={dynamicStyles.scrollView}>
        {expenses.length === 0 ? (
          <AnimatedView fadeIn duration={300}>
            <View style={dynamicStyles.emptyContainer}>
              <Text style={dynamicStyles.emptyText}>
                {searchQuery
                  ? `No expenses match "${searchQuery}".`
                  : 'No expenses yet. Tap "+ Add New Expense" to create one.'}
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
                  onChangeText={value => updateExpense(expense.id, 'expense', value)}
                  placeholder="Enter expense"
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  style={dynamicStyles.inputCol3}
                  value={expense.amount}
                  onChangeText={value => updateExpense(expense.id, 'amount', value)}
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
        <AnimatedTouchable style={dynamicStyles.addButton} onPress={addNewExpense}>
          <Text style={dynamicStyles.addButtonText}>+ Add New Expense</Text>
        </AnimatedTouchable>
      </AnimatedView>
    </View>
  );
};

export default ExpensesPage;
