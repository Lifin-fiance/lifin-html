// =================================================================
// LIFIN Authentication & Profile Manager
// This script handles all Firebase authentication and Firestore user data logic.
// =================================================================

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
// Import the centralized Firebase configuration
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase services using the imported config
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// --- APPLICATION PATHS ---
const PATHS = {
    AUTH: 'auth.html',
    PROFILE_SELECTOR: 'profile-selector.html',
    DASHBOARD: 'dashboard.html',
    INDEX: 'index.html'
};

// --- AUTH READY PROMISE ---
// This promise ensures Firebase is initialized before other functions run.
const authReady = new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
        unsubscribe();
        resolve(); 
    });
});


// --- UI HELPER FUNCTIONS ---

function showModal(title, message) {
  const modal = document.getElementById('notifModal');
  const modalTitle = document.getElementById('notifTitle');
  const modalMessage = document.getElementById('notifMessage');
  if (modal && modalTitle && modalMessage) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
  } else {
    alert(`${title}\n\n${message}`);
  }
}

function handleAuthError(error) {
  console.error("Firebase Auth Error:", error.code, error.message);
  let message = 'Terjadi kesalahan. Silakan coba lagi.';
  switch (error.code) {
    case 'auth/user-not-found': message = 'Email tidak terdaftar.'; break;
    case 'auth/wrong-password': message = 'Password salah.'; break;
    case 'auth/email-already-in-use': message = 'Email ini sudah digunakan.'; break;
    case 'auth/weak-password': message = 'Password terlalu lemah (minimal 6 karakter).'; break;
    case 'auth/invalid-email': message = 'Format email tidak valid.'; break;
  }
  showModal('Otorisasi Gagal', message);
}

// --- CORE AUTHENTICATION LOGIC ---

onAuthStateChanged(auth, async (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    console.log(`Auth state changed on page: ${currentPage}. User:`, user ? user.uid : 'Not logged in');

    if (!user) {
        const protectedPages = [PATHS.DASHBOARD, PATHS.PROFILE_SELECTOR, 'materi.html'];
        if (protectedPages.includes(currentPage)) {
            console.log("User not logged in, redirecting to auth page.");
            window.location.href = PATHS.AUTH;
        }
        return;
    }

    const userProfile = await getUserProfileData();
    console.log("Fetched user profile:", userProfile);

    const isProfileComplete = userProfile && userProfile.jenjang && userProfile.level;
    console.log(`Is profile complete? -> ${isProfileComplete}`);

    if (currentPage === PATHS.AUTH) {
        console.log("User is on auth page but already logged in. Redirecting to dashboard.");
        window.location.href = PATHS.DASHBOARD;
        return;
    }
    
    if (!isProfileComplete && currentPage !== PATHS.PROFILE_SELECTOR) {
        console.log("Profile is not complete. Redirecting to profile selector.");
        window.location.href = PATHS.PROFILE_SELECTOR;
        return;
    }
    
    if (isProfileComplete && currentPage === PATHS.PROFILE_SELECTOR) {
        console.log("Profile is complete, but user is on selector page. Redirecting to dashboard.");
        window.location.href = PATHS.DASHBOARD;
    }
});


// --- EXPORTED FUNCTIONS ---

export const registerUser = async (email, password) => {
    try { await createUserWithEmailAndPassword(auth, email, password); } catch (error) { handleAuthError(error); }
};

export const loginUser = async (email, password) => {
    try { await signInWithEmailAndPassword(auth, email, password); } catch (error) { handleAuthError(error); }
};

export const signInWithGoogle = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (error) { handleAuthError(error); }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        window.location.href = PATHS.INDEX;
    } catch (error) {
        console.error("Logout Error:", error);
        showModal("Logout Gagal", "Terjadi kesalahan saat mencoba keluar.");
    }
};

