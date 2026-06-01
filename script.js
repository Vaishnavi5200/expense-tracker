// ===== DOM ELEMENTS =====
// We grab all the HTML elements we need to work with
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const transactionList = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const emptyMessage = document.getElementById('empty-message');

// ===== DATA =====
// This array holds all our transactions
// We load existing data from localStorage, or start with empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// ===== INITIALIZE THE APP =====
// This function runs when the page loads
function init() {
    // Clear the transaction list in the HTML
    transactionList.innerHTML = '';
    
    // Add each transaction to the display
    transactions.forEach(addTransactionToDOM);
    
    // Update the balance, income, and expense totals
    updateValues();
}

// ===== ADD TRANSACTION TO THE DOM =====
// This function creates the HTML for a single transaction and adds it to the list
function addTransactionToDOM(transaction) {
    // Determine if this is income (positive) or expense (negative)
    const type = transaction.amount > 0 ? 'income' : 'expense';
    
    // Format the amount with + or - sign
    const sign = transaction.amount > 0 ? '+' : '-';
    const formattedAmount = `${sign}$${Math.abs(transaction.amount).toFixed(2)}`;
    
    // Create a new list item element
    const li = document.createElement('li');
    li.className = `transaction-item ${type}`;
    li.dataset.id = transaction.id; // Store the ID for deletion
    
    // Set the inner HTML of the list item
    li.innerHTML = `
        <div class="transaction-info">
            <p class="transaction-description">${escapeHTML(transaction.description)}</p>
            <p class="transaction-amount ${type}">${formattedAmount}</p>
        </div>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">✕</button>
    `;
    
    // Add the list item to the transaction list
    transactionList.appendChild(li);
}

// ===== UPDATE BALANCE, INCOME, AND EXPENSE =====
// This function calculates and displays the totals
function updateValues() {
    // Get all the amounts from transactions
    const amounts = transactions.map(transaction => transaction.amount);
    
    // Calculate total balance (sum of all amounts)
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    
    // Calculate total income (sum of positive amounts only)
    const income = amounts
        .filter(amount => amount > 0)
        .reduce((sum, amount) => sum + amount, 0);
    
    // Calculate total expense (sum of negative amounts, made positive)
    const expense = amounts
        .filter(amount => amount < 0)
        .reduce((sum, amount) => sum + amount, 0);
    
    // Update the display
    balanceEl.textContent = `$${total.toFixed(2)}`;
    incomeEl.textContent = `+$${income.toFixed(2)}`;
    expenseEl.textContent = `-$${Math.abs(expense).toFixed(2)}`;
    
    // Show or hide the "no transactions" message
    emptyMessage.style.display = transactions.length === 0 ? 'block' : 'none';
}

// ===== ADD NEW TRANSACTION =====
// This function handles the form submission
function addTransaction(event) {
    // Prevent the form from refreshing the page
    event.preventDefault();
    
    // Get values from the input fields
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    
    // Validate the inputs
    if (description === '' || isNaN(amount)) {
        alert('Please enter a description and a valid amount');
        return;
    }
    
    // Create a new transaction object
    const transaction = {
        id: generateID(),           // Unique identifier
        description: description,   // What the transaction is for
        amount: amount              // The amount (positive or negative)
    };
    
    // Add to our transactions array
    transactions.push(transaction);
    
    // Add to the DOM (display)
    addTransactionToDOM(transaction);
    
    // Update totals
    updateValues();
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Clear the form inputs
    descriptionInput.value = '';
    amountInput.value = '';
    
    // Focus back on the description field for easy entry
    descriptionInput.focus();
}

// ===== DELETE TRANSACTION =====
// This function removes a transaction by its ID
function deleteTransaction(id) {
    // Filter out the transaction with the matching ID
    transactions = transactions.filter(transaction => transaction.id !== id);
    
    // Save the updated list to localStorage
    saveToLocalStorage();
    
    // Refresh the display
    init();
}

// ===== GENERATE UNIQUE ID =====
// Creates a random ID for each transaction
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// ===== SAVE TO LOCAL STORAGE =====
// Stores our transactions in the browser's localStorage
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ===== ESCAPE HTML =====
// Prevents XSS attacks by escaping special characters
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== EVENT LISTENERS =====
// Listen for form submission
form.addEventListener('submit', addTransaction);

// ===== START THE APP =====
// Initialize when the page loads
init();
c