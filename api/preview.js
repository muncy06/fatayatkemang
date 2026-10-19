export default async function handler(req, res) {
  const { slug } = req.query;

  // URL Apps Script Anda
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNpKmlXAylAWhl9Qay1B7-74q0AaCQKOuNf4Pz_i8RrIfpaxRdnFjWAgy5CwYg2Pcq/exec';

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=berita`);
    const data = await response.json();

    // Cari artikel berdasarkan slug atau id
    const artikel = data.find(item => String(item.slug || item.ID || '').trim() === String(slug).trim()) || data[data.length - 1];

    if (!artikel) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send('<h3>Artikel tidak ditemukan</h3>');
    }

    const judul = artikel.judul || artikel.Judul || 'PAC Fatayat NU Kemang';
    const isi = artikel.konte || artikel.Isi_Berita || artikel.ringkasan || '';
    const deskripsi = isi.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
    const gambar = artikel.gambar_url || artikel.Link_Gambar || 'https://via.placeholder.com/800x450/00984a/ffffff?text=Fatayat+NU';
    
    // URL tujuan asli saat link diklik pengguna
    const targetUrl = `https://fatayatkemang.vercel.app/artikel.html?slug=${slug}`;

    // Cek apakah yang mengakses adalah Bot WhatsApp/Facebook/Twitter atau User biasa
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot/i.test(userAgent);

    if (isBot) {
      // Jika bot sosial media yang merayapi, berikan halaman HTML ber-Meta Tag OG
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <title>${judul}</title>
            <meta name="description" content="${deskripsi}">
            <meta property="og:type" content="article">
            <meta property="og:title" content="${judul}">
            <meta property="og:description" content="${deskripsi}">
            <meta property="og:image" content="${gambar}">
            <meta property="og:url" content="${targetUrl}">
            <meta name="twitter:card" content="summary_large_image">
        </head>
        <body>
            <h1>${judul}</h1>
            <p>${deskripsi}</p>
        </body>
        </html>
      `);
    } else {
      // Jika pengguna biasa yang klik, langsung alihkan (redirect) ke halaman artikel asli
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.redirect(302, targetUrl);
    }
  } catch (error) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<h3>Terjadi kesalahan server preview</h3>');
  }
}