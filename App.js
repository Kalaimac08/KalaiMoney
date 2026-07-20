import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, Modal, FlatList, StatusBar,
  SafeAreaView, Dimensions, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// ============================================
// MALAYSIA TAX RELIEF DATA (YA 2024)
// ============================================
const TAX_RELIEFS = [
  { id: '1', name: 'Individual & Dependents', max: 9000, category: 'Personal', icon: '👤', desc: 'Automatic relief for individual taxpayer' },
  { id: '2', name: 'Spouse / Alimony', max: 4000, category: 'Personal', icon: '💑', desc: 'Spouse with no income' },
  { id: '3', name: 'Child (Under 18)', max: 2000, category: 'Family', icon: '👶', desc: 'RM2,000 per child under 18' },
  { id: '4', name: 'Child (18+ Studying)', max: 8000, category: 'Family', icon: '🎓', desc: 'Child in full-time education' },
  { id: '5', name: 'Disabled Child', max: 6000, category: 'Family', icon: '♿', desc: 'Additional relief for disabled child' },
  { id: '6', name: 'Medical - Parents', max: 8000, category: 'Medical', icon: '🏥', desc: 'Medical treatment for parents' },
  { id: '7', name: 'Serious Disease Treatment', max: 10000, category: 'Medical', icon: '💊', desc: 'Self/spouse/child serious disease' },
  { id: '8', name: 'Fertility Treatment', max: 10000, category: 'Medical', icon: '🍼', desc: 'Fertility treatment self/spouse' },
  { id: '9', name: 'Vaccination', max: 1000, category: 'Medical', icon: '💉', desc: 'COVID-19, pneumococcal, HPV etc.' },
  { id: '10', name: 'Medical Examination', max: 1000, category: 'Medical', icon: '🩺', desc: 'Complete medical check-up' },
  { id: '11', name: 'Mental Health', max: 1000, category: 'Medical', icon: '🧠', desc: 'Psychiatrist/psychologist consultation' },
  { id: '12', name: 'Learning Disability', max: 4000, category: 'Medical', icon: '📚', desc: 'Child assessment & therapy' },
  { id: '13', name: 'Lifestyle (General)', max: 2500, category: 'Lifestyle', icon: '📱', desc: 'Books, electronics, internet, gym' },
  { id: '14', name: 'Sports Equipment', max: 1000, category: 'Lifestyle', icon: '⚽', desc: 'Sports equipment & activities' },
  { id: '15', name: 'Education Fees (Self)', max: 7000, category: 'Education', icon: '🏫', desc: 'Masters, Doctorate, professional courses' },
  { id: '16', name: 'Upskilling Courses', max: 2000, category: 'Education', icon: '📖', desc: 'MQA/MOHR recognized courses' },
  { id: '17', name: 'EPF / KWSP', max: 4000, category: 'Financial', icon: '🏦', desc: 'Employee Provident Fund' },
  { id: '18', name: 'Life Insurance / Takaful', max: 3000, category: 'Financial', icon: '🛡️', desc: 'Life insurance premium' },
  { id: '19', name: 'Medical Insurance', max: 3000, category: 'Financial', icon: '🏨', desc: 'Education & medical insurance' },
  { id: '20', name: 'SOCSO / PERKESO', max: 350, category: 'Financial', icon: '📋', desc: 'Social security contribution' },
  { id: '21', name: 'PRS (Private Retirement)', max: 3000, category: 'Financial', icon: '👴', desc: 'Private Retirement Scheme' },
  { id: '22', name: 'SSPN (PTPTN)', max: 8000, category: 'Financial', icon: '🎓', desc: 'Education savings scheme' },
  { id: '23', name: 'Disabled Individual (Self)', max: 6000, category: 'Personal', icon: '♿', desc: 'OKU registered individual' },
  { id: '24', name: 'Disabled Spouse', max: 5000, category: 'Personal', icon: '♿', desc: 'OKU registered spouse' },
  { id: '25', name: 'EV Charging Facility', max: 2500, category: 'Lifestyle', icon: '⚡', desc: 'Electric vehicle charging' },
  { id: '26', name: 'Childcare Fees', max: 3000, category: 'Family', icon: '🏠', desc: 'Registered childcare/kindergarten' },
  { id: '27', name: 'Breastfeeding Equipment', max: 1000, category: 'Family', icon: '🤱', desc: 'Breast pump (once every 2 years)' },
  { id: '28', name: 'Domestic Tourism', max: 1000, category: 'Lifestyle', icon: '🏖️', desc: 'Accommodation at registered premises' },
];

const CATEGORIES = [
  '🍔 Food & Dining', '🚗 Transportation', '🛍️ Shopping',
  '💡 Bills & Utilities', '🏥 Medical & Health', '📚 Education',
  '🎬 Entertainment', '🛡️ Insurance', '📱 Electronics',
  '📖 Books', '⚽ Sports & Fitness', '🌐 Internet & Phone',
  '👶 Childcare', '🛒 Groceries', '✈️ Travel', '🏠 Home', '💼 Others'
];

const COLORS = {
  primary: '#6C3FC5',
  primaryDark: '#4A2A8A',
  secondary: '#FF6B6B',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  gold: '#FFD700',
  bg: '#F0EBF8',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textLight: '#666',
  border: '#E0D6F0',
};

// ============================================
// STORAGE HELPERS
// ============================================
const saveData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) { console.error(e); }
};

const loadData = async (key, defaultVal = []) => {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) { return defaultVal; }
};

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const formatRM = (amount) => `RM ${parseFloat(amount || 0).toFixed(2)}`;

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getCurrentYear = () => new Date().getFullYear();

const getToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// ============================================
// MALAYSIA TAX CALCULATOR
// ============================================
const calculateMalaysiaTax = (income) => {
  const brackets = [
    { min: 0, max: 5000, rate: 0, base: 0 },
    { min: 5001, max: 20000, rate: 0.01, base: 0 },
    { min: 20001, max: 35000, rate: 0.03, base: 150 },
    { min: 35001, max: 50000, rate: 0.06, base: 600 },
    { min: 50001, max: 70000, rate: 0.11, base: 1500 },
    { min: 70001, max: 100000, rate: 0.19, base: 3700 },
    { min: 100001, max: 400000, rate: 0.25, base: 9400 },
    { min: 400001, max: 600000, rate: 0.26, base: 84400 },
    { min: 600001, max: 2000000, rate: 0.28, base: 136400 },
    { min: 2000001, max: Infinity, rate: 0.30, base: 528400 },
  ];
  
  for (let b of brackets) {
    if (income <= b.max) {
      return b.base + (income - b.min) * b.rate;
    }
  }
  return 0;
};

// ============================================
// COMPONENTS
// ============================================

const Header = ({ title, subtitle, onBack }) => (
  <View style={styles.header}>
    <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
    {onBack && (
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
    )}
    <View style={styles.headerContent}>
      <Text style={styles.headerEmoji}>💎</Text>
      <View>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  </View>
);

const StatCard = ({ icon, label, value, color, onPress }) => (
  <TouchableOpacity
    style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </TouchableOpacity>
);

const InputField = ({ label, value, onChangeText, placeholder, keyboardType, multiline }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#AAA"
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
    />
  </View>
);

