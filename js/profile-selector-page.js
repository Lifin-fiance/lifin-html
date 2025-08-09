// =================================================================
// LIFIN Onboarding Page Script
// This script handles the combined profile and level selection flow.
// =================================================================

import { saveUserProfile, saveUserLevel } from './auth-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let selectedJenjang = null;
    let userName = '';

    // --- DOM REFERENCES ---
    const profileStep = document.getElementById('profile-step');
    const levelStep = document.getElementById('level-step');
    
    const jenjangButtons = document.querySelectorAll('.jenjang-btn');
    const nameInput = document.getElementById('nameInput');
    const continueBtn = document.getElementById('continueBtn');
    
    const levelButtons = document.querySelectorAll('.level-btn');

    // --- FUNCTIONS ---

    /**
     * Checks if the form is ready to proceed to the next step.
     */
    function validateProfileStep() {
        userName = nameInput.value.trim();
        if (selectedJenjang && userName) {
            continueBtn.disabled = false;
        } else {
            continueBtn.disabled = true;
        }
    }

    /**
     * Transitions the view from the profile step to the level selection step.
     */
    async function goToLevelStep() {
        if (continueBtn.disabled) return;

        // Save the first part of the profile to Firestore
        const success = await saveUserProfile(userName, selectedJenjang);

        // Only proceed if the save was successful
        if (success) {
            profileStep.classList.add('hidden');
            levelStep.classList.remove('hidden');
        } else {
            // The auth-manager will show an error modal, so we just log it here.
            console.error("Failed to save user profile. Cannot proceed.");
        }
    }

    // --- EVENT LISTENERS ---

    // 1. Jenjang (Education Level) Selection
    jenjangButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'pressed' style from all buttons
            jenjangButtons.forEach(btn => btn.classList.remove('pressed'));
            // Add 'pressed' style to the clicked button
            button.classList.add('pressed');
            selectedJenjang = button.dataset.jenjang;
            validateProfileStep();
        });
    });

    // 2. Name Input
    nameInput.addEventListener('input', validateProfileStep);

    // 3. Continue Button
    continueBtn.addEventListener('click', goToLevelStep);

    // 4. Level Selection
    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedLevel = button.dataset.level;
            // This function will save the level and then redirect to the dashboard
            saveUserLevel(selectedLevel);
        });
    });

    // --- INITIALIZATION ---
    validateProfileStep(); // Initial check for the continue button state
});
