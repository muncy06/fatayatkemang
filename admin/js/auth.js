// MASUKKAN URL DEPLOYMENT APPS SCRIPT ANDA DI SINI NANTI
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5Irh4glDXwWrOnh1GxB8KE4jcRvLXnPexIUIveUo5QKgJierdt35z-i9PGu2Ajook/exec';

const SESSION_KEY = 'fatayat_admin_session';

// 1. Fungsi Cek Sesi (Digunakan di halaman dashboard, tambah, dan edit artikel)
function requireAuth() {
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (!sessionRaw) {
        window.location.href = 'login.html';
        return null;
    }
    try {
        return JSON.parse(sessionRaw);
    } catch (e) {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = 'login.html';
        return null;
    }
}

// 2. Fungsi Logout
function logoutAdmin() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

// 3. Handler Form Login (Jika berada di halaman login.html)
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('form-login');
    
    // Jika sudah login dan membuka login.html, langsung arahkan ke dashboard
    if (formLogin && localStorage.getItem(SESSION_KEY)) {
        window.location.href = 'dashboard.html';
        return;
    }

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value;
            const btnLogin = document.getElementById('btn-login');
            const btnText = document.getElementById('btn-text');
            const btnLoader = document.getElementById('btn-loader');
            const alertBox = document.getElementById('login-alert');

            btnText.textContent = 'Memverifikasi...';
            btnLoader.classList.remove('hidden');
            btnLogin.disabled = true;
            alertBox.classList.add('hidden');

            try {
                // Jika URL Apps Script belum diganti, gunakan akun lokal sementara untuk testing
                if (APPS_SCRIPT_URL.includes('GANTI_DENGAN_URL_ANDA')) {
                    if (usernameInput === 'admin' && passwordInput === 'fatayat123') {
                        const dummySession = {
                            username: 'admin',
                            nama_lengkap: 'Admin PAC Fatayat Kemang',
                            token: 'LOCAL_DEV_TOKEN_' + Date.now()
                        };
                        localStorage.setItem(SESSION_KEY, JSON.stringify(dummySession));
                        window.location.href = 'dashboard.html';
                        return;
                    } else {
                        throw new Error('Mode Lokal: Gunakan username "admin" dan password "fatayat123".');
                    }
                }

                // Jika URL Apps Script sudah terpasang, verifikasi ke Sheet Admin
                const formData = new FormData();
                formData.append('action', 'login');
                formData.append('username', usernameInput);
                formData.append('password', passwordInput);

                const response = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.status === 'success') {
                    localStorage.setItem(SESSION_KEY, JSON.stringify({
                        username: result.data.username,
                        nama_lengkap: result.data.nama_lengkap,
                        token: result.data.token_sesi
                    }));
                    window.location.href = 'dashboard.html';
                } else {
                    throw new Error(result.message || 'Username atau password tidak sesuai.');
                }

            } catch (error) {
                alertBox.textContent = error.message || 'Gagal terhubung ke server autentikasi.';
                alertBox.className = 'block mb-6 p-3.5 text-xs font-medium bg-putih-tema text-red-700 border-l-4 border-red-600';
            } finally {
                btnText.textContent = 'Masuk ke Dashboard';
                btnLoader.classList.add('hidden');
                btnLogin.disabled = false;
            }
        });
    }
});