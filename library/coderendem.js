const fs = require('fs');
const path = './library/database/code.json';

// Cek apakah file database sudah ada
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));

function loadCodess() {
    try {
        if (!fs.existsSync(path)) return [];
        const raw = fs.readFileSync(path);
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error parsing codes.json:", e);
        return [];
    }
}
// Load data dari file
function loadCodes() {
    try {
        const raw = fs.readFileSync('./database/codes.json');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return []; // jika file belum ada atau JSON rusak
    }
}
// Simpan data ke file
function saveCodes(data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// Tambah kode baru
function addCode(code, saldo, expireTime) {
    const data = loadCodes();
    if (data.find(x => x.code === code)) return false;
    data.push({
        code,
        saldo,
        claimed: false,
        expired: expireTime // format timestamp (ms)
    });
    saveCodes(data);
    return true;
}

// Hapus kode
function delCode(code) {
    let data = loadCodes();
    const before = data.length;
    data = data.filter(x => x.code !== code);
    saveCodes(data);
    return before !== data.length;
}

// Daftar semua kode
function listCode() {
    const data = loadCodess();
    return data;
}

// Klaim kode
function tambahSaldo(user, amount) {
    const saldoPath = './source/saldo.json';
    let saldoData = {};

    if (fs.existsSync(saldoPath)) {
        saldoData = JSON.parse(fs.readFileSync(saldoPath));
    }

    saldoData[user] = (saldoData[user] || 0) + parseInt(amount);
    fs.writeFileSync(saldoPath, JSON.stringify(saldoData, null, 2));
}

// Fungsi untuk klaim kode
function claimCode(code, user) {
    const data = loadCodes();
    const idx = data.findIndex(x => x.code === code);
    if (idx === -1) return { success: false, message: 'Kode tidak ditemukan' };

    const kode = data[idx];

    if (kode.claimed) return { success: false, message: 'Kode sudah diklaim' };
    if (Date.now() > kode.expired) return { success: false, message: 'Kode telah kedaluwarsa' };

    // Tandai sebagai diklaim
    data[idx].claimed = true;
    saveCodes(data);

    // Tambah saldo
    tambahSaldo(user, kode.saldo);

    return { success: true, message: `Berhasil klaim saldo Rp${kode.saldo}` };
}

module.exports = {
    addCode,
    delCode,
    listCode,
    claimCode
};