const Button = ({ title, onPress, color, style, textStyle }) => (
  <TouchableOpacity
    style={[styles.button, { backgroundColor: color || COLORS.primary }, style]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const Badge = ({ text, color }) => (
  <View style={[styles.badge, { backgroundColor: color || COLORS.primary }]}>
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

// ============================================
// SCREENS
// ============================================

// DASHBOARD SCREEN
const DashboardScreen = ({ expenses, budgets, savings, taxClaims, onNavigate }) => {
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  
  const monthlyExpenses = expenses.filter(e => e.date && e.date.startsWith(currentMonth));
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const totalBudget = budgets
    .filter(b => b.monthYear === currentMonth)
    .reduce((sum, b) => sum + parseFloat(b.limit || 0), 0);
  
  const totalSavings = savings.reduce((sum, s) => sum + parseFloat(s.current || 0), 0);
  
  const yearTaxClaims = taxClaims.filter(t => t.year === currentYear);
  const totalTaxRelief = yearTaxClaims.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const budgetPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeText}>Selamat Datang! 👋</Text>
        <Text style={styles.welcomeDate}>{new Date().toLocaleDateString('ms-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard icon="💸" label="Spent This Month" value={formatRM(totalSpent)} color={COLORS.secondary} onPress={() => onNavigate('expenses')} />
        <StatCard icon="📊" label="Monthly Budget" value={formatRM(totalBudget)} color={COLORS.primary} onPress={() => onNavigate('budget')} />
        <StatCard icon="🐷" label="Total Savings" value={formatRM(totalSavings)} color={COLORS.success} onPress={() => onNavigate('savings')} />
        <StatCard icon="🏛️" label="Tax Relief" value={formatRM(totalTaxRelief)} color={COLORS.warning} onPress={() => onNavigate('tax')} />
      </View>

      {/* Budget Progress */}
      {totalBudget > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Budget Progress</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {
              width: `${budgetPercent}%`,
              backgroundColor: budgetPercent > 90 ? COLORS.danger : budgetPercent > 70 ? COLORS.warning : COLORS.success
            }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>{formatRM(totalSpent)} spent</Text>
            <Text style={styles.progressText}>{budgetPercent.toFixed(0)}%</Text>
            <Text style={styles.progressText}>{formatRM(totalBudget)} budget</Text>
          </View>
          {budgetPercent > 80 && (
            <View style={[styles.alertBanner, { backgroundColor: budgetPercent > 100 ? '#FFEBEE' : '#FFF3E0' }]}>
              <Text style={{ color: budgetPercent > 100 ? COLORS.danger : COLORS.warning, fontWeight: 'bold' }}>
                {budgetPercent > 100 ? '⚠️ Over Budget!' : '⚠️ Almost at budget limit!'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Recent Expenses */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🧾 Recent Expenses</Text>
          <TouchableOpacity onPress={() => onNavigate('expenses')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        {recentExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No expenses yet!</Text>
            <Text style={styles.emptySubText}>Tap + to add your first expense</Text>
          </View>
        ) : (
          recentExpenses.map(expense => (
            <View key={expense.id} style={styles.expenseItem}>
              <Text style={styles.expenseItemIcon}>{expense.category?.charAt(0) || '💸'}</Text>
              <View style={styles.expenseItemInfo}>
                <Text style={styles.expenseItemTitle} numberOfLines={1}>{expense.title}</Text>
                <Text style={styles.expenseItemCat}>{expense.category} • {expense.date}</Text>
              </View>
              <View style={styles.expenseItemRight}>
                <Text style={styles.expenseItemAmount}>-{formatRM(expense.amount)}</Text>
                {expense.taxDeductible && <Badge text="TAX" color={COLORS.success} />}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Quick Add Button */}
      <TouchableOpacity style={styles.quickAddBtn} onPress={() => onNavigate('addExpense')}>
        <Text style={styles.quickAddText}>➕ Add New Expense</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// EXPENSE LIST SCREEN
const ExpenseListScreen = ({ expenses, onNavigate, onDelete }) => {
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterCat, setFilterCat] = useState('All');

  const filtered = expenses.filter(e => {
    const monthMatch = !filterMonth || e.date?.startsWith(filterMonth);
    const catMatch = filterCat === 'All' || e.category === filterCat;
    return monthMatch && catMatch;
  });

  const totalFiltered = filtered.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const grouped = filtered.reduce((acc, exp) => {
    const date = exp.date || 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(exp);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryBanner}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>{formatRM(totalFiltered)}</Text>
        <Text style={styles.summaryCount}>{filtered.length} transactions</Text>
      </View>

      <View style={styles.card}>
        <InputField
          label="Filter Month (YYYY-MM)"
          value={filterMonth}
          onChangeText={setFilterMonth}
          placeholder="e.g. 2024-01"
        />
      </View>

      {Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(date => (
        <View key={date} style={styles.card}>
          <Text style={styles.dateGroupHeader}>{date}</Text>
          {grouped[date].map(expense => (
            <View key={expense.id} style={styles.expenseRow}>
              <View style={styles.expenseCatIcon}>
                <Text style={{ fontSize: 20 }}>{expense.category?.split(' ')[0] || '💸'}</Text>
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle} numberOfLines={1}>{expense.title}</Text>
                <Text style={styles.expenseMeta}>{expense.category}</Text>
                {expense.note ? <Text style={styles.expenseNote} numberOfLines={1}>📝 {expense.note}</Text> : null}
                {expense.taxDeductible && (
                  <Text style={styles.taxTag}>🏛️ Tax: {expense.taxReliefName}</Text>
                )}
                {expense.hasReceipt && <Text style={styles.receiptTag}>📷 Receipt saved</Text>}
              </View>
              <View style={styles.expenseAmountCol}>
                <Text style={styles.expenseAmount}>-{formatRM(expense.amount)}</Text>
                <TouchableOpacity onPress={() => {
                  Alert.alert('Delete', `Delete "${expense.title}"?`, [
                    { text: 'Cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => onDelete(expense.id) }
                  ]);
                }}>
                  <Text style={styles.deleteBtn}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ))}

      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🧾</Text>
          <Text style={styles.emptyText}>No expenses found</Text>
        </View>
      )}

      <TouchableOpacity style={styles.quickAddBtn} onPress={() => onNavigate('addExpense')}>
        <Text style={styles.quickAddText}>➕ Add New Expense</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ADD EXPENSE SCREEN
const AddExpenseScreen = ({ onSave, onBack }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState('');
  const [taxDeductible, setTaxDeductible] = useState(false);
  const [selectedRelief, setSelectedRelief] = useState(null);
  const [hasReceipt, setHasReceipt] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showTaxPicker, setShowTaxPicker] = useState(false);
  const [receiptNote, setReceiptNote] = useState('');

  const handleSave = () => {
    if (!title.trim()) return Alert.alert('❌ Error', 'Please enter expense title');
    if (!amount || isNaN(parseFloat(amount))) return Alert.alert('❌ Error', 'Please enter valid amount');
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) return Alert.alert('❌ Error', 'Date format: YYYY-MM-DD');

    const expense = {
      id: generateId(),
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date,
      note: note.trim(),
      taxDeductible,
      taxReliefId: selectedRelief?.id,
      taxReliefName: selectedRelief?.name,
      taxReliefMax: selectedRelief?.max,
      hasReceipt,
      receiptNote: receiptNote.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave(expense);
    Alert.alert('✅ Saved!', 'Expense added successfully!', [{ text: 'OK', onPress: onBack }]);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>💸 Expense Details</Text>

        <InputField label="Title *" value={title} onChangeText={setTitle} placeholder="e.g. Lunch at Nasi Lemak" />
        <InputField label="Amount (RM) *" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" />
        <InputField label="Date * (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2024-01-15" />
        <InputField label="Notes" value={note} onChangeText={setNote} placeholder="Optional notes..." multiline />

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCatPicker(true)}>
            <Text style={styles.pickerBtnText}>{category} ▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Receipt */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📷 Receipt</Text>
        <TouchableOpacity
          style={[styles.toggleBtn, hasReceipt && styles.toggleBtnActive]}
          onPress={() => setHasReceipt(!hasReceipt)}
        >
          <Text style={[styles.toggleBtnText, hasReceipt && { color: 'white' }]}>
            {hasReceipt ? '✅ Receipt Saved' : '📷 Mark Receipt as Saved'}
          </Text>
        </TouchableOpacity>
        {hasReceipt && (
          <InputField
            label="Receipt Description"
            value={receiptNote}
            onChangeText={setReceiptNote}
            placeholder="e.g. Hospital receipt RM120.00"
            multiline
          />
        )}
        <Text style={styles.helperText}>
          💡 Tip: Take a photo of your receipt with your phone camera app and save to gallery. Mark it here as saved for your records.
        </Text>
      </View>

      {/* Tax Relief */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🏛️ Malaysia Tax Relief</Text>
        <TouchableOpacity
          style={[styles.toggleBtn, taxDeductible && styles.toggleBtnActive]}
          onPress={() => {
            setTaxDeductible(!taxDeductible);
            if (taxDeductible) setSelectedRelief(null);
          }}
        >
          <Text style={[styles.toggleBtnText, taxDeductible && { color: 'white' }]}>
            {taxDeductible ? '✅ Tax Deductible' : '🏛️ Mark as Tax Deductible'}
          </Text>
        </TouchableOpacity>

        {taxDeductible && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tax Relief Category</Text>
              <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTaxPicker(true)}>
                <Text style={styles.pickerBtnText}>
                  {selectedRelief ? `${selectedRelief.icon} ${selectedRelief.name}` : 'Select Category ▼'}
                </Text>
              </TouchableOpacity>
            </View>
            {selectedRelief && (
              <View style={styles.reliefInfo}>
                <Text style={styles.reliefInfoText}>📊 Max Limit: {formatRM(selectedRelief.max)}</Text>
                <Text style={styles.reliefInfoText}>📝 {selectedRelief.desc}</Text>
              </View>
            )}
          </>
        )}
      </View>

      <Button title="💾 Save Expense" onPress={handleSave} style={styles.saveBtn} />
      <View style={{ height: 50 }} />

      {/* Category Modal */}
      <Modal visible={showCatPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalItem, category === cat && styles.modalItemActive]}
                  onPress={() => { setCategory(cat); setShowCatPicker(false); }}
                >
                  <Text style={[styles.modalItemText, category === cat && { color: 'white' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Close" onPress={() => setShowCatPicker(false)} color="#666" style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      {/* Tax Relief Modal */}
      <Modal visible={showTaxPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏛️ Select Tax Relief</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {TAX_RELIEFS.map(relief => (
                <TouchableOpacity
                  key={relief.id}
                  style={[styles.taxModalItem, selectedRelief?.id === relief.id && styles.modalItemActive]}
                  onPress={() => { setSelectedRelief(relief); setShowTaxPicker(false); }}
                >
                  <Text style={styles.taxModalIcon}>{relief.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.taxModalName, selectedRelief?.id === relief.id && { color: 'white' }]}>{relief.name}</Text>
                    <Text style={[styles.taxModalMax, selectedRelief?.id === relief.id && { color: '#DDD' }]}>Max: {formatRM(relief.max)} • {relief.category}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Close" onPress={() => setShowTaxPicker(false)} color="#666" style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// BUDGET SCREEN
const BudgetScreen = ({ expenses, budgets, onSaveBudget, onDeleteBudget }) => {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [monthYear, setMonthYear] = useState(getCurrentMonth());
  const [showCatPicker, setShowCatPicker] = useState(false);

  const currentMonth = getCurrentMonth();

  const monthlyBudgets = budgets.filter(b => b.monthYear === currentMonth);

  const getSpentForCategory = (cat) => {
    return expenses
      .filter(e => e.category === cat && e.date?.startsWith(currentMonth))
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  };

  const totalBudget = monthlyBudgets.reduce((sum, b) => sum + parseFloat(b.limit || 0), 0);
  const totalSpent = monthlyBudgets.reduce((sum, b) => sum + getSpentForCategory(b.category), 0);

  const handleSave = () => {
    if (!limit || isNaN(parseFloat(limit))) return Alert.alert('❌', 'Enter valid amount');
    const budget = {
      id: generateId(),
      category,
      limit: parseFloat(limit),
      monthYear,
      createdAt: new Date().toISOString(),
    };
    onSaveBudget(budget);
    setLimit('');
    setShowForm(false);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryBanner}>
        <Text style={styles.summaryLabel}>Total Budget vs Spent</Text>
        <Text style={styles.summaryAmount}>{formatRM(totalBudget)}</Text>
        <Text style={styles.summaryCount}>Spent: {formatRM(totalSpent)}</Text>
      </View>

      {!showForm ? (
        <Button
          title="➕ Set New Budget"
          onPress={() => setShowForm(true)}
          style={styles.addBtn}
        />
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Set Budget</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCatPicker(true)}>
              <Text style={styles.pickerBtnText}>{category} ▼</Text>
            </TouchableOpacity>
          </View>
          <InputField label="Monthly Limit (RM)" value={limit} onChangeText={setLimit} keyboardType="decimal-pad" placeholder="0.00" />
          <InputField label="Month (YYYY-MM)" value={monthYear} onChangeText={setMonthYear} placeholder="2024-01" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="💾 Save" onPress={handleSave} style={{ flex: 1 }} />
            <Button title="Cancel" onPress={() => setShowForm(false)} color="#999" style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {monthlyBudgets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No budgets set</Text>
          <Text style={styles.emptySubText}>Set monthly limits for each category</Text>
        </View>
      ) : (
        monthlyBudgets.map(budget => {
          const spent = getSpentForCategory(budget.category);
          const pct = parseFloat(budget.limit) > 0 ? Math.min((spent / parseFloat(budget.limit)) * 100, 100) : 0;
          const remaining = parseFloat(budget.limit) - spent;
          const isOver = remaining < 0;

          return (
            <View key={budget.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.budgetCatName}>{budget.category}</Text>
                <TouchableOpacity onPress={() => onDeleteBudget(budget.id)}>
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {
                  width: `${pct}%`,
                  backgroundColor: pct > 100 ? COLORS.danger : pct > 80 ? COLORS.warning : COLORS.success
                }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>Spent: {formatRM(spent)}</Text>
                <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{pct.toFixed(0)}%</Text>
                <Text style={styles.progressText}>Budget: {formatRM(budget.limit)}</Text>
              </View>
              <Text style={[styles.remainingText, { color: isOver ? COLORS.danger : COLORS.success }]}>
                {isOver ? `⚠️ Over by ${formatRM(Math.abs(remaining))}` : `✅ Remaining: ${formatRM(remaining)}`}
              </Text>
            </View>
          );
        })
      )}

      <Modal visible={showCatPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.modalItem, category === cat && styles.modalItemActive]}
                  onPress={() => { setCategory(cat); setShowCatPicker(false); }}
                >
                  <Text style={[styles.modalItemText, category === cat && { color: 'white' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button title="Close" onPress={() => setShowCatPicker(false)} color="#666" style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// SAVINGS SCREEN
const SavingsScreen = ({ savings, onSaveGoal, onUpdateGoal, onDeleteGoal }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  const totalSavings = savings.reduce((sum, s) => sum + parseFloat(s.current || 0), 0);
  const totalTarget = savings.reduce((sum, s) => sum + parseFloat(s.target || 0), 0);

  const handleCreateGoal = () => {
    if (!name.trim()) return Alert.alert('❌', 'Enter goal name');
    if (!target || isNaN(parseFloat(target))) return Alert.alert('❌', 'Enter valid target');
    const goal = {
      id: generateId(),
      name: name.trim(),
      target: parseFloat(target),
      current: 0,
      createdAt: new Date().toISOString(),
    };
    onSaveGoal(goal);
    setName(''); setTarget(''); setShowForm(false);
  };

  const handleAddMoney = () => {
    const amt = parseFloat(addAmount);
    if (!amt || isNaN(amt) || amt <= 0) return Alert.alert('❌', 'Enter valid amount');
    const updated = { ...selectedGoal, current: parseFloat(selectedGoal.current) + amt };
    onUpdateGoal(updated);
    setAddAmount('');
    setShowAddModal(false);
    setSelectedGoal(null);
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryBanner}>
        <Text style={styles.summaryLabel}>🐷 Total Saved</Text>
        <Text style={styles.summaryAmount}>{formatRM(totalSavings)}</Text>
        <Text style={styles.summaryCount}>Target: {formatRM(totalTarget)}</Text>
      </View>

      {!showForm ? (
        <Button title="➕ Create Savings Goal" onPress={() => setShowForm(true)} style={styles.addBtn} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>New Savings Goal</Text>
          <InputField label="Goal Name" value={name} onChangeText={setName} placeholder="e.g. Emergency Fund, Vacation" />
          <InputField label="Target Amount (RM)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="0.00" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="💾 Create" onPress={handleCreateGoal} style={{ flex: 1 }} />
            <Button title="Cancel" onPress={() => setShowForm(false)} color="#999" style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {savings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🐷</Text>
          <Text style={styles.emptyText}>No savings goals yet</Text>
          <Text style={styles.emptySubText}>Create your first savings goal!</Text>
        </View>
      ) : (
        savings.map(goal => {
          const pct = parseFloat(goal.target) > 0
            ? Math.min((parseFloat(goal.current) / parseFloat(goal.target)) * 100, 100)
            : 0;
          const remaining = parseFloat(goal.target) - parseFloat(goal.current);
          const isComplete = parseFloat(goal.current) >= parseFloat(goal.target);

          return (
            <View key={goal.id} style={[styles.card, isComplete && styles.cardCompleted]}>
              <View style={styles.cardHeader}>
                <Text style={styles.goalName}>{isComplete ? '🎉' : '🎯'} {goal.name}</Text>
                <TouchableOpacity onPress={() => {
                  Alert.alert('Delete Goal?', `Delete "${goal.name}"?`, [
                    { text: 'Cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => onDeleteGoal(goal.id) }
                  ]);
                }}>
                  <Text>🗑️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.savingsAmounts}>
                <Text style={styles.currentAmount}>{formatRM(goal.current)}</Text>
                <Text style={styles.ofText}>of</Text>
                <Text style={styles.targetAmount}>{formatRM(goal.target)}</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {
                  width: `${pct}%`,
                  backgroundColor: isComplete ? COLORS.gold : COLORS.success
                }]} />
              </View>

              <View style={styles.progressLabels}>
                <Text style={styles.pctText}>{pct.toFixed(1)}% complete</Text>
                {!isComplete && <Text style={styles.needText}>Need {formatRM(remaining)} more</Text>}
                {isComplete && <Text style={{ color: COLORS.gold, fontWeight: 'bold' }}>🎉 Goal Reached!</Text>}
              </View>

              {!isComplete && (
                <Button
                  title="➕ Add Money"
                  onPress={() => { setSelectedGoal(goal); setShowAddModal(true); }}
                  color={COLORS.success}
                  style={{ marginTop: 8 }}
                />
              )}
            </View>
          );
        })
      )}

      {/* Add Money Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>➕ Add to {selectedGoal?.name}</Text>
            <TextInput
              style={styles.input}
              value={addAmount}
              onChangeText={setAddAmount}
              placeholder="Amount (RM)"
              keyboardType="decimal-pad"
              placeholderTextColor="#AAA"
            />
            <Button title="Add Money 💰" onPress={handleAddMoney} style={{ marginTop: 8 }} />
            <Button title="Cancel" onPress={() => setShowAddModal(false)} color="#999" style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// TAX RELIEF SCREEN
const TaxReliefScreen = ({ expenses, taxClaims, onSaveClaim, onDeleteClaim }) => {
  const [annualIncome, setAnnualIncome] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDetail, setShowDetail] = useState(null);

  const currentYear = getCurrentYear();

  const yearClaims = taxClaims.filter(t => t.year === currentYear);
  const totalRelief = yearClaims.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const getClaimedForRelief = (reliefId) => {
    return yearClaims
      .filter(t => t.reliefId === reliefId)
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  };

  const handleCalculate = () => {
    const income = parseFloat(annualIncome);
    if (!income || isNaN(income)) return Alert.alert('❌', 'Enter valid annual income');
    const taxWithout = calculateMalaysiaTax(income);
    const chargeable = Math.max(0, income - totalRelief);
    const taxWith = calculateMalaysiaTax(chargeable);
    const saved = taxWithout - taxWith;
    setCalcResult({ taxWithout, taxWith, saved, chargeable, totalRelief });
  };

  const categories = ['All', ...new Set(TAX_RELIEFS.map(r => r.category))];

  const filteredReliefs = selectedCategory === 'All'
    ? TAX_RELIEFS
    : TAX_RELIEFS.filter(r => r.category === selectedCategory);

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* Tax Summary */}
      <View style={[styles.summaryBanner, { backgroundColor: COLORS.primaryDark }]}>
        <Text style={styles.summaryLabel}>🏛️ Total Tax Relief Claimed ({currentYear})</Text>
        <Text style={styles.summaryAmount}>{formatRM(totalRelief)}</Text>
        <Text style={styles.summaryCount}>{yearClaims.length} claims recorded</Text>
      </View>

      {/* Tax Calculator */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🧮 Tax Calculator</Text>
        <Text style={styles.helperText}>Based on Malaysia Income Tax YA {currentYear}</Text>
        <InputField
          label="Annual Income (RM)"
          value={annualIncome}
          onChangeText={setAnnualIncome}
          keyboardType="decimal-pad"
          placeholder="e.g. 60000"
        />
        <Button title="Calculate My Tax" onPress={handleCalculate} />

        {calcResult && (
          <View style={styles.calcResult}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Annual Income</Text>
              <Text style={styles.calcValue}>{formatRM(annualIncome)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Total Relief</Text>
              <Text style={[styles.calcValue, { color: COLORS.success }]}>-{formatRM(calcResult.totalRelief)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Chargeable Income</Text>
              <Text style={styles.calcValue}>{formatRM(calcResult.chargeable)}</Text>
            </View>
            <View style={[styles.calcDivider]} />
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Tax WITHOUT Relief</Text>
              <Text style={[styles.calcValue, { color: COLORS.danger }]}>{formatRM(calcResult.taxWithout)}</Text>
            </View>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Tax WITH Relief</Text>
              <Text style={[styles.calcValue, { color: COLORS.primary }]}>{formatRM(calcResult.taxWith)}</Text>
            </View>
            <View style={[styles.calcHighlight]}>
              <Text style={styles.calcSavedLabel}>💰 Tax Saved</Text>
              <Text style={styles.calcSavedValue}>{formatRM(calcResult.saved)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Tax Brackets Reference */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📊 Tax Brackets (YA {currentYear})</Text>
        {[
          ['RM 0 – 5,000', '0%'],
          ['RM 5,001 – 20,000', '1%'],
          ['RM 20,001 – 35,000', '3%'],
          ['RM 35,001 – 50,000', '6%'],
          ['RM 50,001 – 70,000', '11%'],
          ['RM 70,001 – 100,000', '19%'],
          ['RM 100,001 – 400,000', '25%'],
          ['RM 400,001 – 600,000', '26%'],
          ['RM 600,001 – 2,000,000', '28%'],
          ['Above RM 2,000,000', '30%'],
        ].map(([range, rate]) => (
          <View key={range} style={styles.bracketRow}>
            <Text style={styles.bracketRange}>{range}</Text>
            <Text style={[styles.bracketRate, { color: parseFloat(rate) > 20 ? COLORS.danger : parseFloat(rate) > 10 ? COLORS.warning : COLORS.success }]}>{rate}</Text>
          </View>
        ))}
      </View>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterChipText, selectedCategory === cat && { color: 'white' }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Relief Categories */}
      <Text style={[styles.sectionTitle, { paddingHorizontal: 16 }]}>
        🏛️ Tax Relief Categories (YA {currentYear})
      </Text>

      {filteredReliefs.map(relief => {
        const claimed = getClaimedForRelief(relief.id);
        const pct = relief.max > 0 ? Math.min((claimed / relief.max) * 100, 100) : 0;
        const isMaxed = claimed >= relief.max;

        return (
          <TouchableOpacity key={relief.id} style={styles.card} onPress={() => setShowDetail(showDetail === relief.id ? null : relief.id)}>
            <View style={styles.reliefHeader}>
              <Text style={styles.reliefIcon}>{relief.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.reliefName}>{relief.name}</Text>
                <Text style={styles.reliefCat}>{relief.category}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.reliefMax}>Max: {formatRM(relief.max)}</Text>
                <Badge
                  text={isMaxed ? 'MAXED ✅' : claimed > 0 ? 'PARTIAL ⏳' : 'EMPTY ❌'}
                  color={isMaxed ? COLORS.success : claimed > 0 ? COLORS.warning : '#CCC'}
                />
              </View>
            </View>

            {claimed > 0 && (
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {
                  width: `${pct}%`,
                  backgroundColor: isMaxed ? COLORS.success : COLORS.warning
                }]} />
              </View>
            )}

            {showDetail === relief.id && (
              <View style={styles.reliefDetail}>
                <Text style={styles.reliefDetailText}>📝 {relief.desc}</Text>
                <Text style={styles.reliefDetailText}>💰 Claimed: {formatRM(claimed)} / {formatRM(relief.max)}</Text>
                <Text style={styles.reliefDetailText}>💡 Remaining: {formatRM(Math.max(0, relief.max - claimed))}</Text>
                
                {/* Expense-linked claims */}
                {yearClaims.filter(t => t.reliefId === relief.id).map(claim => (
                  <View key={claim.id} style={styles.claimItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.claimItemText}>• {formatRM(claim.amount)} - {claim.note || 'No note'}</Text>
                      <Text style={styles.claimDate}>{claim.date}</Text>
                    </View>
                    <TouchableOpacity onPress={() => onDeleteClaim(claim.id)}>
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// REPORT SCREEN
const ReportScreen = ({ expenses, taxClaims }) => {
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const monthlyExp = expenses.filter(e => e.date?.startsWith(currentMonth));
  const totalMonthly = monthlyExp.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const catBreakdown = monthlyExp.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + parseFloat(e.amount || 0);
    return acc;
  }, {});

  const sortedCats = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]);

  const taxDeductible = expenses.filter(e => e.taxDeductible && e.date?.startsWith(String(currentYear)));
  const totalTaxDeductible = taxDeductible.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const total = expenses
      .filter(e => e.date?.startsWith(m))
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    return { month: m, total };
  }).reverse();

  const maxMonthly = Math.max(...last6Months.map(m => m.total), 1);

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryBanner}>
        <Text style={styles.summaryLabel}>📊 Monthly Report - {currentMonth}</Text>
        <Text style={styles.summaryAmount}>{formatRM(totalMonthly)}</Text>
        <Text style={styles.summaryCount}>{monthlyExp.length} expenses this month</Text>
      </View>

      {/* 6-Month Bar Chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>📈 6-Month Spending Trend</Text>
        <View style={styles.barChart}>
          {last6Months.map(({ month, total }) => (
            <View key={month} style={styles.barGroup}>
              <Text style={styles.barAmount}>{total > 0 ? `${(total/1000).toFixed(1)}k` : ''}</Text>
              <View style={[styles.bar, {
                height: Math.max((total / maxMonthly) * 120, total > 0 ? 4 : 0),
                backgroundColor: month === currentMonth ? COLORS.primary : COLORS.border
              }]} />
              <Text style={styles.barLabel}>{month.slice(5)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Category Breakdown */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🗂️ Category Breakdown</Text>
        {sortedCats.length === 0 ? (
          <Text style={styles.emptyText}>No expenses this month</Text>
        ) : (
          sortedCats.map(([cat, amount]) => {
            const pct = totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0;
            return (
              <View key={cat} style={{ marginBottom: 12 }}>
                <View style={styles.catRow}>
                  <Text style={styles.catName} numberOfLines={1}>{cat}</Text>
                  <Text style={styles.catAmount}>{formatRM(amount)} ({pct.toFixed(0)}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: COLORS.primary }]} />
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Tax Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🏛️ Tax Deductible Summary ({currentYear})</Text>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Total Tax-Deductible Expenses</Text>
          <Text style={[styles.calcValue, { color: COLORS.success }]}>{formatRM(totalTaxDeductible)}</Text>
        </View>
        <View style={styles.calcRow}>
          <Text style={styles.calcLabel}>Total Receipts with Tax Relief</Text>
          <Text style={styles.calcValue}>{taxDeductible.length}</Text>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);
  const [taxClaims, setTaxClaims] = useState([]);

  // Load data on startup
  useEffect(() => {
    const loadAll = async () => {
      const [e, b, s, t] = await Promise.all([
        loadData('expenses', []),
        loadData('budgets', []),
        loadData('savings', []),
        loadData('taxClaims', []),
      ]);
      setExpenses(e);
      setBudgets(b);
      setSavings(s);
      setTaxClaims(t);
    };
    loadAll();
  }, []);

  // Save expense
  const handleSaveExpense = async (expense) => {
    const updated = [expense, ...expenses];
    setExpenses(updated);
    await saveData('expenses', updated);

    // Auto-create tax claim if expense is tax deductible
    if (expense.taxDeductible && expense.taxReliefId) {
      const claim = {
        id: generateId(),
        reliefId: expense.taxReliefId,
        reliefName: expense.taxReliefName,
        amount: expense.amount,
        year: getCurrentYear(),
        date: expense.date,
        note: expense.title,
        expenseId: expense.id,
        createdAt: new Date().toISOString(),
      };
      const updatedClaims = [claim, ...taxClaims];
      setTaxClaims(updatedClaims);
      await saveData('taxClaims', updatedClaims);
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    await saveData('expenses', updated);
  };

  // Save budget
  const handleSaveBudget = async (budget) => {
    const updated = [budget, ...budgets];
    setBudgets(updated);
    await saveData('budgets', updated);
  };

  // Delete budget
  const handleDeleteBudget = async (id) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    await saveData('budgets', updated);
  };

  // Save savings goal
  const handleSaveGoal = async (goal) => {
    const updated = [goal, ...savings];
    setSavings(updated);
    await saveData('savings', updated);
  };

  // Update savings goal
  const handleUpdateGoal = async (goal) => {
    const updated = savings.map(s => s.id === goal.id ? goal : s);
    setSavings(updated);
    await saveData('savings', updated);
  };

  // Delete savings goal
  const handleDeleteGoal = async (id) => {
    const updated = savings.filter(s => s.id !== id);
    setSavings(updated);
    await saveData('savings', updated);
  };

  // Save tax claim
  const handleSaveClaim = async (claim) => {
    const updated = [claim, ...taxClaims];
    setTaxClaims(updated);
    await saveData('taxClaims', updated);
  };

  // Delete tax claim
  const handleDeleteClaim = async (id) => {
    const updated = taxClaims.filter(t => t.id !== id);
    setTaxClaims(updated);
    await saveData('taxClaims', updated);
  };

  const handleNavigate = (tab) => setActiveTab(tab);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen expenses={expenses} budgets={budgets} savings={savings} taxClaims={taxClaims} onNavigate={handleNavigate} />;
      case 'expenses':
        return <ExpenseListScreen expenses={expenses} onNavigate={handleNavigate} onDelete={handleDeleteExpense} />;
      case 'addExpense':
        return <AddExpenseScreen onSave={handleSaveExpense} onBack={() => setActiveTab('expenses')} />;
      case 'budget':
        return <BudgetScreen expenses={expenses} budgets={budgets} onSaveBudget={handleSaveBudget} onDeleteBudget={handleDeleteBudget} />;
      case 'savings':
        return <SavingsScreen savings={savings} onSaveGoal={handleSaveGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} />;
      case 'tax':
        return <TaxReliefScreen expenses={expenses} taxClaims={taxClaims} onSaveClaim={handleSaveClaim} onDeleteClaim={handleDeleteClaim} />;
      case 'reports':
        return <ReportScreen expenses={expenses} taxClaims={taxClaims} />;
      default:
        return <DashboardScreen expenses={expenses} budgets={budgets} savings={savings} taxClaims={taxClaims} onNavigate={handleNavigate} />;
    }
  };

  const TABS = [
    { id: 'dashboard', icon: '🏠', label: 'Home' },
    { id: 'expenses', icon: '🧾', label: 'Expenses' },
    { id: 'budget', icon: '📊', label: 'Budget' },
    { id: 'savings', icon: '🐷', label: 'Savings' },
    { id: 'tax', icon: '🏛️', label: 'Tax' },
    { id: 'reports', icon: '📈', label: 'Reports' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Kalai Money 💎"
        subtitle={activeTab === 'addExpense' ? 'Add Expense' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        onBack={activeTab === 'addExpense' ? () => setActiveTab('expenses') : null}
      />

      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navTab}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.navIcon, activeTab === tab.id && styles.navIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.navLabel, activeTab === tab.id && styles.navLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  screen: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerEmoji: { fontSize: 28 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#DDD', fontSize: 12 },
  backBtn: { marginBottom: 8 },
  backBtnText: { color: 'white', fontSize: 14 },

  // Cards
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, margin: 8, marginHorizontal: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardCompleted: { borderColor: COLORS.gold, borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  statCard: { width: (width - 48) / 2, backgroundColor: COLORS.card, borderRadius: 12, padding: 14, margin: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  statIcon: { fontSize: 24, marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.textLight },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },

  // Summary Banner
  summaryBanner: { backgroundColor: COLORS.primary, padding: 20, margin: 12, borderRadius: 16, alignItems: 'center' },
  summaryLabel: { color: '#DDD', fontSize: 13 },
  summaryAmount: { color: 'white', fontSize: 32, fontWeight: 'bold', marginVertical: 4 },
  summaryCount: { color: '#EEE', fontSize: 12 },

  // Welcome
  welcomeBanner: { padding: 16, paddingBottom: 4 },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  welcomeDate: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },

  // Progress Bar
  progressBarBg: { height: 10, backgroundColor: '#EEE', borderRadius: 5, overflow: 'hidden', marginVertical: 6 },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 11, color: COLORS.textLight },

  // Alert
  alertBanner: { padding: 8, borderRadius: 8, marginTop: 8, alignItems: 'center' },

  // Expenses
  expenseItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  expenseItemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  expenseItemInfo: { flex: 1 },
  expenseItemTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  expenseItemCat: { fontSize: 11, color: COLORS.textLight },
  expenseItemRight: { alignItems: 'flex-end' },
  expenseItemAmount: { fontSize: 14, fontWeight: 'bold', color: COLORS.danger },

  expenseRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  expenseCatIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  expenseInfo: { flex: 1 },
  expenseTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  expenseMeta: { fontSize: 11, color: COLORS.textLight },
  expenseNote: { fontSize: 11, color: '#888', fontStyle: 'italic' },
  expenseAmountCol: { alignItems: 'flex-end', minWidth: 80 },
  expenseAmount: { fontSize: 15, fontWeight: 'bold', color: COLORS.danger },
  deleteBtn: { fontSize: 18, marginTop: 4 },
  taxTag: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
  receiptTag: { fontSize: 10, color: COLORS.primary },
  dateGroupHeader: { fontSize: 13, fontWeight: 'bold', color: COLORS.textLight, marginBottom: 8 },

  // Form
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.text, backgroundColor: '#FAFAFA' },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  helperText: { fontSize: 12, color: COLORS.textLight, fontStyle: 'italic', marginTop: 8, lineHeight: 18 },

  // Buttons
  button: { padding: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  saveBtn: { margin: 12 },
  addBtn: { margin: 12, marginBottom: 0 },
  quickAddBtn: { backgroundColor: COLORS.primary, margin: 12, padding: 16, borderRadius: 14, alignItems: 'center' },
  quickAddText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  toggleBtn: { borderWidth: 2, borderColor: COLORS.primary, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 10 },
  toggleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleBtnText: { fontWeight: '600', fontSize: 14, color: COLORS.primary },
  pickerBtn: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, backgroundColor: '#FAFAFA' },
  pickerBtnText: { fontSize: 14, color: COLORS.text },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: COLORS.text },
  modalItem: { padding: 14, borderRadius: 10, marginBottom: 4 },
  modalItemActive: { backgroundColor: COLORS.primary },
  modalItemText: { fontSize: 15, color: COLORS.text },
  taxModalItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginBottom: 4 },
  taxModalIcon: { fontSize: 24, marginRight: 10 },
  taxModalName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  taxModalMax: { fontSize: 11, color: COLORS.textLight },

  // Tax Relief
  reliefInfo: { backgroundColor: '#F0EBF8', borderRadius: 8, padding: 10, marginTop: 4 },
  reliefInfoText: { fontSize: 12, color: COLORS.primaryDark, lineHeight: 20 },
  reliefHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  reliefIcon: { fontSize: 28 },
  reliefName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, flex: 1 },
  reliefCat: { fontSize: 11, color: COLORS.textLight },
  reliefMax: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  reliefDetail: { backgroundColor: COLORS.bg, borderRadius: 8, padding: 10, marginTop: 10 },
  reliefDetailText: { fontSize: 13, color: COLORS.text, lineHeight: 22 },
  claimItem: { flexDirection: 'row', alignItems: 'center', marginTop: 6, padding: 8, backgroundColor: 'white', borderRadius: 6 },
  claimItemText: { fontSize: 12, color: COLORS.text },
  claimDate: { fontSize: 10, color: COLORS.textLight },

  // Tax Calculator
  calcResult: { backgroundColor: '#F0EBF8', borderRadius: 12, padding: 14, marginTop: 12 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#DDD' },
  calcLabel: { fontSize: 13, color: COLORS.textLight, flex: 1 },
  calcValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  calcDivider: { borderTopWidth: 2, borderTopColor: COLORS.primary, marginVertical: 6 },
  calcHighlight: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, marginTop: 4 },
  calcSavedLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.success },
  calcSavedValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.success },

  // Tax Brackets
  bracketRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  bracketRange: { fontSize: 13, color: COLORS.text },
  bracketRate: { fontSize: 14, fontWeight: 'bold' },

  // Filter
  filterBar: { paddingHorizontal: 12, marginVertical: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#EEE', marginRight: 8, height: 35 },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },

  // Budget
  budgetCatName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  remainingText: { fontSize: 13, fontWeight: '600', marginTop: 4 },

  // Savings
  goalName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  savingsAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginVertical: 8 },
  currentAmount: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  ofText: { fontSize: 14, color: COLORS.textLight },
  targetAmount: { fontSize: 16, color: COLORS.textLight },
  pctText: { fontSize: 12, color: COLORS.textLight },
  needText: { fontSize: 12, color: COLORS.warning, fontWeight: '600' },

  // Report
  barChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, paddingTop: 16 },
  barGroup: { alignItems: 'center', flex: 1 },
  bar: { width: 30, borderRadius: 4, minHeight: 0 },
  barLabel: { fontSize: 10, color: COLORS.textLight, marginTop: 4 },
  barAmount: { fontSize: 9, color: COLORS.textLight, marginBottom: 2 },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: 13, color: COLORS.text, flex: 1 },
  catAmount: { fontSize: 12, color: COLORS.textLight },

  // Empty State
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textLight },
  emptySubText: { fontSize: 13, color: '#AAA', marginTop: 4, textAlign: 'center' },

  // Badge
  badge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginTop: 2 },
  badgeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },

  // Navigation
  bottomNav: { flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: Platform.OS === 'android' ? 8 : 20, paddingTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 8 },
  navTab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  navIcon: { fontSize: 22 },
  navIconActive: { transform: [{ scale: 1.2 }] },
  navLabel: { fontSize: 10, color: '#AAA', marginTop: 2 },
  navLabelActive: { color: COLORS.primary, fontWeight: '700' },

  seeAll: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
});
