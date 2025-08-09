// js/berita-detail.js

// Import necessary functions from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// Import the Firebase configuration
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Formats a Firestore Timestamp into a readable date string (e.g., "7 JANUARY 2024").
 * @param {object} timestamp - The Firestore Timestamp object.
 * @returns {string} - The formatted date string.
 */
const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') {
        return "DATE N/A";
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return timestamp.toDate().toLocaleDateString('id-ID', options).toUpperCase();
};


/**
 * Fetches a single article from Firestore based on the ID in the URL
 * and populates the page with its content.
 */
const displayArticleDetail = async () => {
    const articleContainer = document.getElementById('article-container');
    if (!articleContainer) {
        console.error("Error: Article container not found.");
        return;
    }

    try {
        // Get the article ID from the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        if (!articleId) {
            articleContainer.innerHTML = '<h1 class="text-center text-2xl font-bold text-red-500">Article ID is missing.</h1>';
            return;
        }

        // Fetch the specific document from Firestore
        const docRef = doc(db, "berita", articleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const article = docSnap.data();

            // Set the page title
            document.title = `${article.judul} - LIFIN`;

            // --- PARAGRAPH HANDLING ---
            // Process the 'isi' field to convert newline characters into HTML paragraph tags.
            let formattedIsi = '<p>Full content not available.</p>';
            if (article.isi) {
                // 1. Split the string by newline characters.
                // 2. Filter out any empty lines that might result from multiple newlines.
                // 3. Wrap each resulting line in <p> tags.
                // 4. Join them back into a single HTML string.
                const paragraphs = article.isi.split('\n').filter(p => p.trim() !== '');
                formattedIsi = paragraphs.map(p => `<p>${p}</p>`).join('');
            }
            
            // Populate the container with the article's full details
            articleContainer.innerHTML = `
                <article>
                    <h1 class="text-3xl md:text-5xl font-extrabold text-[#04B3E3] mb-4 leading-tight">${article.judul}</h1>
                    <div class="text-md text-gray-500 mb-6 font-medium">
                        <span>${article.penulis || 'LIFIN TEAM'}</span> | <span>${formatDate(article.tanggal)}</span>
                    </div>
                    <img src="${article.linkFoto || 'https://placehold.co/1200x600/EEE/31343C?text=Image+Not+Available'}" 
                         alt="Image for ${article.judul}" 
                         class="w-full h-auto object-cover rounded-2xl shadow-lg mb-8"
                         onerror="this.onerror=null;this.src='https://placehold.co/1200x600/EEE/31343C?text=Image+Not+Found';">
                    <div class="article-content text-lg text-gray-700">
                        <p class="font-semibold text-xl">${article.deskripsi || ''}</p>
                        ${formattedIsi}
                    </div>
                </article>
            `;
        } else {
            articleContainer.innerHTML = '<h1 class="text-center text-2xl font-bold text-red-500">Article not found.</h1>';
        }

    } catch (error) {
        console.error("Error fetching article detail:", error);
        articleContainer.innerHTML = '<h1 class="text-center text-2xl font-bold text-red-500">Could not load the article.</h1>';
    }
};

// Run the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', displayArticleDetail);
