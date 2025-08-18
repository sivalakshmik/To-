class FinanceTracker {
    constructor() {
        this.transactions = this.loadFromMemory();
        this.currentFilter = 'all';
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDashboard();
        this.renderTransactions();
    }

    loadFromMemory() {
        // In-memory storage for this session
        return [];
    }

    bindEvents() {
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Filter radio buttons
        document.querySelectorAll('input[name="filter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderTransactions();
            });
        });
    }

    handleSubmit() {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.querySelector('input[name="type"]:checked').value;

        if (!description || isNaN(amount) || amount <= 0) {
            alert('Please enter valid description and amount');
            return;
        }

        const transaction = {
            id: this.editingId || Date.now(),
            description,
            amount,
            type,
            date: new Date().toLocaleDateString()
        };

        if (this.editingId) {
            const index = this.transactions.findIndex(t => t.id === this.editingId);
            this.transactions[index] = transaction;
            this.editingId = null;
            document.getElementById('formTitle').textContent = 'Add Transaction';
            document.getElementById('submitBtn').textContent = 'Add Transaction';
        } else {
            this.transactions.push(transaction);
        }

        this.resetForm();
        this.updateDashboard();
        this.renderTransactions();
    }

    resetForm() {
        document.getElementById('transactionForm').reset();
        document.getElementById('income').checked = true;
        this.editingId = null;
        document.getElementById('formTitle').textContent = 'Add Transaction';
        document.getElementById('submitBtn').textContent = 'Add Transaction';
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;

        document.getElementById('description').value = transaction.description;
        document.getElementById('amount').value = transaction.amount;
        document.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;

        this.editingId = id;
        document.getElementById('formTitle').textContent = 'Edit Transaction';
        document.getElementById('submitBtn').textContent = 'Update Transaction';
    }

    deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.updateDashboard();
            this.renderTransactions();
        }
    }

    updateDashboard() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netBalance = totalIncome - totalExpense;

        document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
        document.getElementById('totalExpense').textContent = `₹${totalExpense.toFixed(2)}`;
        document.getElementById('netBalance').textContent = `₹${netBalance.toFixed(2)}`;

        // Update balance color based on positive/negative
        const balanceElement = document.getElementById('netBalance');
        balanceElement.style.color = netBalance >= 0 ? '#28a745' : '#dc3545';
    }

    renderTransactions() {
        const container = document.getElementById('transactionsList');
        
        let filteredTransactions = this.transactions;
        if (this.currentFilter !== 'all') {
            filteredTransactions = this.transactions.filter(t => t.type === this.currentFilter);
        }

        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div>📊</div>
                    <p>${this.currentFilter === 'all' ? 'No transactions yet. Add your first transaction to get started!' : `No ${this.currentFilter} transactions found.`}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTransactions
            .sort((a, b) => b.id - a.id)
            .map(transaction => `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-type">${transaction.type} • ${transaction.date}</div>
                    </div>
                    <div class="transaction-amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn-small btn-edit" onclick="tracker.editTransaction(${transaction.id})">Edit</button>
                        <button class="btn-small btn-delete" onclick="tracker.deleteTransaction(${transaction.id})">Delete</button>
                    </div>
                </div>
            `).join('');
    }
}

// Initialize the app
const tracker = new FinanceTracker();