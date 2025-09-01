/**
 * Balancify Enhanced - Personal Expense Tracker with Analytics & Budget Planning
 * Features: Charts, Budget Planning, Advanced Analytics, Insights
 */

class BalancifyEnhancedApp {
    constructor() {
        this.months = new Map();
        this.budgets = new Map();
        this.isOnline = navigator.onLine;
        this.charts = {};
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateStats();
        this.checkOnlineStatus();
        this.initializeCharts();
        this.updateBudgetDisplay();
    }

    // ============= DATA MANAGEMENT =============
    saveData() {
        try {
            const data = {
                months: Object.fromEntries(this.months),
                budgets: Object.fromEntries(this.budgets),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('balancify_enhanced_data', JSON.stringify(data));
            this.showMessage('Data saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('Error saving data. Please try again.', 'error');
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('balancify_enhanced_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.months = new Map(Object.entries(data.months || {}));
                this.budgets = new Map(Object.entries(data.budgets || {}));
                this.renderAllMonths();
                this.updateExpenseMonthDropdown();
                this.updateBudgetDisplay();
                console.log('Enhanced data loaded successfully');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading saved data.', 'error');
        }
    }

    // ============= CHART INITIALIZATION =============
    initializeCharts() {
        this.initExpensePieChart();
        this.initMonthlyTrendChart();
        this.initIncomeExpenseChart();
        this.initBudgetActualChart();
        this.initBudgetProgressChart();
    }

    initExpensePieChart() {
        const ctx = document.getElementById('expensePieChart');
        if (!ctx) return;

        this.charts.expensePie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
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
                        labels: {
                            padding: 20,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    initMonthlyTrendChart() {
        const ctx = document.getElementById('monthlyTrendChart');
        if (!ctx) return;

        this.charts.monthlyTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Monthly Expenses',
                    data: [],
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }, {
                    label: 'Monthly Income',
                    data: [],
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { padding: 20 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }

    initIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;

        this.charts.incomeExpense = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Income',
                    data: [],
                    backgroundColor: '#4CAF50',
                    borderColor: '#45a049',
                    borderWidth: 1
                }, {
                    label: 'Expenses',
                    data: [],
                    backgroundColor: '#f44336',
                    borderColor: '#da190b',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { padding: 20 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }

    initBudgetActualChart() {
        const ctx = document.getElementById('budgetActualChart');
        if (!ctx) return;

        this.charts.budgetActual = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Budget',
                    data: [],
                    backgroundColor: '#2196F3',
                    borderColor: '#1976D2',
                    borderWidth: 1
                }, {
                    label: 'Actual Spending',
                    data: [],
                    backgroundColor: '#ff9800',
                    borderColor: '#f57c00',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { padding: 20 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString('en-IN');
                            }
                        }
                    }
                }
            }
        });
    }

