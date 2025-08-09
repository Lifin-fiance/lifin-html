// js/index-berita.js

// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// Import the Firebase configuration
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Fetches the single latest news article and renders it in the preview section.
 */
const renderBeritaPreview = async () => {
    const container = document.getElementById('berita-preview-container');
    const imageEl = document.getElementById('berita-preview-image');
    const titleEl = document.getElementById('berita-preview-title');
    const snippetEl = document.getElementById('berita-preview-snippet');

    if (!container || !imageEl || !titleEl || !snippetEl) {
        console.error("Berita preview elements not found on the page.");
        return;
    }

    try {
        const beritaCollectionRef = collection(db, "berita");
        // Create a query to get the single latest document
        const q = query(beritaCollectionRef, orderBy("tanggal", "desc"), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            titleEl.textContent = "Belum ada berita terbaru.";
            snippetEl.textContent = "Cek kembali nanti ya!";
            return;
        }

        // Get the first (and only) document
        const latestDoc = querySnapshot.docs[0];
        const berita = { id: latestDoc.id, ...latestDoc.data() };
        
        // Populate the preview elements
        imageEl.src = berita.linkFoto || 'assets/images/mockup.png';
        imageEl.onerror = () => { imageEl.src = 'https://placehold.co/400x300/EEE/31343C?text=Image+Error'; };
        titleEl.textContent = berita.judul;
        
        // Create a short snippet from the content
        const snippet = berita.deskripsi.substring(0, 200) + '...';
        snippetEl.textContent = snippet;

        // Make the entire container clickable
        container.dataset.id = berita.id;
        container.addEventListener('click', () => {
            window.location.href = `berita-detail.html?id=${berita.id}`;
        });

    } catch (error) {
        console.error("Error fetching latest news for preview: ", error);
        titleEl.textContent = "Gagal memuat berita.";
        snippetEl.textContent = "Terjadi kesalahan saat mengambil data.";
    }
};

// Run the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', renderBeritaPreview);
