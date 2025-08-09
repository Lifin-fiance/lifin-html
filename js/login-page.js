// =================================================================
// LIFIN Login Page Script
// This script handles the event listeners for the combined auth page.
// =================================================================

// Import the authentication functions from the auth manager
// 'checkAuthState' has been removed as it now runs automatically from auth-manager.js
import {
  loginUser,
  registerUser,
  resetPassword,
  signInWithGoogle
} from './auth-manager.js';

// The auth state is now checked automatically by the onAuthStateChanged
// listener in auth-manager.js as soon as it's imported.
// No need to call a separate function here.

// Add event listeners once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // --- Login Form Elements ---
  const loginForm = document.getElementById('login-form');
  const loginEmailInput = document.getElementById('loginEmailInput');
  const loginPasswordInput = document.getElementById('loginPasswordInput');
  const googleLoginButton = document.getElementById('googleLoginButton');

  // --- Register Form Elements ---
  const registerForm = document.getElementById('register-form');
  const registerEmailInput = document.getElementById('registerEmailInput');
  const registerPasswordInput = document.getElementById('registerPasswordInput');
  const confirmPasswordInput = document.getElementById('confirmPasswordInput');

  // --- Forgot Password Form Elements ---
  const resetForm = document.getElementById('reset-form');
  const resetEmailInput = document.getElementById('resetEmailInput');

  // --- Event Listener for the Login Form ---
  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent the default form submission
      const email = loginEmailInput.value;
      const password = loginPasswordInput.value;
      loginUser(email, password);
    });
  }

  // --- Event Listener for the Google Login Button ---
  if (googleLoginButton) {
    googleLoginButton.addEventListener('click', () => {
      signInWithGoogle();
    });
  }

  // --- Event Listener for the Registration Form ---
  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = registerEmailInput.value;
      const password = registerPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      registerUser(email, password, confirmPassword);
    });
  }

  // --- Event Listener for the Password Reset Form ---
  if (resetForm) {
    resetForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = resetEmailInput.value;
      resetPassword(email);
    });
  }
});
