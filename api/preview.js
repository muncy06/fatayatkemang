export default async function handler(req, res) {
  const { slug } = req.query;
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyNpKmlXAylAWhl9Qay1B7-74q0AaCQKOuNf4Pz_i8RrIfpaxRdnFjWAgy5CwYg2Pcq/exec';

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=berita`);
    const data = await response.json();
    
    const artikel = data.find(item => String(item.slug || item.ID || '').trim() === String(slug).trim()) || data[data.length - 1];

    if (!artikel) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send('<h3>Artikel tidak ditemukan</h3>');
    }

    const itemSlug = encodeURIComponent(String(artikel.slug || artikel.ID || slug).trim());
    const judul = artikel.judul || artikel.Judul || 'PAC Fatayat NU Kemang';
    const isi = artikel.konte || artikel.Isi_Berita || artikel.ringkasan || '';
    const deskripsi = String(isi).replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';
    const gambar = artikel.gambar_url || artikel.Link_Gambar || 'https://via.placeholder.com/800x450/00984a/ffffff?text=Fatayat+NU';

    // PENTING: og:url harus menggunakan previewUrl agar Facebook tidak pindah ke artikel.html
    const previewUrl = `https://fatayatkemang.vercel.app/api/preview?slug=${itemSlug}`;
    const targetUrl = `https://fatayatkemang.vercel.app/artikel.html?slug=${itemSlug}`;

    const userAgent = req.headers['user-agent'] || '';
    const isBot = /whatsapp|facebookexternalhit|facebot|meta-externalagent|twitterbot|linkedinbot|slackbot|telegrambot/i.test(userAgent);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).send(`<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>${judul}</title>
    <meta name="description" content="${deskripsi}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="PAC Fatayat NU Kemang">
    <meta property="og:title" content="${judul}">
    <meta property="og:description" content="${deskripsi}">
    <meta property="og:image" content="${gambar}">
    <meta property="og:url" content="${previewUrl}">
    <meta name="twitter:card" content="summary_large_image">
</head>
<body>
    <h1>${judul}</h1>
    <p>${deskripsi}</p>
    ${!isBot ? `<script>window.location.replace("${targetUrl}");</script>` : ''}
</body>
</html>`);

  } catch (error) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<h3>Terjadi kesalahan server preview</h3>');
  }
}
