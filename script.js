const Modal = {
    toggle() {
        document.querySelector('.modal-overlay').classList.toggle('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finance:transactions')) || [];
    },

    set(transactions) {
        localStorage.setItem('dev.finance:transactions', JSON.stringify(transactions));
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const tableModel = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = tableModel.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        tableModel.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSClass = transaction.amount > 0 ? 'income' : 'expense';
        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onClick="Transaction.remove(${index})" src="./assets/minus.svg" alt="remover transação">
        </td>
    `
        return html
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        tableModel.transactionContainer.innerHTML = '';
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100;
        // ou value = Number(value.replace(/\,\./g, "")) * 100;
        return value;
    },

    formatDate(date) {
        const splitedDate = date.split('-');
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`;
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");
        value = value / 100;
        value = value.toLocaleString("pt-BR", {
            style: 'currency',
            currency: 'BRL'
        })

        return signal + value;
    }
}

const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();
        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos');
        }
    },

    formatData() {
        let { description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        return (
            {
                description,
                amount,
                date
            }
        )
    },

    saveTransaction(transaction) {
        Transaction.add(transaction);
    },

    clearFields() {
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    },

    submit(event) {
        event.preventDefault();
        try {
            Form.validateFields();
            const transaction = Form.formatData();
            console.log(transaction);
            Form.saveTransaction(transaction);
            Form.clearFields();
            Modal.toggle();
        } catch (error) {
            alert(error.message);
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(tableModel.addTransaction);
        tableModel.updateBalance();
        Storage.set(Transaction.all);
    },
    reload() {
        tableModel.clearTransactions();
        App.init();
    }
}

App.init();