    initBudgetProgressChart() {
        const ctx = document.getElementById('budgetProgressChart');
        if (!ctx) return;

        this.charts.budgetProgress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#4CAF50', '#ff9800', '#f44336', '#2196F3',
                        '#9c27b0', '#00bcd4', '#ff5722', '#795548'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                return `${label}: ${value.toFixed(1)}% utilized`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ============= CHART UPDATE METHODS =============
    updateAllCharts() {
        this.updateExpensePieChart();
        this.updateMonthlyTrendChart();
        this.updateIncomeExpenseChart();
        this.updateBudgetActualChart();
    }

    updateExpensePieChart() {
        if (!this.charts.expensePie) return;

        const categoryTotals = {};

        this.months.forEach(monthData => {
            monthData.expenses.forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            });
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        this.charts.expensePie.data.labels = labels;
        this.charts.expensePie.data.datasets[0].data = data;
        this.charts.expensePie.update();
    }

    updateMonthlyTrendChart() {
        if (!this.charts.monthlyTrend) return;

        const monthlyData = {};

        this.months.forEach(monthData => {
            const monthKey = `${monthData.month} ${monthData.year}`;
            const totalExpenses = monthData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

            monthlyData[monthKey] = {
                expenses: totalExpenses,
                income: monthData.income
            };
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const expenseData = sortedMonths.map(month => monthlyData[month].expenses);
        const incomeData = sortedMonths.map(month => monthlyData[month].income);

        this.charts.monthlyTrend.data.labels = sortedMonths;
        this.charts.monthlyTrend.data.datasets[0].data = expenseData;
        this.charts.monthlyTrend.data.datasets[1].data = incomeData;
        this.charts.monthlyTrend.update();
    }

    updateIncomeExpenseChart() {
        if (!this.charts.incomeExpense) return;

        const monthlyData = {};

        this.months.forEach(monthData => {
            const monthKey = `${monthData.month.substr(0,3)} ${monthData.year}`;
            const totalExpenses = monthData.expenses.reduce((sum, exp) => sum + exp.amount, 0);

            monthlyData[monthKey] = {
                expenses: totalExpenses,
                income: monthData.income
            };
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const expenseData = sortedMonths.map(month => monthlyData[month].expenses);
        const incomeData = sortedMonths.map(month => monthlyData[month].income);

        this.charts.incomeExpense.data.labels = sortedMonths;
        this.charts.incomeExpense.data.datasets[0].data = incomeData;
        this.charts.incomeExpense.data.datasets[1].data = expenseData;
        this.charts.incomeExpense.update();
    }

    updateBudgetActualChart() {
        if (!this.charts.budgetActual) return;

        const budgetData = [];
        const actualData = [];
        const labels = [];

        this.budgets.forEach((budget, category) => {
            const actualSpending = this.getCategorySpending(category);

            labels.push(category);
            budgetData.push(budget.amount);
            actualData.push(actualSpending);
        });

        this.charts.budgetActual.data.labels = labels;
        this.charts.budgetActual.data.datasets[0].data = budgetData;
        this.charts.budgetActual.data.datasets[1].data = actualData;
        this.charts.budgetActual.update();
    }

    updateBudgetChart() {
        if (!this.charts.budgetProgress) return;

        const labels = [];
        const data = [];

        this.budgets.forEach((budget, category) => {
            const actualSpending = this.getCategorySpending(category);
            const utilizationRate = budget.amount > 0 ? (actualSpending / budget.amount) * 100 : 0;

            labels.push(`${category} (₹${actualSpending.toLocaleString('en-IN')} / ₹${budget.amount.toLocaleString('en-IN')})`);
            data.push(Math.min(utilizationRate, 100)); // Cap at 100%
        });

        this.charts.budgetProgress.data.labels = labels;
        this.charts.budgetProgress.data.datasets[0].data = data;
        this.charts.budgetProgress.update();
    }

    // ============= BUDGET MANAGEMENT =============
    setBudget() {
        const categorySelect = document.getElementById('budgetCategory');
        const amountInput = document.getElementById('budgetAmount');
        const periodSelect = document.getElementById('budgetPeriod');

        const category = categorySelect.value;
        const amount = parseFloat(amountInput.value);
        const period = periodSelect.value;

        if (!category || !amount || amount <= 0) {
            this.showMessage('Please select a valid category and amount.', 'error');
            return;
        }

        const budget = {
            category: category,
            amount: amount,
            period: period,
            createdAt: new Date().toISOString()
        };

        this.budgets.set(category, budget);
        this.updateBudgetDisplay();
        this.updateBudgetChart();
        this.saveData();

        // Reset form
        categorySelect.value = '';
        amountInput.value = '';

        this.showMessage(`Budget set for ${category}: ₹${amount.toLocaleString('en-IN')}`, 'success');
    }

    deleteBudget(category) {
        if (confirm(`Are you sure you want to delete the budget for ${category}?`)) {
            this.budgets.delete(category);
            this.updateBudgetDisplay();
            this.updateBudgetChart();
            this.saveData();
            this.showMessage('Budget deleted successfully.', 'success');
        }
    }

    updateBudgetDisplay() {
        const budgetList = document.getElementById('budgetList');
        const budgetAlerts = document.getElementById('budgetAlerts');

        if (!budgetList || !budgetAlerts) return;

        budgetList.innerHTML = '';
        budgetAlerts.innerHTML = '';

        if (this.budgets.size === 0) {
            budgetList.innerHTML = '<p style="color: #666; font-style: italic;">No budgets set yet. Create your first budget above.</p>';
            return;
        }

        let alertsHtml = '';

        this.budgets.forEach((budget, category) => {
            const actualSpending = this.getCategorySpending(category);
            const utilizationRate = budget.amount > 0 ? (actualSpending / budget.amount) * 100 : 0;

            let progressClass = 'progress-fill';
            if (utilizationRate >= 90) {
                progressClass += ' danger';
            } else if (utilizationRate >= 70) {
                progressClass += ' warning';
            }

            // Budget alerts
            if (utilizationRate >= 100) {
                alertsHtml += `
                    <div class="alert alert-danger">
                        🚨 <strong>${category}</strong> budget exceeded!
                        Spent ₹${actualSpending.toLocaleString('en-IN')} of ₹${budget.amount.toLocaleString('en-IN')} (${utilizationRate.toFixed(1)}%)
                    </div>`;
            } else if (utilizationRate >= 80) {
                alertsHtml += `
                    <div class="alert alert-warning">
                        ⚠️ <strong>${category}</strong> budget at ${utilizationRate.toFixed(1)}%!
                        Spent ₹${actualSpending.toLocaleString('en-IN')} of ₹${budget.amount.toLocaleString('en-IN')}
                    </div>`;
            }

            budgetList.innerHTML += `
                <div class="budget-item">
                    <div class="budget-info">
                        <div class="budget-category">${category}</div>
                        <div class="budget-progress">
                            <div class="progress-bar">
                                <div class="${progressClass}" style="width: ${Math.min(utilizationRate, 100)}%"></div>
                            </div>
                            <div class="budget-amounts">
                                <span>₹${actualSpending.toLocaleString('en-IN')} spent</span>
                                <span>₹${budget.amount.toLocaleString('en-IN')} budget</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-danger" onclick="app.deleteBudget('${category}')">Delete</button>
                </div>
            `;
        });

        budgetAlerts.innerHTML = alertsHtml;
    }

    getCategorySpending(category) {
        let total = 0;
        this.months.forEach(monthData => {
            monthData.expenses.forEach(expense => {
                if (expense.category === category) {
                    total += expense.amount;
                }
            });
        });
        return total;
    }

    // ============= EXPENSE & MONTH MANAGEMENT =============
    addMonthTile() {
        const monthSelect = document.getElementById('monthSelect');
        const yearInput = document.getElementById('yearInput');
        const incomeInput = document.getElementById('incomeInput');
        const loadingSpinner = document.getElementById('addMonthLoading');

        const month = monthSelect.value;
        const year = parseInt(yearInput.value);
        const income = parseFloat(incomeInput.value);

        const errors = this.validateMonthInput(month, year, income);
        if (errors.length > 0) {
            this.showMessage(errors.join('<br>'), 'error');
            return;
        }

        const monthId = `${month}-${year}`;

        if (this.months.has(monthId)) {
            this.showMessage('This month already exists!', 'error');
            return;
        }

        loadingSpinner.style.display = 'inline-block';

        setTimeout(() => {
            try {
                const monthData = {
                    id: monthId,
                    month: month,
                    year: year,
                    income: income,
                    expenses: [],
                    createdAt: new Date().toISOString()
                };

                this.months.set(monthId, monthData);
                this.renderMonthTile(monthData);
                this.updateExpenseMonthDropdown();
                this.updateStats();
                this.updateAllCharts();
                this.updateBudgetDisplay();
                this.saveData();

                monthSelect.value = '';
                incomeInput.value = '';

                this.showMessage(`Successfully added ${month} ${year}!`, 'success');
            } catch (error) {
                console.error('Error adding month:', error);
                this.showMessage('Error adding month. Please try again.', 'error');
            } finally {
                loadingSpinner.style.display = 'none';
            }
        }, 500);
    }

    deleteMonth(monthId) {
        if (confirm(`Are you sure you want to delete this month? This action cannot be undone.`)) {
            this.months.delete(monthId);
            document.getElementById(monthId)?.remove();
            this.updateExpenseMonthDropdown();
            this.updateStats();
            this.updateAllCharts();
            this.updateBudgetDisplay();
            this.saveData();
            this.showMessage('Month deleted successfully.', 'success');
        }
    }

    addExpenseEntry() {
        const monthSelect = document.getElementById('expenseMonth');
        const typeSelect = document.getElementById('expenseType');
        const otherTypeInput = document.getElementById('otherType');
        const amountInput = document.getElementById('expenseAmount');
        const noteInput = document.getElementById('expenseNote');
        const loadingSpinner = document.getElementById('addExpenseLoading');

        const monthId = monthSelect.value;
        let category = typeSelect.value;
        const amount = parseFloat(amountInput.value);
        const note = noteInput.value.trim();

        if (category === 'Other') {
            const customCategory = otherTypeInput.value.trim();
            if (!customCategory) {
                this.showMessage('Please specify the custom category.', 'error');
                return;
            }
            category = customCategory;
        }

        const errors = this.validateExpenseInput(monthId, category, amount);
        if (errors.length > 0) {
            this.showMessage(errors.join('<br>'), 'error');
            return;
        }

        if (!this.months.has(monthId)) {
            this.showMessage('Selected month not found. Please refresh and try again.', 'error');
            return;
        }

        loadingSpinner.style.display = 'inline-block';

        setTimeout(() => {
            try {
                const expense = {
                    id: Date.now().toString(),
                    category: category,
                    amount: amount,
                    note: note,
                    date: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };

                const monthData = this.months.get(monthId);
                monthData.expenses.push(expense);
                this.months.set(monthId, monthData);

                this.renderMonthTile(monthData);
                this.updateStats();
                this.updateAllCharts();
                this.updateBudgetDisplay();
                this.saveData();

                typeSelect.value = '';
                amountInput.value = '';
                noteInput.value = '';
                this.toggleOtherType();

                this.showMessage(`Added ₹${amount.toFixed(2)} expense for ${category}!`, 'success');
            } catch (error) {
                console.error('Error adding expense:', error);
                this.showMessage('Error adding expense. Please try again.', 'error');
            } finally {
                loadingSpinner.style.display = 'none';
            }
        }, 300);
    }

    deleteExpense(monthId, expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            const monthData = this.months.get(monthId);
            if (monthData) {
                monthData.expenses = monthData.expenses.filter(exp => exp.id !== expenseId);
                this.months.set(monthId, monthData);
                this.renderMonthTile(monthData);
                this.updateStats();
                this.updateAllCharts();
                this.updateBudgetDisplay();
                this.saveData();
                this.showMessage('Expense deleted successfully.', 'success');
            }
        }
    }

    // ============= VALIDATION =============
    validateMonthInput(month, year, income) {
        const errors = [];
        if (!month) errors.push('Please select a month');
        if (!year || year < 2020 || year > 2030) errors.push('Please enter a valid year between 2020 and 2030');
        if (!income || income <= 0) errors.push('Please enter a valid income amount');
        if (income && income > 10000000) errors.push('Income amount seems unreasonably high. Please verify.');
        return errors;
    }

    validateExpenseInput(monthId, category, amount) {
        const errors = [];
        if (!monthId) errors.push('Please select a month first');
        if (!category) errors.push('Please select an expense category');
        if (!amount || amount <= 0) errors.push('Please enter a valid expense amount');
        if (amount && amount > 1000000) errors.push('Expense amount seems unreasonably high. Please verify.');
        return errors;
    }

    // ============= RENDERING =============
    renderMonthTile(monthData) {
        const existingTile = document.getElementById(monthData.id);
        if (existingTile) {
            existingTile.remove();
        }

        const container = document.getElementById('monthsContainer');
        const tile = document.createElement('div');
        tile.className = 'month-tile';
        tile.id = monthData.id;

        const totalExpenses = monthData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const balance = monthData.income - totalExpenses;
        const balanceClass = balance >= 0 ? 'positive-balance' : 'negative-balance';

        const categoryTotals = {};
        monthData.expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });

        tile.innerHTML = `
            <div class="month-title">
                ${monthData.month} ${monthData.year}
                <button class="btn btn-danger" onclick="app.deleteMonth('${monthData.id}')" style="float: right; margin-top: -5px;">Delete</button>
            </div>
            <div class="month-income">💰 Income: ₹${monthData.income.toLocaleString('en-IN')}</div>
            <div class="month-balance ${balanceClass}">
                📊 Balance: ₹${balance.toLocaleString('en-IN')}
            </div>

            ${Object.keys(categoryTotals).length > 0 ? `
                <div class="expense-summary">
                    <strong>Category Summary:</strong>
                    ${Object.entries(categoryTotals).map(([category, total]) => `
                        <div class="summary-row">
                            <span>${category}</span>
                            <span>₹${total.toLocaleString('en-IN')}</span>
                        </div>
                    `).join('')}
                    <div class="summary-row total-expenses">
                        <span>Total Expenses</span>
                        <span>₹${totalExpenses.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            ` : ''}

            <div class="expenses-list">
                ${monthData.expenses.length > 0 ?
                    monthData.expenses.map(expense => `
                        <div class="expense-item">
                            <div class="expense-info">
                                <div class="expense-category">${expense.category}</div>
                                <div class="expense-date">${new Date(expense.date).toLocaleDateString('en-IN')}</div>
                                ${expense.note ? `<div class="expense-note" style="font-size: 0.9rem; color: #666; font-style: italic;">${expense.note}</div>` : ''}
                            </div>
                            <div>
                                <div class="expense-amount">₹${expense.amount.toLocaleString('en-IN')}</div>
                                <button class="btn btn-danger" onclick="app.deleteExpense('${monthData.id}', '${expense.id}')">Delete</button>
                            </div>
                        </div>
                    `).join('') :
                    '<p style="color: #666; font-style: italic; text-align: center; padding: 20px;">No expenses added yet</p>'
                }
            </div>
        `;

        container.appendChild(tile);
    }

    renderAllMonths() {
        const container = document.getElementById('monthsContainer');
        if (!container) return;

        container.innerHTML = '';

        const sortedMonths = Array.from(this.months.values()).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
        });

        sortedMonths.forEach(monthData => {
            this.renderMonthTile(monthData);
        });
    }

    // ============= UI HELPERS =============
    updateExpenseMonthDropdown() {
        const select = document.getElementById('expenseMonth');
        if (!select) return;

        select.innerHTML = '<option value="">Choose month...</option>';

        const sortedMonths = Array.from(this.months.values()).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
        });

