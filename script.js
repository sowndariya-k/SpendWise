// Global variables
let currentUser = null;
let expenses = [];
let savingsGoal = 1000;
let lineChart = null;
let pieChart = null;
let filteredExpenses = [];

// DOM elements
const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expenseModal = document.getElementById('expenseModal');
const goalModal = document.getElementById('goalModal');
const expenseForm = document.getElementById('expenseForm');
const goalForm = document.getElementById('goalForm');
const alert = document.getElementById('alert');
// Statement
const statementModal = document.getElementById('statementModal');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();
    // simplified app, no theme/reports
    
    if (currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
});

// Event Listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Add expense
    addExpenseBtn.addEventListener('click', () => openExpenseModal());
    const fab = document.getElementById('fabAddExpense');
    if (fab) fab.addEventListener('click', () => openExpenseModal());
    
    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeExpenseModal);
    document.getElementById('closeGoalModal').addEventListener('click', closeGoalModal);
    document.getElementById('closeStatementModal').addEventListener('click', closeStatementModal);
    document.getElementById('cancelExpense').addEventListener('click', closeExpenseModal);
    document.getElementById('cancelGoal').addEventListener('click', closeGoalModal);
    // Statement modal actions
    document.getElementById('printStatementBtn').addEventListener('click', printStatement);
    
    // Forms
    expenseForm.addEventListener('submit', handleExpenseSubmit);
    goalForm.addEventListener('submit', handleGoalSubmit);
    // no budget form
    
    // Set goal button
    document.getElementById('setGoalBtn').addEventListener('click', openGoalModal);
    
    // Simple actions
    document.getElementById('statementBtn').addEventListener('click', openStatementModal);
    document.getElementById('clearAllBtn').addEventListener('click', clearAllData);
    
    // Alert close
    document.getElementById('closeAlert').addEventListener('click', hideAlert);
    
    // Category cards click to add expense
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            openExpenseModal(category);
        });
    });
    
    // Expense controls
    document.getElementById('expenseSearch').addEventListener('input', filterExpenses);
    document.getElementById('categoryFilter').addEventListener('change', filterExpenses);
    document.getElementById('sortBy').addEventListener('change', filterExpenses);
    // no export button, no report controls
    
    // Close modals on outside click
    expenseModal.addEventListener('click', function(e) {
        if (e.target === this) closeExpenseModal();
    });
    
    goalModal.addEventListener('click', function(e) {
        if (e.target === this) closeGoalModal();
    });
    
    statementModal.addEventListener('click', function(e) {
        if (e.target === this) closeStatementModal();
    });
}

// Login functionality
function handleLogin(e) {
    e.preventDefault();
    
    const userName = document.getElementById('userName').value.trim();
    const startingBalance = parseFloat(document.getElementById('startingBalance').value);
    
    if (!userName || isNaN(startingBalance) || startingBalance < 0) {
        showAlert('Please enter valid name and starting balance');
        return;
    }
    
    currentUser = {
        name: userName,
        startingBalance: startingBalance,
        currentBalance: startingBalance
    };
    
    saveUserData();
    showDashboard();
}

function handleLogout() {
    currentUser = null;
    expenses = [];
    filteredExpenses = [];
    budgetLimits = {
        entertainment: 0,
        grocery: 0,
        rent: 0,
        bills: 0,
        personal: 0
    };
    localStorage.removeItem('spendWiseUser');
    localStorage.removeItem('spendWiseExpenses');
    localStorage.removeItem('spendWiseGoal');
    localStorage.removeItem('spendWiseBudgets');
    localStorage.removeItem('spendWiseTheme');
    showLogin();
}

// Page management
function showLogin() {
    loginPage.classList.add('active');
    dashboardPage.classList.remove('active');
    document.getElementById('userName').value = '';
    document.getElementById('startingBalance').value = '';
}

function showDashboard() {
    loginPage.classList.remove('active');
    dashboardPage.classList.add('active');
    
    document.getElementById('welcomeUser').textContent = `Welcome, ${currentUser.name}!`;
    updateDashboard();
    initializeCharts();
    // no monthly report
}

// Data management
function loadUserData() {
    const userData = localStorage.getItem('spendWiseUser');
    const expensesData = localStorage.getItem('spendWiseExpenses');
    const goalData = localStorage.getItem('spendWiseGoal');
    // simplified: no budgets or themes
    
    if (userData) {
        currentUser = JSON.parse(userData);
    }
    
    if (expensesData) {
        expenses = JSON.parse(expensesData);
        filteredExpenses = [...expenses];
    }
    
    if (goalData) {
        savingsGoal = parseFloat(goalData);
    }
    
    // no-op
}

