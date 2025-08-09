// js/berita.js

// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// Import the Firebase configuration
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Global variable to hold all news articles ---
let allBerita = [];

/**
 * Formats a Firestore Timestamp into a readable date string (e.g., "JAN 7").
 * @param {object} timestamp - The Firestore Timestamp object.
 * @returns {string} - The formatted date string.
 */
const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        return "DATE N/A";
    }
    const date = timestamp.toDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return `${month} ${day}`;
};

/**
 * Renders a list of news articles into the main grid.
 * @param {Array<object>} articles - An array of article objects to display.
 */
const renderBeritaGrid = (articles) => {
    const beritaGrid = document.getElementById('berita-grid');
    if (!beritaGrid) return;

    beritaGrid.innerHTML = ''; // Clear previous content

    if (articles.length === 0) {
        beritaGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">No matching news articles found.</p>';
        return;
    }

    articles.forEach(berita => {
        const articleCardHTML = `
            <div class="space-y-3 group cursor-pointer" onclick="window.location.href='berita-detail.html?id=${berita.id}'">
                <div class="overflow-hidden rounded-2xl shadow-md">
                    <img src="${berita.linkFoto || 'https://picsum.photos/seed/default/400/300'}" 
                         alt="Image for ${berita.judul}" 
                         class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                         onerror="this.onerror=null;this.src='https://placehold.co/400x300/EEE/31343C?text=Image+Not+Found';">
                </div>
                <div class="text-xs text-gray-500 font-medium pt-2">
                    <span>${formatDate(berita.tanggal)}</span> | <span>${berita.penulis || 'LIFIN TEAM'}</span>
                </div>
                <h2 class="font-bold text-lg leading-tight group-hover:text-[#04b3e3] transition-colors">
                    ${berita.judul}
                </h2>
            </div>
        `;
        beritaGrid.insertAdjacentHTML('beforeend', articleCardHTML);
    });
};

/**
 * Populates the featured article section with the newest news item.
 * @param {object} article - The newest article object.
 */
const displayFeaturedArticle = (article) => {
    if (!article) return;

    document.getElementById('featured-image').src = article.linkFoto || 'https://placehold.co/600x400/EEE/31343C?text=Image+Not+Found';
    document.getElementById('featured-date').textContent = formatDate(article.tanggal);
    document.getElementById('featured-author').textContent = article.penulis || 'LIFIN TEAM';
    document.getElementById('featured-title').textContent = article.judul;
    const featuredButton = document.getElementById('featured-button');
    if (featuredButton) {
        // Update button to link to the detail page with the article's ID
        featuredButton.onclick = () => window.location.href = `berita-detail.html?id=${article.id}`;
    }
};

/**
 * Fetches all news from Firestore, stores them, and triggers the initial render.
 */
const fetchAndDisplayBerita = async () => {
    try {
        const beritaCollectionRef = collection(db, "berita");
        const q = query(beritaCollectionRef, orderBy("tanggal", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            document.getElementById('berita-grid').innerHTML = '<p class="col-span-full text-center text-gray-500">No news articles found.</p>';
            document.getElementById('featured-article-section').style.display = 'none';
            return;
        }

        // Store all articles, including their Firestore document ID
        allBerita = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // The first article is the featured one
        const featuredArticle = allBerita[0];
        // The rest are for the main grid
        const gridArticles = allBerita.slice(1);

        displayFeaturedArticle(featuredArticle);
        renderBeritaGrid(gridArticles);

    } catch (error) {
        console.error("Error fetching news from Firestore: ", error);
        document.getElementById('berita-grid').innerHTML = '<p class="col-span-full text-center text-red-500">Could not load news articles. Please try again later.</p>';
    }
};

/**
 * Sets up the event listener for the search input field.
 */
const setupSearch = () => {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        // We filter from the original list of grid articles (all except the featured one)
        const gridArticles = allBerita.slice(1);
        const filteredBerita = gridArticles.filter(berita =>
            berita.judul.toLowerCase().includes(searchTerm)
        );
        renderBeritaGrid(filteredBerita);
    });
};


// --- Main execution ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayBerita();
    setupSearch();
});
