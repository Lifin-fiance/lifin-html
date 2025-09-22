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

            // --- 2. Define the configuration for the standalone chatbot ---
            const standaloneChatConfig = {
                isStandalone: true,
                containerSelector: '#chatbot-panel',
                inputSelector: '#chat-input',
                sendBtnSelector: '#send-btn',
                messagesSelector: '.chat-messages',
                quickQuestionsContainerSelector: '#quick-questions-container',
                // Template for how messages should look in the standalone chat
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
            
            // --- 3. Initialize the core chat logic with the specific config ---
            initializeChat(standaloneChatConfig);
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
