// =================================================================
// LIFIN Dashboard: Main Controller
// This script initializes the dashboard, fetches data,
// and sets up all event listeners.
// =================================================================

// --- MODULE IMPORTS ---
import {
    getUserProfileData,
    updateUserName,
    resetUserProgress,
    logoutUser,
    saveUserLevel
} from './auth-manager.js';

import {
    openProfilePanel,
    closeProfilePanel,
    openModal,
    closeModal,
    showToast,
    updateActiveNav,
    generatePageContent,
    updateFlashcard
} from './ui-manager.js';

import { fetchFlashcardData } from './flashfin.js';

// --- KEY CHANGE: Import the chatbot initializer ---
import { initFinlookChat } from './finlook.js';


// --- STATE MANAGEMENT ---
let userProfile = null;
let allMateriData = null;
const pageCache = {};

// --- CORE FUNCTIONS ---

/**
 * Sets the current page, rendering its content and updating navigation.
 * @param {string} page - The name of the page to display.
 */
async function setPage(page) {
    const mainContent = document.getElementById('mainContent');
    updateActiveNav(page);
    localStorage.setItem('lastPage', page);

    let content = pageCache[page];
    if (!content || page === 'materi') { // Always regenerate materi page for latest progress
        mainContent.innerHTML = `<div class="w-full text-center p-10">Memuat...</div>`;
        content = generatePageContent(page, userProfile, allMateriData);
        if (page !== 'materi') {
           pageCache[page] = content;
        }
    }
    
    mainContent.innerHTML = content;

    // --- KEY CHANGE: Initialize chatbot if the 'finlook' page is active ---
    if (page === 'finlook') {
        initFinlookChat();
    }

    if (page === "home") {
        const { head, info } = await fetchFlashcardData();
        updateFlashcard(head, info);
    }
}

/**
 * Preloads the content for pages in the background to make navigation faster.
 */
async function preloadAllPages() {
    const pages = ['home', 'game', 'finlook', 'panel']; // Exclude 'materi'
    for (const pageName of pages) {
        if (!pageCache[pageName]) {
            try {
                pageCache[pageName] = generatePageContent(pageName, userProfile, allMateriData);
            } catch (error) {
                console.error(`Failed to preload page ${pageName}:`, error);
            }
        }
    }
}

/**
 * Handles all click events on the page using event delegation.
 * @param {Event} e - The click event object.
 */
async function handlePageClick(e) {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    switch(action) {
        case 'set-page':
            const page = e.target.closest('[data-page]').dataset.page;
            setPage(page);
            break;
        case 'open-profile':
            openProfilePanel(userProfile);
            break;
        case 'close-profile':
            closeProfilePanel();
            break;
        case 'open-modal':
            const modalIdToOpen = e.target.closest('[data-modal-id]').dataset.modalId;
            openModal(modalIdToOpen);
            break;
        case 'close-modal':
            const modalIdToClose = e.target.closest('.fixed').id;
            closeModal(modalIdToClose);
            break;
        case 'save-name':
            const newName = document.getElementById("inputNama").value.trim();
            if (!newName) return;
            const nameSuccess = await updateUserName(newName);
            if (nameSuccess) {
                userProfile.nama = newName; // Update local state
                document.getElementById("namaUser").textContent = newName;
                closeModal("modalEditName");
                showToast("Nama berhasil diperbarui!");
            }
            break;
        case 'confirm-delete':
            const resetSuccess = await resetUserProgress();
            if (resetSuccess) {
                userProfile = await getUserProfileData(); // Re-fetch profile
                closeModal('modalConfirmDelete');
                showToast("Progress telah direset!");
                await setPage('home'); // Refresh the page content
            }
            break;
        case 'confirm-logout':
            await logoutUser();
            break;
        case 'copy-link':
            const input = document.getElementById("linkAjak");
            input.select();
            input.setSelectionRange(0, 99999);
            try {
                document.execCommand("copy");
                const feedback = document.getElementById("copyFeedback");
                feedback.classList.remove("hidden");
                setTimeout(() => feedback.classList.add("hidden"), 2000);
            } catch (err) {
                console.error('Failed to copy link: ', err);
                alert('Gagal menyalin link.');
            }
            break;
        case 'flip-card':
            e.target.closest('.flip-container').classList.toggle('flipped');
            break;
        case 'search-google':
            e.stopPropagation();
            const info = document.getElementById("card-info-text")?.textContent.trim();
            if (info && info !== "Memuat info...") {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(info)}`, "_blank");
            }
            break;
        case 'buka-materi':
            const nomorMateri = e.target.closest('[data-nomor]').dataset.nomor;
            window.location.href = `materi.html?id=${nomorMateri}`;
            break;
        case 'switch-level':
            const levels = ['Beginner', 'Smart Spender', 'Future Investor'];
            const currentIndex = levels.indexOf(userProfile.level || 'Beginner');
            const nextLevel = levels[(currentIndex + 1) % levels.length];
            await saveUserLevel(nextLevel); // Save to Firestore, which will trigger a reload via auth-manager
            showToast(`Berpindah ke level: ${nextLevel}`);
            await setPage('materi');
            break;
    }
}

// --- INITIALIZATION ---

/**
 * The main function to initialize the dashboard.
 */
async function initializeDashboard() {
    const loader = document.getElementById('loader');
    
    // Fetch critical data first
    [userProfile, allMateriData] = await Promise.all([
        getUserProfileData(),
        fetch('./data/materi.json').then(res => res.json())
    ]);

    if (!userProfile) {
        console.error("Fatal: No user profile found. Auth manager should have redirected.");
        loader.innerHTML = "Error: Gagal memuat data pengguna.";
        return;
    }

    // Set up event listeners
    document.body.addEventListener('click', handlePageClick);
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.addEventListener('click', () => setPage(btn.dataset.page));
    });

    // Load initial page
    const initialPage = localStorage.getItem('lastPage') || 'home';
    await setPage(initialPage);

    // Hide loader
    loader.style.transition = 'opacity 0.5s ease';
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);

    // Preload other pages for faster navigation
    setTimeout(preloadAllPages, 500);
}

// Run the app
document.addEventListener("DOMContentLoaded", initializeDashboard);
