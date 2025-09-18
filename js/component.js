/**
 * @file component-loader.js
 * @description Skrip ini bertanggung jawab untuk memuat komponen HTML yang dapat digunakan kembali
 * (seperti navbar dan footer) ke dalam halaman web secara dinamis.
 * Ini membantu menjaga kode HTML utama tetap bersih dan modular.
 */

/**
 * Fungsi asinkron untuk mengambil konten dari file HTML (komponen)
 * dan memasukkannya ke dalam elemen target di halaman.
 * * @param {string} url - Path ke file komponen HTML yang akan dimuat (misal: './components/navbar.html').
 * @param {string} elementId - ID dari elemen di halaman utama tempat komponen akan disisipkan.
 * @returns {Promise<void>}
 */
const loadComponent = async (url, elementId) => {
  // Hanya proses jika elemen target ada di halaman ini
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    // Tidak perlu memuat komponen jika tempatnya tidak ada.
    // Ini bukan error, hanya halaman ini tidak memerlukan komponen tersebut.
    return;
  }

  try {
    // Mengambil konten file dari URL yang diberikan
    const response = await fetch(url);

    // Jika Gagal dimuat (misal: file tidak ditemukan), lemparkan error
    if (!response.ok) {
      throw new Error(`Gagal memuat: ${response.status} ${response.statusText}`);
    }

    // Membaca konten file sebagai teks dan memasukkannya ke elemen target
    const componentHTML = await response.text();
    targetElement.innerHTML = componentHTML;

  } catch (error) {
    console.error(`Error memuat komponen '${url}' ke dalam '#${elementId}':`, error);
    // Tampilkan pesan error sederhana di tempat komponen seharusnya berada
    targetElement.innerHTML = `<div style="color: red; text-align: center; padding: 1rem;">Gagal memuat komponen.</div>`;
  }
};

/**
 * Event listener ini akan berjalan setelah seluruh struktur HTML halaman (DOM)
 * selesai dimuat dan siap untuk dimanipulasi.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Tentukan path dasar ke folder tempat semua file komponen disimpan
  const componentsPath = './components/';

  // Daftar semua komponen yang mungkin perlu dimuat di seluruh situs.
  // Skrip akan secara cerdas hanya memuat yang elemen targetnya ada di halaman saat ini.
  const componentsToLoad = [
    [`${componentsPath}navbar.html`, 'navbar-container'],
    [`${componentsPath}footer.html`, 'footer-container'],
    [`${componentsPath}footer-flat.html`, 'flat-container'],
    [`${componentsPath}chatbot.html`, 'chatbot-container']
  ];

  // Muat semua komponen yang diperlukan secara paralel.
  // `Promise.all` memastikan kita tidak perlu menunggu satu per satu.
  Promise.all(
    componentsToLoad.map(([url, elementId]) => loadComponent(url, elementId))
  );
});
