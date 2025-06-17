const fs = require("fs");
const path = "./library/databse/transaksi.json";

// 🔹 Membaca transaksi dari file
function readTransactions() {
    try {
        if (!fs.existsSync(path)) fs.writeFileSync(path, "[]");
        return JSON.parse(fs.readFileSync(path));
    } catch (error) {
        console.error("❌ Gagal membaca transaksi.json:", error);
        return [];
    }
}

// 🔹 Menyimpan transaksi ke file
function saveTransactions(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// 🔹 Menambahkan transaksi baru
function addTransaction(user, amount, method, status = "pending") {
    let transactions = readTransactions();
    const newTransaction = {
        id: `TX${Date.now()}`,
        user,
        amount,
        method,
        status,
        date: new Date().toISOString()
    };

    transactions.push(newTransaction);
    saveTransactions(transactions);
    return newTransaction;
}

// 🔹 Memperbarui status transaksi
function updateTransactionStatus(id, newStatus) {
    let transactions = readTransactions();
    let trx = transactions.find(t => t.id === id);
    if (!trx) return false;

    trx.status = newStatus;
    saveTransactions(transactions);
    return true;
}

module.exports = { addTransaction, updateTransactionStatus, readTransactions };