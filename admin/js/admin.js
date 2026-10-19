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

function fileKeBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = err => reject(err);
    });
}

async function unggahKeDriveDanAmbilLink(file) {
    const base64Data = await fileKeBase64(file);
    const params = new URLSearchParams();
    params.append('action', 'uploadGambar');
    params.append('fileData', base64Data);
    params.append('fileName', file.name);
    params.append('mimeType', file.type || 'image/jpeg');

    const res = await fetch(ENDPOINT_URL, {
        method: 'POST',
        body: params
    });
    const hasil = await res.json();

    if (hasil.status === 'success' && hasil.url_gambar) {
        return formatKeLh3Drive(hasil.url_gambar);
    }
    throw new Error(hasil.message || 'Gagal mengunggah gambar ke Google Drive.');
}

document.addEventListener('DOMContentLoaded', () => {
    const admin = requireAuth();
    if (!admin) return;

    const inputFile = document.getElementById('gambar');
    const inputUrlGambar = document.getElementById('url_gambar');
    const statusUpload = document.getElementById('status-upload-gambar');
    const formTambah = document.getElementById('form-tambah-artikel');
    const btnSubmit = document.getElementById('btn-submit');

    // Otomatis unggah ke Drive begitu admin memilih file gambar
    if (inputFile) {
        inputFile.addEventListener('change', async () => {
            if (!inputFile.files || !inputFile.files[0]) {
                inputUrlGambar.value = '';
                return;
            }

            const file = inputFile.files[0];
            inputUrlGambar.value = '';
            btnSubmit.disabled = true;
            statusUpload.textContent = 'Mengunggah foto ke Google Drive...';
            statusUpload.className = 'text-[11px] text-utama font-semibold mt-1 block';

            try {
                const linkBersih = await unggahKeDriveDanAmbilLink(file);
                inputUrlGambar.value = linkBersih;
                statusUpload.textContent = `✓ Foto siap (${linkBersih})`;
                statusUpload.className = 'text-[11px] text-utama font-bold mt-1 block';
            } catch (err) {
                statusUpload.textContent = 'Gagal mengunggah otomatis saat pilih file, akan dicoba ulang saat klik Publikasikan.';
                statusUpload.className = 'text-[11px] text-amber-600 font-semibold mt-1 block';
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }

    // Saat klik Publikasikan Artikel: kirim data teks + link bersih ke Spreadsheet
    if (formTambah) {
        formTambah.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btnText = document.getElementById('btn-text');
            const btnLoader = document.getElementById('btn-loader');
            const alertBox = document.getElementById('form-alert');

            btnText.textContent = 'Mempublikasikan...';
            btnLoader.classList.remove('hidden');
            btnSubmit.disabled = true;
            alertBox.classList.add('hidden');

            try {
                // Jika ada file yang dipilih tapi belum sempat ter-upload, upload dulu sekarang
                let linkGambarBersih = inputUrlGambar.value;
                if (!linkGambarBersih && inputFile && inputFile.files && inputFile.files[0]) {
                    btnText.textContent = 'Mengunggah Foto ke Drive...';
                    linkGambarBersih = await unggahKeDriveDanAmbilLink(inputFile.files[0]);
                    inputUrlGambar.value = linkGambarBersih;
                }

                btnText.textContent = 'Menyimpan ke Spreadsheet...';
                const params = new URLSearchParams();
                params.append('action', 'tambahArtikel');
                params.append('token', admin.token || '');
                params.append('judul', document.getElementById('judul').value);
                params.append('kategori', document.getElementById('kategori').value);
                params.append('penulis', document.getElementById('penulis').value);
                params.append('isi', document.getElementById('isi').value);
                params.append('url_gambar', linkGambarBersih);

                const response = await fetch(ENDPOINT_URL, {
                    method: 'POST',
                    body: params
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alertBox.textContent = 'Artikel berhasil dipublikasikan ke database!';
                    alertBox.className = 'block mb-6 p-4 text-xs font-medium bg-abu-hijau text-gray-900 border-l-4 border-utama';
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1200);
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