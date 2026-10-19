const fs = require('fs');
const path = require('path');

// GANTI DENGAN URL DEPLOYMENT APPS SCRIPT ANDA NANTI
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_337WlnNHVa2S1Q6bBaxhO7kEBB6tmXUmeWWHZjS5BPPS0P_YlYx7wkl-l7E4s3ff/exec';

module.exports = async (req, res) => {
    const artikelId = req.query.id;
    const htmlPath = path.join(process.cwd(), 'artikel.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    try {
        if (APPS_SCRIPT_URL.includes('GANTI_DENGAN_URL_ANDA')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(html);
        }

        const response = await fetch(`${APPS_SCRIPT_URL}?action=berita`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            let artikel = data.find(item => String(item.ID || item.id_artikel) === String(artikelId));
            if (!artikel) {
                artikel = data[data.length - 1];
            }

            const judul = (artikel.Judul || artikel.judul || 'PAC Fatayat NU Kemang').replace(/"/g, '&quot;');
            const isiRaw = artikel.Cuplikan || artikel.Isi_Berita || artikel.isi_konten || '';
            const deskripsi = isiRaw.substring(0, 150).replace(/"/g, '&quot;').replace(/\n/g, ' ');
            const gambar = artikel.Link_Gambar || artikel.url_gambar || 'https://via.placeholder.com/800x450/00984a/ffffff?text=PAC+Fatayat+NU+Kemang';

            const ogMetaBaru = `
    <!-- OG_META_START -->
    <title>${judul} - PAC Fatayat NU Kemang</title>
    <meta name="description" content="${deskripsi}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="PAC Fatayat NU Kecamatan Kemang">
    <meta property="og:title" content="${judul}">
    <meta property="og:description" content="${deskripsi}">
    <meta property="og:image" content="${gambar}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${judul}">
    <meta name="twitter:description" content="${deskripsi}">
    <meta name="twitter:image" content="${gambar}">
    <!-- OG_META_END -->`;

            html = html.replace(/<!-- OG_META_START -->[\s\S]*?<!-- OG_META_END -->/, ogMetaBaru);
        }
    } catch (error) {
        console.error('Error generating OG meta:', error);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
};