function saveUserData() {
    if (currentUser) {
        localStorage.setItem('spendWiseUser', JSON.stringify(currentUser));
    }
    localStorage.setItem('spendWiseExpenses', JSON.stringify(expenses));
    localStorage.setItem('spendWiseGoal', savingsGoal.toString());
    // simplified: no budgets or themes
}

// Dashboard updates
function updateDashboard() {
    updateBalance();
    updateCategories();
    updateExpensesList();
    updateSavingsProgress();
    checkLowBalance();
    // no budget alerts
}

function updateBalance() {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBalance = currentUser.startingBalance - totalSpent;
    
    currentUser.currentBalance = remainingBalance;
    
    document.getElementById('totalBalance').textContent = `$${remainingBalance.toFixed(2)}`;
    document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    document.getElementById('remainingBalance').textContent = `$${remainingBalance.toFixed(2)}`;
    
    saveUserData();
}

function updateCategories() {
    const categories = ['entertainment', 'grocery', 'rent', 'bills', 'personal'];
    
    categories.forEach(category => {
        const categoryExpenses = expenses.filter(expense => expense.category === category);
        const totalAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const count = categoryExpenses.length;
        
        document.getElementById(`${category}Amount`).textContent = `$${totalAmount.toFixed(2)}`;
        document.getElementById(`${category}Count`).textContent = `${count} expenses`;
    });
}

function updateExpensesList() {
    const expensesList = document.getElementById('expensesList');
    expensesList.innerHTML = '';
    
    if (filteredExpenses.length === 0) {
        expensesList.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No expenses found. Add your first expense!</div>';
        return;
    }
    
    filteredExpenses.forEach(expense => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">${expense.description}</div>
                <div class="expense-category">${expense.category} • ${new Date(expense.date).toLocaleDateString()}</div>
            </div>
            <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            <div class="expense-actions">
                <button onclick="editExpense(${expense.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteExpense(${expense.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        expensesList.appendChild(expenseItem);
    });
}

function updateSavingsProgress() {
    const personalExpenses = expenses.filter(expense => expense.category === 'personal');
    const savingsAmount = personalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const progressPercentage = Math.min((savingsAmount / savingsGoal) * 100, 100);
    
    document.getElementById('savingsAmount').textContent = `$${savingsAmount.toFixed(2)}`;
    document.getElementById('savingsGoal').textContent = `$${savingsGoal.toFixed(2)}`;
    document.getElementById('savingsProgress').style.width = `${progressPercentage}%`;
}

// simplified: removed budget limits UI

function checkLowBalance() {
    const remainingBalance = currentUser.currentBalance;
    const lowBalanceThreshold = currentUser.startingBalance * 0.1; // 10% of starting balance
    
    if (remainingBalance < lowBalanceThreshold && remainingBalance > 0) {
        showAlert(`Low balance warning! You have $${remainingBalance.toFixed(2)} remaining.`);
    } else if (remainingBalance <= 0) {
        showAlert(`You've exceeded your budget! Current balance: $${remainingBalance.toFixed(2)}`);
    }
}

// simplified: removed budget alerts

// Expense management
function openExpenseModal(category = '') {
    document.getElementById('modalTitle').textContent = 'Add Expense';
    document.getElementById('expenseForm').reset();
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    if (category) {
        document.getElementById('expenseCategory').value = category;
    }
    
    expenseModal.classList.add('active');
}

function closeExpenseModal() {
    expenseModal.classList.remove('active');
    expenseForm.dataset.editingId = '';
}

function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const editingId = expenseForm.dataset.editingId;
    const description = document.getElementById('expenseDescription').value.trim();
    let amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;
    
    if (!description || !category || !date) {
        showAlert('Please fill in description, category and date');
        return;
    }
    if (isNaN(amount) || amount < 0) {
        amount = 0;
    }
    
    if (editingId) {
        // Update existing expense
        const expenseIndex = expenses.findIndex(exp => exp.id == editingId);
        if (expenseIndex !== -1) {
            expenses[expenseIndex] = {
                ...expenses[expenseIndex],
                description,
                amount,
                category,
                date
            };
            showAlert('Expense updated successfully!', 'success');
        }
    } else {
        // Add new expense
        const expense = {
            id: Date.now(),
            description,
            amount,
            category,
            date,
            createdAt: new Date().toISOString()
        };
        
        expenses.push(expense);
        showAlert('Expense added successfully!', 'success');
    }
    
    filteredExpenses = [...expenses];
    saveUserData();
    updateDashboard();
    updateCharts();
    closeExpenseModal();
}

