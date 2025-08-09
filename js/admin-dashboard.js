// =================================================================
// LIFIN Admin Dashboard Script
// Manages all CRUD operations and UI interactions for the admin panel.
// =================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { 
    getFirestore, collection, getDocs, doc, getDoc, 
    updateDoc, deleteDoc, addDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- AUTHENTICATION CHECK ---
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = './admin-login.html';
    } else {
        // User is logged in, initialize dashboard
        initializeDashboard();
    }
});

// --- DOM ELEMENTS ---
const logoutButton = document.getElementById('logout-button');
const tabs = {
    pengguna: document.getElementById('tab-pengguna'),
    berita: document.getElementById('tab-berita'),
    flipcard: document.getElementById('tab-flipcard'),
};
const panels = {
    pengguna: document.getElementById('panel-pengguna'),
    berita: document.getElementById('panel-berita'),
    flipcard: document.getElementById('panel-flipcard'),
};

// --- INITIALIZATION ---
function initializeDashboard() {
    setupEventListeners();
    loadPenggunaData(); // Load initial tab data
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Logout Button
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            window.location.href = './admin-login.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });

    // Tab Navigation
    Object.keys(tabs).forEach(tabKey => {
        tabs[tabKey].addEventListener('click', () => {
            switchTab(tabKey);
        });
    });
    
    // Add other event listeners for modals etc.
    setupPenggunaModalListeners();
    setupBeritaModalListeners();
    setupFlipCardModalListeners();
}

// --- TAB MANAGEMENT ---
let activeTab = 'pengguna';
function switchTab(tabKey) {
    if (activeTab === tabKey) return;

    // Update tab styles
    tabs[activeTab].classList.remove('tab-active');
    panels[activeTab].classList.add('hidden');
    
    // Activate new tab
    tabs[tabKey].classList.add('tab-active');
    panels[tabKey].classList.remove('hidden');
    
    activeTab = tabKey;

    // Load data for the new tab
    if (tabKey === 'pengguna') loadPenggunaData();
    if (tabKey === 'berita') loadBeritaData();
    if (tabKey === 'flipcard') loadFlipCardData();
}


// =================================================================
// PENGGUNA (USERS) MANAGEMENT
// =================================================================
const penggunaTableBody = document.getElementById('pengguna-table-body');
const editPenggunaModal = document.getElementById('edit-pengguna-modal');
const editPenggunaForm = document.getElementById('edit-pengguna-form');
const cancelEditPenggunaBtn = document.getElementById('cancel-edit-pengguna');

function loadPenggunaData() {
    const usersCollection = collection(db, "users");
    onSnapshot(usersCollection, (snapshot) => {
        let tableRows = '';
        snapshot.forEach(doc => {
            const user = doc.data();
            const progress = user.progress || {};
            tableRows += `
                <tr data-id="${doc.id}">
                    <td class="px-6 py-4 whitespace-nowrap">${user.nama || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.level || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-xs">
                        B: ${progress.Beginner || 0} | S: ${progress['Smart Spender'] || 0} | F: ${progress['Future Investor'] || 0}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 edit-pengguna-btn">Edit</button>
                        <button class="text-red-600 hover:text-red-900 ml-4 delete-pengguna-btn">Delete</button>
                    </td>
                </tr>
            `;
        });
        penggunaTableBody.innerHTML = tableRows;
    });
}

penggunaTableBody.addEventListener('click', async (e) => {
    const userId = e.target.closest('tr').dataset.id;
    if (e.target.classList.contains('edit-pengguna-btn')) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            const user = userDoc.data();
            const progress = user.progress || {};
            document.getElementById('edit-userId').value = userId;
            document.getElementById('edit-nama').value = user.nama;
            document.getElementById('edit-email').value = user.email;
            document.getElementById('edit-jenjang').value = user.jenjang;
            document.getElementById('edit-level').value = user.level;
            document.getElementById('edit-progress-beginner').value = progress.Beginner || 0;
            document.getElementById('edit-progress-smartspender').value = progress['Smart Spender'] || 0;
            document.getElementById('edit-progress-futureinvestor').value = progress['Future Investor'] || 0;
            editPenggunaModal.classList.remove('hidden');
        }
    }
    if (e.target.classList.contains('delete-pengguna-btn')) {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            await deleteDoc(doc(db, "users", userId));
            alert('Pengguna berhasil dihapus.');
        }
    }
});

