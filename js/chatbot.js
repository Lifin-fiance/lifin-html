/**
 * File: /js/chatbot.js
 * Description: Initializes the STANDALONE, reusable chatbot component.
 * It loads the HTML, injects styles, and then configures and runs the core chat logic from chat-manager.js.
 */
import { initializeChat } from './chat-manager.js';

document.addEventListener("DOMContentLoaded", () => {
    const chatbotContainer = document.getElementById('chatbot-container');
    if (!chatbotContainer) {
        // Silently fail if the container isn't on the page
        return;
    }

    // --- 1. Load Standalone Chatbot HTML and CSS ---
    fetch('/components/chatbot.html')
        .then(response => response.text())
        .then(html => {
            chatbotContainer.innerHTML = html;
            injectStyles();

            // --- 2. Logic to initialize the chat with the correct context ---
            const startChat = (specificMateriTitle = null) => {
                // Prevent re-initialization from race conditions
                const panel = document.getElementById('chatbot-panel');
                if (panel && panel.dataset.initialized) return;
                if (panel) panel.dataset.initialized = 'true';

                // Define the configuration for the standalone chatbot
                const standaloneChatConfig = {
                    isStandalone: true,
                    containerSelector: '#chatbot-panel',
                    inputSelector: '#chat-input',
                    sendBtnSelector: '#send-btn',
                    messagesSelector: '.chat-messages',
                    quickQuestionsContainerSelector: '#quick-questions-container',
                    materiJudul: specificMateriTitle, // Pass the specific title
                    messageTemplate: (message, sender) => {
                        const isOutgoing = sender === 'user';
                        const wrapperClass = `flex items-end gap-2 ${isOutgoing ? 'justify-end' : 'justify-start ml-[-20px]'}`;
                        const bubbleColor = isOutgoing ? 'bg-[#004b75]' : 'bg-[#04b3e3]';
                        const bubbleRadius = isOutgoing ? 'rounded-tl-[20px] rounded-tr-[20px] rounded-bl-[20px]' : 'rounded-tr-[20px] rounded-tl-[20px] rounded-br-[20px]';
                        const bubbleClasses = `${bubbleColor} text-white p-3 ${bubbleRadius} max-w-[85%] text-sm sm:text-base`;
                        
                        let content = `<p class="${bubbleClasses}">${message}</p>`;
                        if (!isOutgoing) {
                            content = `<img src="assets/images/mascotfin.png" class="w-16 h-16 object-contain rounded-full flex-shrink-0 z-10" />` + content;
                        }
                        
                        return `<div class="${wrapperClass}">${content}</div>`;
                    }
                };
                
                // Initialize the core chat logic with the specific config
                initializeChat(standaloneChatConfig);
            };

            // --- 3. FIX: Wait for materi.html to load its title before starting the chat ---
            if (window.location.pathname.includes('/materi.html')) {
                let attempts = 0;
                const interval = setInterval(() => {
                    const judulMateriElement = document.getElementById('judul-materi');
                    // Check if the element has meaningful content or if we should time out
                    if ((judulMateriElement && judulMateriElement.textContent && judulMateriElement.textContent !== 'Memuat...') || attempts >= 20) {
                        clearInterval(interval);
                        const title = judulMateriElement ? judulMateriElement.textContent : null;
                        console.log(`Materi page detected. Initializing chat with title: ${title}`);
                        startChat(title);
                    }
                    attempts++;
                }, 100); // Check every 100ms, timeout after 2 seconds
            } else {
                // On any other page, initialize immediately without a specific title.
                console.log("Not on materi page. Initializing chat for general use.");
                startChat();
            }
        })
        .catch(error => {
            console.error("Failed to load chatbot HTML:", error);
            chatbotContainer.innerHTML = "<p>Error loading chatbot.</p>";
        });

    const injectStyles = () => {
        const styles = `
            @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0');
            .font-baloo { font-family: 'Baloo 2', cursive; }
            .chat-messages::-webkit-scrollbar { width: 0px; }
            #chatbot-panel { transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out; }
            .chatbot-closed { transform: translateX(110%); opacity: 0; pointer-events: none; }
            .chatbot-open { transform: translateX(0); opacity: 1; pointer-events: auto; }
            #chat-input::placeholder { font-family: 'Baloo 2', cursive; font-weight: 600; color: #04b3e3; font-size: larger; }
        `;
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    };
});