function editExpense(id) {
    const expense = expenses.find(exp => exp.id === id);
    if (!expense) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Expense';
    document.getElementById('expenseDescription').value = expense.description;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseDate').value = expense.date;
    
    expenseForm.dataset.editingId = id;
    expenseModal.classList.add('active');
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(exp => exp.id !== id);
        filteredExpenses = [...expenses];
        saveUserData();
        updateDashboard();
        updateCharts();
        showAlert('Expense deleted successfully!', 'success');
    }
}

// Filter and search expenses
function filterExpenses() {
    const searchTerm = document.getElementById('expenseSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    
    let filtered = [...expenses];
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(expense => 
            expense.description.toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (categoryFilter) {
        filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    // Sort
    switch (sortBy) {
        case 'date-desc':
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            filtered.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-asc':
            filtered.sort((a, b) => a.amount - b.amount);
            break;
        case 'category':
            filtered.sort((a, b) => a.category.localeCompare(b.category));
            break;
    }
    
    filteredExpenses = filtered;
    updateExpensesList();
}

// Goal management
function openGoalModal() {
    document.getElementById('savingsGoalInput').value = savingsGoal;
    goalModal.classList.add('active');
}

function closeGoalModal() {
    goalModal.classList.remove('active');
}

function handleGoalSubmit(e) {
    e.preventDefault();
    
    const goalAmount = parseFloat(document.getElementById('savingsGoalInput').value);
    
    if (isNaN(goalAmount) || goalAmount < 0) {
        showAlert('Please enter a valid goal amount');
        return;
    }
    
    savingsGoal = goalAmount;
    saveUserData();
    updateSavingsProgress();
    closeGoalModal();
    
    showAlert('Savings goal updated successfully!', 'success');
}

// Statement (printed text) and simple data clear
function openStatementModal() {
    const statement = generateStatementText(expenses);
    document.getElementById('statementText').textContent = statement;
    statementModal.classList.add('active');
}

function closeStatementModal() {
    statementModal.classList.remove('active');
}

function printStatement() {
    const text = document.getElementById('statementText').textContent;
    const win = window.open('', '', 'width=800,height=600');
    win.document.write('<pre style="font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif; white-space:pre-wrap; line-height:1.6;">' + text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
}

function generateStatementText(items) {
    if (!items || items.length === 0) {
        return 'SPENDWISE RECEIPT\n\nNo transactions available.';
    }
    const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Column widths for alignment
    const COL_DATE = 10;   // DD/MM/YY
    const COL_CAT = 12;    // Category
    const COL_DESC = 22;   // Description
    const COL_AMT = 10;    // Amount
    const COL_BAL = 12;    // Balance

    const padRight = (str, len) => (str.length > len ? str.slice(0, len - 1) + '…' : str.padEnd(len, ' '));
    const padLeft = (str, len) => (str.length > len ? str.slice(0, len) : str.padStart(len, ' '));

    const header = 'SPENDWISE RECEIPT';
    const shop = 'Thank you for using SpendWise';
    const nameLine = `Name: ${currentUser?.name || ''}`;
    const startBal = `Start: $${(currentUser?.startingBalance || 0).toFixed(2)}`;
    const line = ''.padEnd(COL_DATE + COL_CAT + COL_DESC + COL_AMT + COL_BAL + 8, '-');

    let lines = [];
    lines.push(header);
    lines.push(shop);
    lines.push(nameLine);
    lines.push(startBal);
    lines.push(line);
    lines.push(
        padRight('Date', COL_DATE) + '  ' +
        padRight('Category', COL_CAT) + '  ' +
        padRight('Description', COL_DESC) + '  ' +
        padLeft('Amount', COL_AMT) + '  ' +
        padLeft('Balance', COL_BAL)
    );
    lines.push(line);

    let running = currentUser ? currentUser.startingBalance : 0;
    sorted.forEach(exp => {
        const dateStr = new Date(exp.date).toLocaleDateString('en-GB').replace(/\d{4}/, (y) => y.slice(2)); // DD/MM/YY
        running -= exp.amount;
        const cat = (exp.category || '').toUpperCase();
        const desc = exp.description || '';
        const amtStr = ('-' + '$' + exp.amount.toFixed(2));
        const balStr = ('$' + running.toFixed(2));
        lines.push(
            padRight(dateStr, COL_DATE) + '  ' +
            padRight(cat, COL_CAT) + '  ' +
            padRight(desc, COL_DESC) + '  ' +
            padLeft(amtStr, COL_AMT) + '  ' +
            padLeft(balStr, COL_BAL)
        );
    });

    lines.push(line);
    const totalSpent = sorted.reduce((s, e) => s + e.amount, 0);
    lines.push(padRight('TOTAL', COL_DATE + COL_CAT + COL_DESC + 4) + padLeft('-$' + totalSpent.toFixed(2), COL_AMT) + '  ' + padLeft('$' + running.toFixed(2), COL_BAL));
    lines.push(line);
    lines.push('This is a computer generated receipt.');
    lines.push('');
    return lines.join('\n');
}

// simplified: removed export/import/backup/restore

function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This action cannot be undone!')) {
        localStorage.clear();
        location.reload();
    }
}

// simplified: removed theme management

// simplified: removed monthly reports

// Charts
function initializeCharts() {
    createLineChart();
    createPieChart();
}

function createLineChart() {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    if (lineChart) {
        lineChart.destroy();
    }
    
    const last7Days = getLast7Days();
    const categoryData = {};
    
    ['entertainment', 'grocery', 'rent', 'bills', 'personal'].forEach(category => {
        categoryData[category] = new Array(7).fill(0);
    });
    
    last7Days.forEach((date, index) => {
        const dayExpenses = expenses.filter(expense => 
            new Date(expense.date).toDateString() === date.toDateString()
        );
        
        dayExpenses.forEach(expense => {
            if (categoryData[expense.category]) {
                categoryData[expense.category][index] += expense.amount;
            }
        });
    });
    
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' })),
            datasets: [
                {
                    label: 'Entertainment',
                    data: categoryData.entertainment,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Grocery/Home',
                    data: categoryData.grocery,
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Rent',
                    data: categoryData.rent,
                    borderColor: '#45B7D1',
                    backgroundColor: 'rgba(69, 183, 209, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Bills',
                    data: categoryData.bills,
                    borderColor: '#96CEB4',
                    backgroundColor: 'rgba(150, 206, 180, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Personal Growth',
                    data: categoryData.personal,
                    borderColor: '#FFEAA7',
                    backgroundColor: 'rgba(255, 234, 167, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

function createPieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    if (pieChart) {
        pieChart.destroy();
    }
    
    const categoryTotals = {};
    ['entertainment', 'grocery', 'rent', 'bills', 'personal'].forEach(category => {
        categoryTotals[category] = 0;
    });
    
    expenses.forEach(expense => {
        if (categoryTotals.hasOwnProperty(expense.category)) {
            categoryTotals[expense.category] += expense.amount;
        }
    });
    
    const totalSpent = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    if (totalSpent === 0) {
        pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No expenses yet'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#E0E0E0']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
        return;
    }
    
    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Entertainment', 'Grocery/Home', 'Rent', 'Bills', 'Personal Growth'],
            datasets: [{
                data: [
                    categoryTotals.entertainment,
                    categoryTotals.grocery,
                    categoryTotals.rent,
                    categoryTotals.bills,
                    categoryTotals.personal
                ],
                backgroundColor: [
                    '#FF6B6B',
                    '#4ECDC4',
                    '#45B7D1',
                    '#96CEB4',
                    '#FFEAA7'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const percentage = ((value / totalSpent) * 100).toFixed(1);
                            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateCharts() {
    createLineChart();
    createPieChart();
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date);
    }
    return days;
}

// Alert system
function showAlert(message, type = 'error') {
    const alertElement = document.getElementById('alert');
    const alertMessage = document.getElementById('alertMessage');
    
    alertMessage.textContent = message;
    
    if (type === 'success') {
        alertElement.style.background = '#27ae60';
    } else {
        alertElement.style.background = '#e74c3c';
    }
    
    alertElement.classList.add('show');
    
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

function hideAlert() {
    document.getElementById('alert').classList.remove('show');
}