export const resetPassword = async (email) => {
    if (!email) return showModal("Gagal", "Silakan masukkan alamat email Anda.");
    try {
        await sendPasswordResetEmail(auth, email);
        showModal("Link Terkirim", "Link reset password telah dikirim ke email Anda.");
    } catch (error) { handleAuthError(error); }
};

// --- FIRESTORE USER PROFILE FUNCTIONS ---

export const saveUserProfile = async (nama, jenjang) => {
    await authReady; 
    const user = auth.currentUser;
    if (!user) {
        showModal("Error", "Anda harus login untuk menyimpan profil.");
        return false;
    }
    try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            email: user.email, nama, jenjang, level: null,
            progress: { 'Beginner': 0, 'Smart Spender': 0, 'Future Investor': 0 }
        });
        return true;
    } catch (error) {
        console.error("Profile Save Error:", error);
        showModal("Error", "Gagal menyimpan profil.");
        return false;
    }
};

export const saveUserLevel = async (level) => {
    await authReady;
    const user = auth.currentUser;
    if (!user) return showModal("Error", "Anda harus login untuk memilih level.");
    try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { level });
        window.location.href = PATHS.DASHBOARD;
    } catch (error) {
        console.error("Level Save Error:", error);
        showModal("Error", "Gagal menyimpan level.");
    }
};

export const getUserProfileData = async () => {
    await authReady;
    const user = auth.currentUser;
    if (!user) return null;
    try {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error fetching profile data:", error);
        return null;
    }
};

export const updateUserName = async (newName) => {
    await authReady;
    const user = auth.currentUser;
    if (!user) return showModal("Error", "Sesi Anda telah berakhir. Silakan login kembali.");
    if (!newName || !newName.trim()) return showModal("Error", "Nama tidak boleh kosong.");
    try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { nama: newName.trim() });
        return true;
    } catch (error) {
        console.error("Gagal update nama:", error);
        showModal("Error", "Gagal memperbarui nama.");
        return false;
    }
};

export const resetUserProgress = async () => {
    await authReady;
    const user = auth.currentUser;
    if (!user) return showModal("Error", "Sesi Anda telah berakhir. Silakan login kembali.");
    try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            level: 'Beginner',
            progress: { 'Beginner': 0, 'Smart Spender': 0, 'Future Investor': 0 }
        });
        return true;
    } catch (error) {
        console.error("Gagal reset progres:", error);
        showModal("Error", "Gagal menghapus progres.");
        return false;
    }
};

export const updateMateriProgress = async (levelName, materiId) => {
    await authReady;
    const user = auth.currentUser;
    if (!user) return console.error("User not logged in.");
    if (!levelName || !materiId) return console.error("Level name and Materi ID are required.");

    try {
        const userDocRef = doc(db, "users", user.uid);
        
        // The data to be updated. Start with the progress for the current level.
        const updateData = {
            [`progress.${levelName}`]: materiId
        };

        // Define the level progression map
        const nextLevelMap = {
            'Beginner': 'Smart Spender',
            'Smart Spender': 'Future Investor'
        };

        // Check if the user has completed the level (10 lessons per level)
        const isLevelComplete = materiId % 10 === 0;

        if (isLevelComplete && nextLevelMap[levelName]) {
            const nextLevel = nextLevelMap[levelName];
            
            // Promote user to the next level
            updateData.level = nextLevel;
            
            // *** THE FIX: Set the progress for the NEW level to the current materiId ***
            // This acts as the "key" to unlock the next set of lessons (e.g., lesson 11).
            updateData[`progress.${nextLevel}`] = materiId;

            console.log(`User completed ${levelName}. Progressing to ${nextLevel} and setting initial progress.`);
        }

        // Perform a single update operation with all the changes
        await updateDoc(userDocRef, updateData);
        
        return true;
    } catch (error) {
        console.error(`Gagal update progres untuk level ${levelName}:`, error);
        showModal("Error", "Terjadi kesalahan saat menyimpan progres Anda.");
        return false;
    }
};
