window.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5Irh4glDXwWrOnh1GxB8KE4jcRvLXnPexIUIveUo5QKgJierdt35z-i9PGu2Ajook/exec';

document.addEventListener('DOMContentLoaded', () => {
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

            const fileInput = document.getElementById('gambar');
            let base64Data = "";
            let fileName = "";
            let mimeType = "";

            if (fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];
                fileName = file.name;
                mimeType = file.type;
                base64Data = await toBase64(file);
            }

            const payload = {
                action: 'tambahArtikel',
                token: admin.token,
                judul: document.getElementById('judul').value,
                kategori: document.getElementById('kategori').value,
                penulis: document.getElementById('penulis').value,
                isi: document.getElementById('isi').value,
                fileData: base64Data,
                fileName: fileName,
                mimeType: mimeType
            };

            try {
                const response = await fetch(window.APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
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

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}