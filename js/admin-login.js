// =================================================================
// LIFIN Admin Login Script
// Handles admin authentication and authorization.
// =================================================================

// Import Firebase functions and the centralized config
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const adminLoginForm = document.getElementById('admin-login-form');
const adminEmailInput = document.getElementById('adminEmailInput');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminLoginButton = document.getElementById('adminLoginButton');
const adminErrorMessage = document.getElementById('admin-error-message');

/**
 * Displays an error message on the login form.
 * @param {string} message The error message to display.
 */
function showLoginError(message) {
  adminErrorMessage.textContent = message;
}

/**
 * Checks if a user is an administrator by checking a specific 'admins' collection in Firestore.
 * @param {User} user The authenticated user object from Firebase Auth.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is an admin, false otherwise.
 */
async function isAdmin(user) {
  if (!user) return false;

  // Create a reference to the user's document in the 'admins' collection
  const adminDocRef = doc(db, "admins", user.uid);

  try {
    const docSnap = await getDoc(adminDocRef);
    // If the document exists, the user is an admin.
    return docSnap.exists();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false; // Fail safely
  }
}

/**
 * Handles the admin login form submission.
 * @param {Event} event The form submission event.
 */
async function handleAdminLogin(event) {
  event.preventDefault(); // Prevent default form submission
  showLoginError(''); // Clear previous errors
  adminLoginButton.disabled = true;
  adminLoginButton.textContent = 'Logging in...';

  const email = adminEmailInput.value;
  const password = adminPasswordInput.value;

  try {
    // 1. Sign in the user with their email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Check if the signed-in user is an admin
    const isUserAdmin = await isAdmin(user);

    if (isUserAdmin) {
      // 3. If they are an admin, redirect to the admin dashboard
      console.log("Admin login successful. Redirecting...");
      window.location.href = './admin-dashboard.html';
    } else {
      // 4. If not an admin, show an error and sign them out
      console.log("User is not an admin. Signing out.");
      await signOut(auth);
      showLoginError("You are not authorized to access this page.");
    }

  } catch (error) {
    // Handle Firebase authentication errors (e.g., wrong password, user not found)
    console.error("Admin login failed:", error.code, error.message);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      showLoginError("Invalid email or password.");
    } else {
      showLoginError("An unexpected error occurred. Please try again.");
    }
  } finally {
    // Re-enable the login button
    adminLoginButton.disabled = false;
    adminLoginButton.textContent = 'Login';
  }
}

// Attach the event listener to the form
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', handleAdminLogin);
}