function setupPenggunaModalListeners() {
    editPenggunaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('edit-userId').value;
        const updatedData = {
            nama: document.getElementById('edit-nama').value,
            jenjang: document.getElementById('edit-jenjang').value,
            level: document.getElementById('edit-level').value,
            progress: {
                'Beginner': parseInt(document.getElementById('edit-progress-beginner').value),
                'Smart Spender': parseInt(document.getElementById('edit-progress-smartspender').value),
                'Future Investor': parseInt(document.getElementById('edit-progress-futureinvestor').value),
            }
        };
        await updateDoc(doc(db, "users", userId), updatedData);
        editPenggunaModal.classList.add('hidden');
        alert('Data pengguna berhasil diperbarui.');
    });
    cancelEditPenggunaBtn.addEventListener('click', () => editPenggunaModal.classList.add('hidden'));
}


// =================================================================
// BERITA (NEWS) MANAGEMENT
// =================================================================
const beritaTableBody = document.getElementById('berita-table-body');
const beritaModal = document.getElementById('berita-modal');
const beritaModalTitle = document.getElementById('berita-modal-title');
const beritaForm = document.getElementById('berita-form');
const addBeritaBtn = document.getElementById('add-berita-btn');
const cancelBeritaBtn = document.getElementById('cancel-berita');

function loadBeritaData() {
    const beritaCollection = query(collection(db, "berita"), orderBy("tanggal", "desc"));
    onSnapshot(beritaCollection, (snapshot) => {
        let tableRows = '';
        snapshot.forEach(doc => {
            const berita = doc.data();
            const date = berita.tanggal.toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
            tableRows += `
                <tr data-id="${doc.id}">
                    <td class="px-6 py-4 whitespace-nowrap font-medium">${berita.judul}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs">${berita.deskripsi}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${berita.penulis}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 edit-berita-btn">Edit</button>
                        <button class="text-red-600 hover:text-red-900 ml-4 delete-berita-btn">Delete</button>
                    </td>
                </tr>
            `;
        });
        beritaTableBody.innerHTML = tableRows;
    });
}

beritaTableBody.addEventListener('click', async (e) => {
    const beritaId = e.target.closest('tr').dataset.id;
    if (e.target.classList.contains('edit-berita-btn')) {
        const beritaDoc = await getDoc(doc(db, "berita", beritaId));
        if (beritaDoc.exists()) {
            const berita = beritaDoc.data();
            beritaModalTitle.textContent = 'Edit Berita';
            document.getElementById('berita-id').value = beritaId;
            document.getElementById('berita-judul').value = berita.judul;
            document.getElementById('berita-penulis').value = berita.penulis;
            document.getElementById('berita-deskripsi').value = berita.deskripsi;
            document.getElementById('berita-foto').value = berita.linkFoto;
            document.getElementById('berita-isi').value = berita.isi;
            document.getElementById('berita-referensi').value = berita.referensi;
            beritaModal.classList.remove('hidden');
        }
    }
    if (e.target.classList.contains('delete-berita-btn')) {
        if (confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
            await deleteDoc(doc(db, "berita", beritaId));
            alert('Berita berhasil dihapus.');
        }
    }
});

