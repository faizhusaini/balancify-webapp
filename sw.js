// Predefined month names
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Keep track of added months
const monthList = [];

// Add a new month tile with income
function addMonthTile() {
    const monthName = document.getElementById("monthSelect").value;
    const year = document.getElementById("yearInput").value;
    const income = parseFloat(document.getElementById("incomeInput").value);

    if (!income || income < 0) {
        alert("Please enter valid income");
        return;
    }

    const monthTileTitle = `${monthName} ${year}`; // FIX: simple string instead of Date

    if (monthList.includes(monthTileTitle)) {
        alert("Month already exists");
        return;
    }

    monthList.push(monthTileTitle);

    // Update month select for expenses
    const expMonthSelect = document.getElementById("expenseMonth");
    const option = document.createElement("option");
    option.value = monthTileTitle;
    option.innerText = monthTileTitle;
    expMonthSelect.appendChild(option);

    // Create the tile as before (UI unchanged)
    const monthTile = document.createElement("div");
    monthTile.id = monthTileTitle;
    monthTile.className = "month-tile";

    const titleEl = document.createElement("h3");
    titleEl.innerText = monthTileTitle;
    monthTile.appendChild(titleEl);

    const incomeEl = document.createElement("p");
    incomeEl.innerText = `Income: ₹${income}`;
    incomeEl.id = `${monthTileTitle}-income`;
    monthTile.appendChild(incomeEl);

    const expensesContainer = document.createElement("div");
    expensesContainer.id = `${monthTileTitle}-expenses`;
    monthTile.appendChild(expensesContainer);

    document.getElementById("months-container").appendChild(monthTile);
}

// Add an expense entry to a specific month
function addExpenseEntry() {
    const monthTileTitle = document.getElementById("expenseMonth").value;
    if (!monthTileTitle) {
        alert("Please select a month first");
        return;
    }

    let type = document.getElementById("expenseType").value;
    const otherType = document.getElementById("otherType").value;
    if (type === "Other") {
        if (!otherType) {
            alert("Please specify other type");
            return;
        }
        type = otherType;
    }

    const amount = parseFloat(document.getElementById("expenseAmount").value);
    if (!amount || amount < 0) {
        alert("Please enter valid amount");
        return;
    }

    const expensesContainer = document.getElementById(`${monthTileTitle}-expenses`);
    const incomeEl = document.getElementById(`${monthTileTitle}-income`);

    // Create expense entry with delete button
    const expenseEl = document.createElement("p");
    expenseEl.className = "expense-entry";
    expenseEl.innerText = `${type}: ₹${amount} (${new Date().toLocaleDateString()})`;

    const delBtn = document.createElement("button");
    delBtn.innerText = "Delete";
    delBtn.onclick = () => {
        expenseEl.remove();
        let currentIncome = parseFloat(incomeEl.innerText.split("₹")[1]);
        currentIncome += parseFloat(amount);
        incomeEl.innerText = `Income: ₹${currentIncome}`;
    };
    expenseEl.appendChild(delBtn);

    expensesContainer.appendChild(expenseEl);

    // Deduct from income
    let currentIncome = parseFloat(incomeEl.innerText.split("₹")[1]);
    currentIncome -= amount;
    incomeEl.innerText = `Income: ₹${currentIncome}`;
}

// Service worker registration for PWA (if used)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").then(
