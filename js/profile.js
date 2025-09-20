// Import fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
// === PERUBAHAN DI SINI: Impor konfigurasi dari file terpusat ===
import { firebaseConfig } from "./firebase-config.js";

// Inisialisasi Firebase menggunakan konfigurasi yang diimpor
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Fungsi untuk mengambil data profil pengguna dari Firestore.
 * @param {string} userId - ID unik pengguna.
 * @returns {object|null} Data pengguna atau null jika tidak ditemukan.
 */
async function fetchUserProfile(userId) {
    if (!userId || userId === 'guest') {
        console.log("User ID tidak valid.");
        return null;
    }
    try {
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("Tidak ada dokumen pengguna dengan ID:", userId);
            return null;
        }
    } catch (error) {
        console.error("Error saat mengambil data pengguna:", error);
        return null;
    }
}

/**
 * Fungsi untuk menampilkan data pengguna di halaman.
 * @param {object} userData - Objek berisi data pengguna.
 */
function displayUserProfile(userData) {
    document.getElementById('profile-nama').textContent = userData.nama || "Pengguna LIFIN";
    document.getElementById('profile-level').textContent = userData.level || "Beginner";
    
    const levelNomorEl = document.getElementById('profile-level-nomor');
    if (levelNomorEl) {
        const totalProgress = Object.values(userData.progress || {}).reduce((sum, current) => sum + current, 0);
        levelNomorEl.textContent = `Lv. ${totalProgress}`;
    }

    // Tampilkan konten profil dan sembunyikan loader
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('profileContent').classList.remove('hidden');
}

/**
 * Fungsi untuk menampilkan pesan error jika pengguna tidak ditemukan.
 */
function showNotFoundError() {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('error-message').classList.remove('hidden');
}

// --- FUNGSI UTAMA YANG DIJALANKAN SAAT HALAMAN DIMUAT ---
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('user');

    const profileCard = document.getElementById('profileCard');
    // Efek animasi saat kartu muncul
    setTimeout(() => {
        if (profileCard) {
            profileCard.classList.remove('opacity-0', 'scale-95');
            profileCard.classList.add('opacity-100', 'scale-100');
        }
    }, 100);

    if (userId) {
        const userData = await fetchUserProfile(userId);
        if (userData) {
            displayUserProfile(userData);
        } else {
            showNotFoundError();
        }
    } else {
        showNotFoundError();
    }
});
