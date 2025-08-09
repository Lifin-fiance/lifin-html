// =================================================================
// LIFIN Dashboard: API Handler
// This module is responsible for all external data fetching (APIs).
// =================================================================

// Import Firebase functions and the centralized config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Fetches a random financial fact from the 'flipcards' collection in Firestore.
 * @returns {Promise<object>} A promise that resolves with an object containing 'head' and 'info' properties.
 */
export async function fetchFlashcardData() {
    console.log("Fetching new flashcard data from Firestore...");
    try {
        const flipcardsCollection = collection(db, "flipcards");
        const snapshot = await getDocs(flipcardsCollection);

        if (snapshot.empty) {
            console.warn("No flipcards found in the database.");
            return {
                head: "Konten Kosong",
                info: "Belum ada kartu flip yang ditambahkan. Silakan tambahkan melalui panel admin."
            };
        }

        // Convert snapshot to an array of card data
        const allCards = [];
        snapshot.forEach(doc => {
            allCards.push(doc.data());
        });

        // Pick a random card from the list
        const randomIndex = Math.floor(Math.random() * allCards.length);
        const card = allCards[randomIndex];

        // Ensure the card has the required fields
        if (card && card.head && card.info) {
            return {
                head: card.head,
                info: card.info
            };
        } else {
            throw new Error("Invalid card format found in database.");
        }

    } catch (error) {
        console.error("Failed to fetch flashcard data:", error);
        // Return a default value if the API call fails
        return {
            head: "Oops!",
            info: "Gagal memuat fakta keuangan saat ini. Silakan coba lagi nanti."
        };
    }
}
