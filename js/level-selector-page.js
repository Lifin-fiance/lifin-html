/*
 * =====================================================================================
 *
 * Filename:  level-selector-page.js
 *
 * Description:  Skrip khusus untuk halaman level-selector.html.
 * VERSI DIPERBAIKI: Menggunakan ES Module import untuk konsistensi.
 *
 * =====================================================================================
 */

// Impor fungsi saveUserLevel langsung dari auth-manager.js
import { saveUserLevel } from './auth-manager.js';

// Objek untuk memetakan ID elemen ke nama level yang sesuai
const levelSelectors = {
    'level-beginner': 'Beginner',
    'level-smart-spender': 'Smart Spender',
    'level-future-investor': 'Future Investor'
};

// Loop melalui setiap item di objek untuk menambahkan event listener
for (const id in levelSelectors) {
    const selectorElement = document.getElementById(id);

    if (selectorElement) {
        selectorElement.addEventListener('click', () => {
            // Ambil nama level dari objek menggunakan id
            const selectedLevel = levelSelectors[id];

            // Panggil fungsi yang sudah diimpor secara langsung.
            // Tidak perlu lagi memeriksa window.authManager.
            saveUserLevel(selectedLevel);
        });
    }
}