function setupBeritaModalListeners() {
    addBeritaBtn.addEventListener('click', () => {
        beritaForm.reset();
        document.getElementById('berita-id').value = '';
        beritaModalTitle.textContent = 'Tambah Berita';
        beritaModal.classList.remove('hidden');
    });

    beritaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const beritaId = document.getElementById('berita-id').value;
        const data = {
            judul: document.getElementById('berita-judul').value,
            penulis: document.getElementById('berita-penulis').value,
            deskripsi: document.getElementById('berita-deskripsi').value,
            linkFoto: document.getElementById('berita-foto').value,
            isi: document.getElementById('berita-isi').value,
            referensi: document.getElementById('berita-referensi').value,
            tanggal: new Date(), // Always set to current date on add/update
        };

        if (beritaId) {
            await updateDoc(doc(db, "berita", beritaId), data);
            alert('Berita berhasil diperbarui.');
        } else {
            await addDoc(collection(db, "berita"), data);
            alert('Berita berhasil ditambahkan.');
        }
        beritaModal.classList.add('hidden');
    });

    cancelBeritaBtn.addEventListener('click', () => beritaModal.classList.add('hidden'));
}


// =================================================================
// FLIP CARD MANAGEMENT
// =================================================================
const flipcardTableBody = document.getElementById('flipcard-table-body');
const flipcardModal = document.getElementById('flipcard-modal');
const flipcardModalTitle = document.getElementById('flipcard-modal-title');
const flipcardForm = document.getElementById('flipcard-form');
const addFlipcardBtn = document.getElementById('add-flipcard-btn');
const cancelFlipcardBtn = document.getElementById('cancel-flipcard');

function loadFlipCardData() {
    const flipcardCollection = query(collection(db, "flipcards"), orderBy("no"));
    onSnapshot(flipcardCollection, (snapshot) => {
        let tableRows = '';
        snapshot.forEach(doc => {
            const card = doc.data();
            tableRows += `
                <tr data-id="${doc.id}">
                    <td class="px-6 py-4 whitespace-nowrap">${card.no}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${card.head}</td>
                    <td class="px-6 py-4 whitespace-nowrap truncate max-w-sm">${card.info}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-indigo-600 hover:text-indigo-900 edit-flipcard-btn">Edit</button>
                        <button class="text-red-600 hover:text-red-900 ml-4 delete-flipcard-btn">Delete</button>
                    </td>
                </tr>
            `;
        });
        flipcardTableBody.innerHTML = tableRows;
    });
}

flipcardTableBody.addEventListener('click', async (e) => {
    const cardId = e.target.closest('tr').dataset.id;
    if (e.target.classList.contains('edit-flipcard-btn')) {
        const cardDoc = await getDoc(doc(db, "flipcards", cardId));
        if (cardDoc.exists()) {
            const card = cardDoc.data();
            flipcardModalTitle.textContent = 'Edit Kartu';
            document.getElementById('flipcard-id').value = cardId;
            document.getElementById('flipcard-no').value = card.no;
            document.getElementById('flipcard-head').value = card.head;
            document.getElementById('flipcard-info').value = card.info;
            flipcardModal.classList.remove('hidden');
        }
    }
    if (e.target.classList.contains('delete-flipcard-btn')) {
        if (confirm('Apakah Anda yakin ingin menghapus kartu ini?')) {
            await deleteDoc(doc(db, "flipcards", cardId));
            alert('Kartu berhasil dihapus.');
        }
    }
});

function setupFlipCardModalListeners() {
    addFlipcardBtn.addEventListener('click', () => {
        flipcardForm.reset();
        document.getElementById('flipcard-id').value = '';
        flipcardModalTitle.textContent = 'Tambah Kartu';
        flipcardModal.classList.remove('hidden');
    });

    flipcardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cardId = document.getElementById('flipcard-id').value;
        const data = {
            no: parseInt(document.getElementById('flipcard-no').value),
            head: document.getElementById('flipcard-head').value,
            info: document.getElementById('flipcard-info').value,
        };

        if (cardId) {
            await updateDoc(doc(db, "flipcards", cardId), data);
            alert('Kartu berhasil diperbarui.');
        } else {
            await addDoc(collection(db, "flipcards"), data);
            alert('Kartu berhasil ditambahkan.');
        }
        flipcardModal.classList.add('hidden');
    });

    cancelFlipcardBtn.addEventListener('click', () => flipcardModal.classList.add('hidden'));
}
