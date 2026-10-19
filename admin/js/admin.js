const ENDPOINT_URL = (typeof APPS_SCRIPT_URL !== 'undefined')
    ? APPS_SCRIPT_URL
    : 'https://script.google.com/macros/s/AKfycbz_337WlnNHVa2S1Q6bBaxhO7kEBB6tmXUmeWWHZjS5BPPS0P_YlYx7wkl-l7E4s3ff/exec';

function formatKeLh3Drive(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.startsWith('https://lh3.googleusercontent.com/d/')) return trimmed;

    const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
    if (matchD && matchD[1]) return `https://lh3.googleusercontent.com/d/${matchD[1]}`;

    const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (matchId && matchId[1]) return `https://lh3.googleusercontent.com/d/${matchId[1]}`;

    return trimmed;
}

function tampilkanPreview(url) {
    const wrapper = document.getElementById('preview-wrapper');
    const img = document.getElementById('preview-gambar');
    if (!wrapper || !img) return;

    if (url) {
        img.src = url;
        wrapper.classList.remove('hidden');
    } else {
        img.src = '';
        wrapper.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const admin = requireAuth();
    if (!admin) return;

    const inputUrlGambar = document.getElementById('url_gambar');
    const formTambah = document.getElementById('form-tambah-artikel');

    if (inputUrlGambar) {
        const prosesLink = () => {
            const bersih = formatKeLh3Drive(inputUrlGambar.value);
            inputUrlGambar.value = bersih;
            tampilkanPreview(bersih);
        };
        inputUrlGambar.addEventListener('input', prosesLink);
        inputUrlGambar.addEventListener('paste', () => setTimeout(prosesLink, 50));
    }

    if (formTambah) {
        formTambah.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnSubmit = document.getElementById('btn-submit');
            const btnText = document.getElementById('btn-text');
            const btnLoader = document.getElementById('btn-loader');
            const alertBox = document.getElementById('form-alert');

            btnText.textContent = 'Menyimpan ke Spreadsheet...';
            btnLoader.classList.remove('hidden');
            btnSubmit.disabled = true;
            alertBox.classList.add('hidden');

            const linkBersih = formatKeLh3Drive(inputUrlGambar ? inputUrlGambar.value : '');

            const params = new URLSearchParams();
            params.append('action', 'tambahArtikel');
            params.append('judul', document.getElementById('judul').value);
            params.append('kategori', document.getElementById('kategori').value);
            params.append('penulis', document.getElementById('penulis').value);
            params.append('isi', document.getElementById('isi').value);
            params.append('url_gambar', linkBersih);

            try {
                const response = await fetch(ENDPOINT_URL, {
                    method: 'POST',
                    body: params
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alertBox.textContent = 'Artikel berhasil dipublikasikan!';
                    alertBox.className = 'block mb-6 p-4 text-xs font-medium bg-abu-hijau text-gray-900 border-l-4 border-utama';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    throw new Error(result.message || 'Gagal menyimpan artikel.');
                }
            } catch (error) {
                alertBox.textContent = error.message || 'Terjadi kesalahan jaringan.';
                alertBox.className = 'block mb-6 p-4 text-xs font-medium bg-putih-tema text-red-700 border-l-4 border-red-600';
                btnText.textContent = 'Publikasikan Artikel';
                btnLoader.classList.add('hidden');
                btnSubmit.disabled = false;
            }
        });
    }
});