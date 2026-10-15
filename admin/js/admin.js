// Menggunakan window agar tidak terjadi bentrok deklarasi ganda
window.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5Irh4glDXwWrOnh1GxB8KE4jcRvLXnPexIUIveUo5QKgJierdt35z-i9PGu2Ajook/exec';

document.addEventListener('DOMContentLoaded', () => {
    // Pastikan admin sudah login
    const admin = requireAuth();
    if (!admin) return;

    const formTambah = document.getElementById('form-tambah-artikel');
    if (formTambah) {
        formTambah.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnSubmit = document.getElementById('btn-submit');
            const btnText = document.getElementById('btn-text');
            const btnLoader = document.getElementById('btn-loader');
            const alertBox = document.getElementById('form-alert');

            btnText.textContent = 'Mengunggah & Menyimpan...';
            btnLoader.classList.remove('hidden');
            btnSubmit.disabled = true;
            alertBox.classList.add('hidden');

            const formData = new FormData(formTambah);
            formData.append('action', 'tambahArtikel');
            formData.append('token', admin.token);

            try {
                const response = await fetch(window.APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alertBox.textContent = 'Artikel berhasil dipublikasikan ke database!';
                    alertBox.className = 'block mb-6 p-4 text-xs font-medium bg-abu-hijau text-gray-900 border-l-4 border-utama';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1500);
                } else {
                    throw new Error(result.message || 'Gagal menyimpan artikel.');
                }

            } catch (error) {
                alertBox.textContent = error.message || 'Terjadi kesalahan jaringan ke server.';
                alertBox.className = 'block mb-6 p-4 text-xs font-medium bg-putih-tema text-red-700 border-l-4 border-red-600';
                btnText.textContent = 'Publikasikan Artikel';
                btnLoader.classList.add('hidden');
                btnSubmit.disabled = false;
            }
        });
    }
});