        sortedMonths.forEach(monthData => {
            const option = document.createElement('option');
            option.value = monthData.id;
            option.textContent = `${monthData.month} ${monthData.year}`;
            select.appendChild(option);
        });
    }

    updateStats() {
        let totalIncome = 0;
        let totalExpenses = 0;
        let monthsCount = this.months.size;

        this.months.forEach(monthData => {
            totalIncome += monthData.income;
            totalExpenses += monthData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        });

        const totalBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

        // Calculate budget utilization
        let totalBudget = 0;
        let totalBudgetSpent = 0;

        this.budgets.forEach((budget, category) => {
            totalBudget += budget.amount;
            totalBudgetSpent += this.getCategorySpending(category);
        });

        const budgetUtilization = totalBudget > 0 ? (totalBudgetSpent / totalBudget * 100) : 0;

        // Update UI
        document.getElementById('totalIncome').textContent = `₹${totalIncome.toLocaleString('en-IN')}`;
        document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toLocaleString('en-IN')}`;
        document.getElementById('totalBalance').textContent = `₹${totalBalance.toLocaleString('en-IN')}`;
        document.getElementById('totalBalance').style.color = totalBalance >= 0 ? '#4CAF50' : '#f44336';
        document.getElementById('monthsCount').textContent = monthsCount;
        document.getElementById('budgetUtilization').textContent = `${budgetUtilization.toFixed(1)}%`;
        document.getElementById('savingsRate').textContent = `${savingsRate.toFixed(1)}%`;

        // Update savings rate color
        const savingsElement = document.getElementById('savingsRate');
        if (savingsRate >= 20) {
            savingsElement.style.color = '#4CAF50';
        } else if (savingsRate >= 10) {
            savingsElement.style.color = '#ff9800';
        } else {
            savingsElement.style.color = '#f44336';
        }
    }

    toggleOtherType() {
        const typeSelect = document.getElementById('expenseType');
        const otherGroup = document.getElementById('otherTypeGroup');
        const otherInput = document.getElementById('otherType');

        if (typeSelect && otherGroup && otherInput) {
            if (typeSelect.value === 'Other') {
                otherGroup.style.display = 'block';
                otherInput.required = true;
            } else {
                otherGroup.style.display = 'none';
                otherInput.required = false;
                otherInput.value = '';
            }
        }
    }

    showMessage(message, type = 'error') {
        const errorDiv = document.getElementById('errorMessage');
        const successDiv = document.getElementById('successMessage');

        if (!errorDiv || !successDiv) return;

        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        if (type === 'error') {
            errorDiv.innerHTML = message;
            errorDiv.style.display = 'block';
            setTimeout(() => errorDiv.style.display = 'none', 5000);
        } else {
            successDiv.innerHTML = message;
            successDiv.style.display = 'block';
            setTimeout(() => successDiv.style.display = 'none', 3000);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.checkOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.checkOnlineStatus();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveData();
            }
        });

        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    checkOnlineStatus() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            if (this.isOnline) {
                indicator.style.display = 'none';
            } else {
                indicator.style.display = 'block';
            }
        }
    }

    exportData() {
        try {
            const data = {
                months: Object.fromEntries(this.months),
                budgets: Object.fromEntries(this.budgets),
                exportDate: new Date().toISOString(),
                version: '2.1-enhanced'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `balancify-enhanced-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage('Enhanced data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Error exporting data.', 'error');
        }
    }
}

// Global functions for HTML onclick events
let app;

function addMonthTile() {
    app.addMonthTile();
}

function addExpenseEntry() {
    app.addExpenseEntry();
}

function toggleOtherType() {
    app.toggleOtherType();
}

function setBudget() {
    app.setBudget();
}

// Initialize enhanced app
document.addEventListener('DOMContentLoaded', () => {
    app = new BalancifyEnhancedApp();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    app.saveData();
                    break;
                case 'e':
                    e.preventDefault();
                    app.exportData();
                    break;
            }
        }
    });
});

// Make app globally available
window.BalancifyEnhancedApp = BalancifyEnhancedApp;