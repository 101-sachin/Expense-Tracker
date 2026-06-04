import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  BackHandler,
  Animated,
  TextInput,
} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {fonts} from '../utils/fonts';
import {AnimatedView} from './AnimatedView';
import {AnimatedTouchable} from './AnimatedTouchable';
import type {Expense, ExpenseTable} from '../types/expense';

export type {Expense, ExpenseTable};

// ─── Skeleton pulse hook ─────────────────────────────────────────────────────
const useSkeletonPulse = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return opacity;
};

// ─── Single skeleton card ─────────────────────────────────────────────────────
interface SkeletonCardProps {
  skeletonBase: string;
  skeletonHighlight: string;
  pulse: Animated.Value;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  skeletonBase,
  pulse,
}) => (
  <Animated.View style={[skeletonStyles.card, {opacity: pulse}]}>
    {/* Title bar */}
    <View
      style={[
        skeletonStyles.bar,
        {width: '60%', height: 18, backgroundColor: skeletonBase},
      ]}
    />
    {/* Count bar */}
    <View
      style={[
        skeletonStyles.bar,
        {width: '35%', height: 13, marginTop: 10, backgroundColor: skeletonBase},
      ]}
    />
    {/* Amount bar */}
    <View
      style={[
        skeletonStyles.bar,
        {width: '45%', height: 18, marginTop: 10, backgroundColor: skeletonBase},
      ]}
    />
  </Animated.View>
);

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  bar: {
    borderRadius: 6,
  },
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface ExpensesListProps {
  expenseTables: ExpenseTable[];
  onSelectTable: (table: ExpenseTable) => void;
  onCreateNew: () => void;
  onBack: () => void;
  onDeleteTable: (id: string) => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const SKELETON_COUNT = 5;

const ExpensesList: React.FC<ExpensesListProps> = ({
  expenseTables,
  onSelectTable,
  onCreateNew,
  onBack,
  onDeleteTable,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchQuery = '',
  onSearch,
}) => {
  const {colors, isDark} = useTheme();
  const skeletonPulse = useSkeletonPulse();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localSearch === searchQuery) return;
    const timer = setTimeout(() => {
      onSearch?.(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearch]);

  const skeletonBase = isDark ? '#374151' : '#E5E7EB';
  const skeletonCardBg = isDark ? '#1F2937' : '#FFFFFF';

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [onBack]);

  const calculateTotal = (expenses: Expense[]) =>
    expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const showPagination = totalPages > 1;

  const s = StyleSheet.create({
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
    backButton: {padding: 8, justifyContent: 'center', alignItems: 'center'},
    backText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
      lineHeight: 16,
      fontFamily: fonts.semiBold,
      letterSpacing: 0.2,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      fontFamily: fonts.bold,
      letterSpacing: 0.3,
    },
    headerSpacer: {width: 60},
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
      position: 'relative',
      justifyContent: 'center',
    },
    searchInput: {
      width: '100%',
      backgroundColor: colors.inputBackground || (isDark ? '#374151' : '#F3F4F6'),
      color: colors.text,
      borderRadius: 8,
      paddingLeft: 12,
      paddingRight: 40,
      paddingVertical: 10,
      fontSize: 16,
      fontFamily: fonts.regular,
      borderWidth: 1,
      borderColor: colors.inputBorder || colors.border,
    },
    clearButton: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    clearIconText: {
      color: colors.textSecondary,
      fontSize: 22,
      fontWeight: '400',
      textAlign: 'center',
    },
    scrollView: {flex: 1, padding: 16},
    emptyContainer: {padding: 40, alignItems: 'center'},
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    tableCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.shadowColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      position: 'relative',
    },
    tableContent: {flex: 1, paddingRight: 40},
    tableTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 6,
      fontFamily: fonts.bold,
      letterSpacing: 0.2,
    },
    tableCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      fontFamily: fonts.regular,
    },
    rightContainer: {
      position: 'absolute',
      top: 12,
      right: 12,
      alignItems: 'center',
    },
    tableTotal: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.success,
      marginTop: 8,
      fontFamily: fonts.bold,
      letterSpacing: 0.3,
    },
    deleteButton: {
      width: 28,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteText: {
      color: colors.textSecondary,
      fontSize: 22,
      fontWeight: '300',
      lineHeight: 22,
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
      fontFamily: fonts.semiBold,
      letterSpacing: 0.5,
    },
    // Pagination
    paginationBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 8,
    },
    pageBtn: {
      minWidth: 80,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pageBtnActive: {backgroundColor: colors.primary},
    pageBtnDisabled: {backgroundColor: colors.border},
    pageBtnText: {
      fontSize: 14,
      fontWeight: '600',
      fontFamily: fonts.semiBold,
    },
    pageBtnTextActive: {color: '#FFFFFF'},
    pageBtnTextDisabled: {color: colors.textSecondary},
    pageInfo: {flex: 1, alignItems: 'center'},
    pageInfoText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: fonts.regular,
    },
    pageInfoBold: {fontFamily: fonts.semiBold, color: colors.text},
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          {Array.from({length: SKELETON_COUNT}).map((_, i) => (
            <SkeletonCard
              // eslint-disable-next-line react/no-array-index-key
              key={`sk-${i}`}
              skeletonBase={skeletonBase}
              skeletonHighlight={skeletonBase}
              pulse={skeletonPulse}
            />
          ))}
        </>
      );
    }

    if (expenseTables.length === 0) {
      return (
        <AnimatedView key="empty" fadeIn duration={300}>
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>
              {searchQuery 
                ? `No expense tables found for "${searchQuery}".` 
                : `No expenses yet.\nCreate your first one!`}
            </Text>
          </View>
        </AnimatedView>
      );
    }

    return (
      <>
        {[...expenseTables]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          )
          .map((table, index) => {
            const total = table.totalAmount ?? calculateTotal(table.expenses || []);
            const expenseCount = table.expenseCount ?? (table.expenses ? table.expenses.length : 0);
            const rowKey =
              table.id?.length > 0
                ? String(table.id)
                : `expense-table-fallback-${index}`;
            return (
              <AnimatedView
                key={rowKey}
                fadeIn
                slideIn="left"
                duration={200}
                style={{marginBottom: 12}}>
                <View style={s.tableCard}>
                  <AnimatedTouchable
                    style={{flex: 1}}
                    onPress={() => onSelectTable(table)}>
                    <View style={s.tableContent}>
                      <Text style={s.tableTitle}>{table.title}</Text>
                      <Text style={s.tableCount}>
                        {expenseCount}{' '}
                        {expenseCount === 1 ? 'expense' : 'expenses'}
                      </Text>
                      <Text style={s.tableTotal}>
                        ₹{total.toFixed(2)}
                      </Text>
                    </View>
                  </AnimatedTouchable>
                  <View style={s.rightContainer}>
                    <AnimatedTouchable
                      style={s.deleteButton}
                      onPress={() => onDeleteTable(table.id)}>
                      <Text style={s.deleteText}>×</Text>
                    </AnimatedTouchable>
                  </View>
                </View>
              </AnimatedView>
            );
          })}
      </>
    );
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <AnimatedTouchable onPress={onBack} style={s.backButton}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={s.backText}>←</Text>
            <Text style={[s.backText, {marginLeft: 4}]}>back</Text>
          </View>
        </AnimatedTouchable>
        <Text style={s.headerTitle}>My Expenses</Text>
        <View style={s.headerSpacer} />
      </View>

      {isLoading && expenseTables.length === 0 && !searchQuery ? (
        <Animated.View style={[s.searchContainer, {opacity: skeletonPulse}]}>
          <View
            style={[
              skeletonStyles.bar,
              {width: '100%', height: 42, backgroundColor: skeletonBase},
            ]}
          />
        </Animated.View>
      ) : (
        <View style={s.searchContainer}>
          <View style={s.searchInputContainer}>
            <TextInput
              style={s.searchInput}
              placeholder="Search expense tables..."
              placeholderTextColor={colors.textSecondary}
              value={localSearch}
              onChangeText={setLocalSearch}
            />
            {localSearch.length > 0 && (
              <AnimatedTouchable style={s.clearButton} onPress={() => setLocalSearch('')}>
                <Text style={s.clearIconText}>×</Text>
              </AnimatedTouchable>
            )}
          </View>
        </View>
      )}

      {/* Skeleton cards / list / empty state rendered inside the scroll view */}
      <ScrollView
        style={s.scrollView}
        // Give skeleton cards slightly different bg so they pop
        contentContainerStyle={
          isLoading ? {paddingTop: 4} : undefined
        }>
        {/* Skeleton cards sit directly in the scroll — no extra wrapper needed */}
        {isLoading
          ? Array.from({length: SKELETON_COUNT}).map((_, i) => (
              <Animated.View
                // eslint-disable-next-line react/no-array-index-key
                key={`sk-${i}`}
                style={[
                  skeletonStyles.card,
                  {
                    backgroundColor: skeletonCardBg,
                    opacity: skeletonPulse,
                    shadowColor: colors.shadowColor,
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  },
                ]}>
                {/* Title */}
                <View
                  style={[
                    skeletonStyles.bar,
                    {
                      width: '62%',
                      height: 18,
                      backgroundColor: skeletonBase,
                    },
                  ]}
                />
                {/* Count */}
                <View
                  style={[
                    skeletonStyles.bar,
                    {
                      width: '38%',
                      height: 13,
                      marginTop: 10,
                      backgroundColor: skeletonBase,
                    },
                  ]}
                />
                {/* Amount */}
                <View
                  style={[
                    skeletonStyles.bar,
                    {
                      width: '48%',
                      height: 18,
                      marginTop: 10,
                      backgroundColor: skeletonBase,
                    },
                  ]}
                />
              </Animated.View>
            ))
          : renderContent()}
      </ScrollView>

      {/* Pagination bar — skeleton while loading */}
      {isLoading && showPagination ? (
        <Animated.View
          style={[
            s.paginationBar,
            {opacity: skeletonPulse},
          ]}>
          <View
            style={[
              skeletonStyles.bar,
              {width: 80, height: 34, backgroundColor: skeletonBase, borderRadius: 8},
            ]}
          />
          <View style={s.pageInfo}>
            <View
              style={[
                skeletonStyles.bar,
                {width: 90, height: 14, backgroundColor: skeletonBase},
              ]}
            />
          </View>
          <View
            style={[
              skeletonStyles.bar,
              {width: 80, height: 34, backgroundColor: skeletonBase, borderRadius: 8},
            ]}
          />
        </Animated.View>
      ) : showPagination ? (
        <View style={s.paginationBar}>
          <AnimatedTouchable
            style={[
              s.pageBtn,
              hasPrevPage ? s.pageBtnActive : s.pageBtnDisabled,
            ]}
            onPress={() => hasPrevPage && onPageChange?.(currentPage - 1)}
            disabled={!hasPrevPage}>
            <Text
              style={[
                s.pageBtnText,
                hasPrevPage ? s.pageBtnTextActive : s.pageBtnTextDisabled,
              ]}>
              ← Prev
            </Text>
          </AnimatedTouchable>

          <View style={s.pageInfo}>
            <Text style={s.pageInfoText}>
              Page{' '}
              <Text style={s.pageInfoBold}>{currentPage}</Text>
              {' of '}
              <Text style={s.pageInfoBold}>{totalPages}</Text>
            </Text>
          </View>

          <AnimatedTouchable
            style={[
              s.pageBtn,
              hasNextPage ? s.pageBtnActive : s.pageBtnDisabled,
            ]}
            onPress={() => hasNextPage && onPageChange?.(currentPage + 1)}
            disabled={!hasNextPage}>
            <Text
              style={[
                s.pageBtnText,
                hasNextPage ? s.pageBtnTextActive : s.pageBtnTextDisabled,
              ]}>
              Next →
            </Text>
          </AnimatedTouchable>
        </View>
      ) : null}

      {/* Create button — skeleton while loading */}
      {isLoading ? (
        <Animated.View
          style={[
            {
              marginHorizontal: 16,
              marginVertical: 16,
              borderRadius: 8,
              height: 52,
              backgroundColor: skeletonBase,
              opacity: skeletonPulse,
            },
          ]}
        />
      ) : (
        <AnimatedView fadeIn slideIn="up" duration={400}>
          <AnimatedTouchable style={s.createButton} onPress={onCreateNew}>
            <Text style={s.createButtonText}>+ Create New Expenses</Text>
          </AnimatedTouchable>
        </AnimatedView>
      )}
    </View>
  );
};

export default ExpensesList;
