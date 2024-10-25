let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let chart;

const categoryIcons = {
    food: '🍔',
    clothes: '👕',
    entertainment: '🎭',
    miscellaneous: '📦'
};

function addExpense(e) {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const remarks = document.getElementById('remarks').value;

    if (amount && category) {
        const expense = {
            id: Date.now(),
            amount: parseFloat(amount),
            category,
            remarks,
            date: new Date().toLocaleDateString()
        };

        expenses.push(expense);
        updateLocalStorage();
        updateExpenseList();
        updateChart();
        e.target.reset();
    }
}

function updateExpenseList() {
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    for (const expense of expenses.slice().reverse().slice(0, 5)) {
        const li = document.createElement('li');
        li.innerHTML = `
            ${categoryIcons[expense.category]} ${expense.category}: ₹${expense.amount.toFixed(2)} - ${expense.remarks} (${expense.date})
            <button onclick="deleteExpense(${expense.id})">Delete</button>
        `;
        expenseList.appendChild(li);
    }
}

function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    updateLocalStorage();
    updateExpenseList();
    updateChart();
}

function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categoryTotals).map(category => `${categoryIcons[category]} ${category}`),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0'
                ]
            }]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Expense Distribution'
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        const dataset = data.datasets[tooltipItem.datasetIndex];
                        const total = dataset.data.reduce((acc, current) => acc + current, 0);
                        const currentValue = dataset.data[tooltipItem.index];
                        const percentage = ((currentValue / total) * 100).toFixed(2);
                        return `₹${currentValue.toFixed(2)} (${percentage}%)`;
                    }
                }
            }
        }
    });
}

function updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const themeIcon = document.querySelector('#themeToggle i');
    themeIcon.classList.toggle('fa-moon');
    themeIcon.classList.toggle('fa-sun');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    updateChart();
}

document.getElementById('expenseForm').addEventListener('submit', addExpense);
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// Initial render
updateExpenseList();
updateChart();

// Check for saved theme preference
if (localStorage.getItem('darkMode') === 'true') {
    toggleTheme();
}
