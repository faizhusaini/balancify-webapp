/**
 * Balancify - Enhanced Personal Expense Tracker
 * Features: Data persistence, error handling, PWA capabilities
 */

class BalancifyApp {
    constructor() {
        this.months = new Map();
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateStats();
        this.checkOnlineStatus();
    }

    // Data Management
    saveData() {
        try {
            const data = {
                months: Object.fromEntries(this.months),
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('balancify_data', JSON.stringify(data));
            this.showMessage('Data saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            this.showMessage('Error saving data. Please try again.', 'error');
        }
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('balancify_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.months = new Map(Object.entries(data.months || {}));
                this.renderAllMonths();
                this.updateExpenseMonthDropdown();
                console.log('Data loaded successfully');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading saved data.', 'error');
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.removeItem('balancify_data');
            this.months.clear();
            document.getElementById('monthsContainer').innerHTML = '';
            this.updateExpenseMonthDropdown();
            this.updateStats();
            this.showMessage('All data cleared successfully.', 'success');
        }
    }

    // Validation Functions
    validateMonthInput(month, year, income) {
        const errors = [];

        if (!month) {
            errors.push('Please select a month');
        }

        if (!year || year < 2020 || year > 2030) {
            errors.push('Please enter a valid year between 2020 and 2030');
        }

        if (!income || income <= 0) {
            errors.push('Please enter a valid income amount');
        }

        if (income && income > 10000000) {
            errors.push('Income amount seems unreasonably high. Please verify.');
        }

        return errors;
    }

    validateExpenseInput(monthId, category, amount) {
        const errors = [];

        if (!monthId) {
            errors.push('Please select a month first');
        }

        if (!category) {
            errors.push('Please select an expense category');
        }

        if (!amount || amount <= 0) {
            errors.push('Please enter a valid expense amount');
        }

        if (amount && amount > 1000000) {
            errors.push('Expense amount seems unreasonably high. Please verify.');
        }

        return errors;
    }

    // Month Management
    addMonthTile() {
        const monthSelect = document.getElementById('monthSelect');
        const yearInput = document.getElementById('yearInput');
        const incomeInput = document.getElementById('incomeInput');
        const loadingSpinner = document.getElementById('addMonthLoading');

        const month = monthSelect.value;
        const year = parseInt(yearInput.value);
        const income = parseFloat(incomeInput.value);

        // Validation
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

        // Show loading
        loadingSpinner.style.display = 'inline-block';

        setTimeout(() => {
            try {
                // Create month data
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
                this.saveData();

                // Reset form
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
            this.saveData();
            this.showMessage('Month deleted successfully.', 'success');
        }
    }

    // Expense Management
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

        // Handle custom category
        if (category === 'Other') {
            const customCategory = otherTypeInput.value.trim();
            if (!customCategory) {
                this.showMessage('Please specify the custom category.', 'error');
                return;
            }
            category = customCategory;
        }

        // Validation
        const errors = this.validateExpenseInput(monthId, category, amount);
        if (errors.length > 0) {
            this.showMessage(errors.join('<br>'), 'error');
            return;
        }

        // Check if month exists
        if (!this.months.has(monthId)) {
            this.showMessage('Selected month not found. Please refresh and try again.', 'error');
            return;
        }

        // Show loading
        loadingSpinner.style.display = 'inline-block';

        setTimeout(() => {
            try {
                // Create expense data
                const expense = {
                    id: Date.now().toString(),
                    category: category,
                    amount: amount,
                    note: note,
                    date: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };

                // Add expense to month
                const monthData = this.months.get(monthId);
                monthData.expenses.push(expense);
                this.months.set(monthId, monthData);

                // Re-render the month tile
                this.renderMonthTile(monthData);
                this.updateStats();
                this.saveData();

                // Reset form
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
                this.saveData();
                this.showMessage('Expense deleted successfully.', 'success');
            }
        }
    }

    // Rendering Functions
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

        // Group expenses by category for summary
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
        container.innerHTML = '';

        // Sort months by year and month
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

    // UI Helper Functions
    updateExpenseMonthDropdown() {
        const select = document.getElementById('expenseMonth');
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

        document.getElementById('totalIncome').textContent = `₹${totalIncome.toLocaleString('en-IN')}`;
        document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toLocaleString('en-IN')}`;
        document.getElementById('totalBalance').textContent = `₹${totalBalance.toLocaleString('en-IN')}`;
        document.getElementById('totalBalance').style.color = totalBalance >= 0 ? '#4CAF50' : '#f44336';
        document.getElementById('monthsCount').textContent = monthsCount;
    }

    toggleOtherType() {
        const typeSelect = document.getElementById('expenseType');
        const otherGroup = document.getElementById('otherTypeGroup');
        const otherInput = document.getElementById('otherType');

        if (typeSelect.value === 'Other') {
            otherGroup.style.display = 'block';
            otherInput.required = true;
        } else {
            otherGroup.style.display = 'none';
            otherInput.required = false;
            otherInput.value = '';
        }
    }

    showMessage(message, type = 'error') {
        const errorDiv = document.getElementById('errorMessage');
        const successDiv = document.getElementById('successMessage');

        // Hide both first
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

        // Scroll to top to show message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setupEventListeners() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.checkOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.checkOnlineStatus();
        });

        // Auto-save on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveData();
            }
        });

        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
    }

    checkOnlineStatus() {
        const indicator = document.getElementById('offlineIndicator');
        if (this.isOnline) {
            indicator.style.display = 'none';
        } else {
            indicator.style.display = 'block';
        }
    }

    // Export Data (for backup)
    exportData() {
        try {
            const data = {
                months: Object.fromEntries(this.months),
                exportDate: new Date().toISOString(),
                version: '2.0'
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `balancify-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage('Data exported successfully!', 'success');
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new BalancifyApp();

    // Add keyboard shortcuts
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

// Make app globally available for debugging
window.BalancifyApp = BalancifyApp;