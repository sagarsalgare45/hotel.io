document.addEventListener("DOMContentLoaded", function () {
    const billTable = document.getElementById('bill-table').getElementsByTagName('tbody')[0];
    const addItemButton = document.getElementById('add-item');
    const totalElement = document.getElementById('total');
    const addHistoryButton = document.getElementById('add-history');
    const historyList = document.getElementById('history-list');
    const dateInput = document.getElementById('date');
    const amountInput = document.getElementById('amount');

    // Load bills from localStorage
    let bills = JSON.parse(localStorage.getItem('bills')) || [];
    let billHistory = JSON.parse(localStorage.getItem('billHistory')) || [];

    addItemButton.addEventListener('click', addItem);
    addHistoryButton.addEventListener('click', addBillToHistory);

    // Load existing bills on page load
    renderBillTable();
    renderHistory();

    function addItem() {
        bills.push({
            name: "",
            quantity: 1,
            price: 0
        });
        saveBills();
        renderBillTable();
    }

    function renderBillTable() {
        billTable.innerHTML = '';
        bills.forEach((bill, index) => {
            const row = billTable.insertRow();
            row.className = 'bill-item-row';

            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            const cell5 = row.insertCell(4);

            cell1.innerHTML = `<input type="text" class="item-name" placeholder="पदार्थाचे नाव " value="${bill.name}">`;
            cell2.innerHTML = `<input type="number" class="item-quantity" value="${bill.quantity}" min="1">`;
            cell3.innerHTML = `<input type="number" class="item-price" value="${bill.price}" min="0">`;
            cell4.innerHTML = `₹<span class="item-total">${(bill.quantity * bill.price).toFixed(2)}</span>`;
            cell5.innerHTML = '<button class="remove-item">काढा </button>';

            const nameInput = cell1.querySelector('.item-name');
            const quantityInput = cell2.querySelector('.item-quantity');
            const priceInput = cell3.querySelector('.item-price');
            const removeButton = cell5.querySelector('.remove-item');

            // Update the bill item when name, quantity, or price changes
            nameInput.addEventListener('input', function () {
                bills[index].name = nameInput.value;
                saveBills();
            });

            quantityInput.addEventListener('input', function () {
                bills[index].quantity = parseFloat(quantityInput.value);
                updateTotal();
            });

            priceInput.addEventListener('input', function () {
                bills[index].price = parseFloat(priceInput.value);
                updateTotal();
            });

            removeButton.addEventListener('click', function () {
                bills.splice(index, 1);
                saveBills();
                renderBillTable();
            });
        });
        updateTotal();
    }

    function updateTotal() {
        let total = 0;

        bills.forEach(function (bill) {
            const itemTotal = bill.quantity * bill.price;
            total += itemTotal;
        });

        totalElement.textContent = total.toFixed(2);
        amountInput.value = total.toFixed(2); // Update the amount input box with the calculated total
        saveBills(); // Save the updated bill to localStorage
    }

    function saveBills() {
        localStorage.setItem('bills', JSON.stringify(bills));
    }

    function addBillToHistory() {
        const date = dateInput.value;
        const amount = amountInput.value;

        if (!date || !amount || amount === '0.00') {
            alert("Please fill out the date and make sure there's an amount to add.");
            return;
        }

        const historyItem = {
            date: date,
            amount: parseFloat(amount)
        };

        billHistory.push(historyItem);
        saveHistory();
        renderHistory();

        // Clear the current bill
        bills = [];
        saveBills();
        renderBillTable();

        // Clear the date and amount input after adding to history
        dateInput.value = '';
        amountInput.value = '0.00';
    }

    function renderHistory() {
        historyList.innerHTML = '';
        billHistory.forEach((history, index) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'history-entry';

            const billInfo = document.createElement('p');
            billInfo.textContent = `Date: ${history.date}, Amount: ₹${history.amount.toFixed(2)}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-bill';

            deleteButton.addEventListener('click', function () {
                billHistory.splice(index, 1);
                saveHistory();
                renderHistory();
            });

            entryDiv.appendChild(billInfo);
            entryDiv.appendChild(deleteButton);

            historyList.appendChild(entryDiv);
        });
    }

    function saveHistory() {
        localStorage.setItem('billHistory', JSON.stringify(billHistory));
    }

    // Function to print the bill
    document.getElementById('print-bill').addEventListener('click', function () {
        let printContent = `
            <h2>Bill Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>पदार्थ </th>
                        <th>संख्या </th>
                        <th>किंमत </th>
                        <th>एकुण </th>
                    </tr>
                </thead>
                <tbody>
        `;

        bills.forEach(function (bill) {
            printContent += `
                <tr>
                    <td>${bill.name}</td>
                    <td>${bill.quantity}</td>
                    <td>₹${bill.price}</td>
                    <td>₹${(bill.quantity * bill.price).toFixed(2)}</td>
                </tr>
            `;
        });

        printContent += `
                </tbody>
            </table>
            <p><strong>एकुण : ₹${totalElement.textContent}</strong></p>
        `;

        const printWindow = window.open('', '', 'height=500,width=800');
        printWindow.document.write('<html><head><title>Print Bill</title>');
        printWindow.document.write('<style>table, th, td { border: 1px solid black; border-collapse: collapse; padding: 8px; text-align: left; } </style>');
        printWindow.document.write('</head><body >');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    });
});
