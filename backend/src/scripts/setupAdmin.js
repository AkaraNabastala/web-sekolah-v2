import readline from 'readline';
import bcrypt from 'bcryptjs';
import { getPool, checkConnection } from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function question(query) {
    return new Promise((resolve) => rl.question(query, resolve));
}
async function main() {
    console.log('====================================================');
    console.log('  SETUP ADMINISTRATOR PERTAMA - WEBSITE SEKOLAH     ');
    console.log('====================================================');
    const check = await checkConnection();
    if (!check.connected) {
        console.warn(`[Peringatan] Koneksi MySQL langsung: ${check.message}`);
    }
    const pool = getPool();
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM admins');
        if (rows && rows[0]?.count > 0) {
            console.log('❌ Administrator sudah pernah dibuat. Setup awal terkunci demi keamanan.');
            process.exit(0);
        }
    }
    catch (err) {
        console.log(`Pengecekan database: ${err.message}`);
    }
    const username = await question('Masukkan Username Admin: ');
    const email = await question('Masukkan Alamat Email: ');
    const fullName = await question('Masukkan Nama Lengkap: ');
    const password = await question('Masukkan Password (min 8 karakter): ');
    if (!username || !email || !password || !fullName || password.length < 8) {
        console.error('❌ Data tidak valid atau password kurang dari 8 karakter.');
        process.exit(1);
    }
    const hashed = await bcrypt.hash(password, 10);
    try {
        await pool.query(`INSERT INTO admins (username, email, password, full_name, role, is_active, created_at)
       VALUES (?, ?, ?, ?, 'superadmin', 1, NOW())`, [username.trim().toLowerCase(), email.trim().toLowerCase(), hashed, fullName.trim()]);
        console.log('✅ Administrator pertama berhasil dibuat dan setup terkunci.');
    }
    catch (err) {
        console.error('Gagal menyimpan ke database:', err.message);
    }
    rl.close();
    process.exit(0);
}
main();
