const puppeteer = require('puppeteer');

async function buatPembayaran(nama, jumlah, metode) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://www.sociabuzz.com/ngasihduit', { waitUntil: 'networkidle2' });

        // Tunggu input nama tersedia dan isi
        await page.waitForSelector('input[name="name"]', { visible: true });
        await page.type('input[name="name"]', nama, { delay: 100 });

        // Tunggu input jumlah tersedia dan isi
        await page.waitForSelector('input[name="amount"]', { visible: true });
        await page.type('input[name="amount"]', jumlah.toString(), { delay: 100 });

        // Klik tombol lanjut
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // Pilih metode pembayaran
        const metodePembayaran = {
            'qris': 'input[value="qris"]',
            'gopay': 'input[value="gopay"]',
            'ovo': 'input[value="ovo"]',
            'dana': 'input[value="dana"]',
            'shopeepay': 'input[value="shopeepay"]'
        };

        if (metodePembayaran[metode]) {
            await page.waitForSelector(metodePembayaran[metode], { visible: true });
            await page.click(metodePembayaran[metode]);
            await page.waitForTimeout(1000); // Beri sedikit jeda agar pilihan terproses
        } else {
            console.log("Metode pembayaran tidak ditemukan!");
            await browser.close();
            return null;
        }

        // Klik tombol bayar
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // Ambil link pembayaran
        const urlPembayaran = page.url();
        await browser.close();
        return urlPembayaran;
    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        await browser.close();
        return null;
    }
}

async function cekStatusPembayaran(urlPembayaran) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(urlPembayaran, { waitUntil: 'networkidle2' });

        // Cek status transaksi berdasarkan teks di halaman
        const status = await page.evaluate(() => {
            const text = document.body.innerText.toLowerCase();
            if (text.includes("pembayaran berhasil")) {
                return "✅ Pembayaran BERHASIL";
            } else if (text.includes("menunggu pembayaran")) {
                return "⏳ Menunggu pembayaran...";
            } else if (text.includes("pembayaran gagal")) {
                return "❌ Pembayaran GAGAL";
            } else {
                return "❓ Status tidak diketahui";
            }
        });

        await browser.close();
        return status;
    } catch (error) {
        console.error("Terjadi kesalahan saat mengecek status pembayaran:", error);
        await browser.close();
        return "❌ Gagal mengecek status pembayaran";
    }
}

module.exports = {
    buatPembayaran,
    cekStatusPembayaran
};