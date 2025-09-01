/**
 * File: /js/component.js
 * Deskripsi: Memuat komponen HTML yang dapat digunakan kembali dan menginisialisasi skrip inti.
 */

// Fungsi untuk mengambil dan memuat komponen HTML ke dalam elemen yang ditentukan
const loadComponent = async (url, elementId) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} untuk ${url}`);
    }
    const text = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = text;
    } else {
      // Peringatan jika elemen tidak ditemukan, agar lebih mudah saat debugging.
      console.warn(`Elemen dengan ID '${elementId}' tidak ditemukan.`);
    }
  } catch (error) {
    console.error('Gagal memuat komponen:', error);
  }
};

// Fungsi ini akan berjalan setelah dokumen HTML utama selesai dimuat
document.addEventListener('DOMContentLoaded', async () => {
  // --- Konfigurasi Path Komponen ---
  const basePath = './components/'; // Sesuaikan path jika perlu

  // Muat navbar dan kemudian skrip interaktifnya
  await loadComponent(`${basePath}navbar.html`, 'navbar-container');

  await loadComponent(`${basePath}footer.html`, 'footer-container');
  await loadComponent(`${basePath}footer-flat.html`, 'flat-container');
  
  // Muat chatbot dan kemudian skripnya
  await loadComponent(`${basePath}chatbot.html`, 'chatbot-container');
});
