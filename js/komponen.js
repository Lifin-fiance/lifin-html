/**
 * File: src/js/main.js
 * Description: Loads reusable HTML components and initializes core scripts.
 */

// Function to fetch and load an HTML component into a specified element
const loadComponent = async (url, elementId) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} for ${url}`);
    }
    const text = await response.text();
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = text;
    }
  } catch (error) {
    console.error('Failed to load component:', error);
  }
};

// This function will run after the main HTML document has been loaded
document.addEventListener('DOMContentLoaded', () => {
  // Load the navbar and then its interactive script
  loadComponent('src/components/navbar.html', 'navbar-container')
    .then(() => {
      import('./navbar.js');
      import('./auth.js');
    });

  // Load the footer
  loadComponent('src/components/footer.html', 'footer-container');
  
  // Load the chatbot
  loadComponent('src/components/chatbot.html', 'chatbot-container')
    .then(() => {
      import('./chatbot.js');
    });

  // Load the contact form component and its script
  loadComponent('src/components/contact-form.html', 'contact-container')
    .then(() => {
      // Check if the form was actually loaded before trying to import its script
      if (document.getElementById('contact-form')) {
        import('./contact.js');
      }
    });
});
