// Import fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- KONFIGURASI FIREBASE ---
// PENTING: Ganti dengan konfigurasi Firebase proyek Anda yang sebenarnya!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Fungsi untuk mengambil data profil pengguna dari Firestore.
 * @param {string} userId - ID unik pengguna.
 * @returns {object|null} Data pengguna atau null jika tidak ditemukan.
 */
async function fetchUserProfile(userId) {
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
 * Fungsi untuk menampilkan data pengguna di halaman dan membuat QR code.
 * @param {object} userData - Objek berisi data pengguna.
 */
function displayUserProfile(userData) {
    document.getElementById('profile-nama').textContent = userData.nama || "Pengguna LIFIN";
    document.getElementById('profile-level').textContent = userData.level || "Beginner";
    
    // Tampilkan konten profil dan sembunyikan loader
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('profileContent').classList.remove('hidden');

    // --- PENAMBAHAN BARU: Membuat QR Code ---
    const qrCodeContainer = document.getElementById('qrcode');
    
    // Hapus QR code lama jika ada (untuk mencegah duplikasi)
    qrCodeContainer.innerHTML = ''; 

    // Opsi untuk QR Code
    const options = {
        text: window.location.href, // URL halaman saat ini
        width: 80,
        height: 80,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    };

    // Membuat instance QR Code baru
    new QRCode(qrCodeContainer, options);
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
        profileCard.classList.remove('opacity-0', 'scale-95');
        profileCard.classList.add('opacity-100', 'scale-100');
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
