/**
 * File: /js/finlook.js
 * Description: Initializes the EMBEDDED Finlook chatbot.
 * It configures and runs the core chat logic from chat-manager.js for the dashboard page.
 */
import { initializeChat } from './chat-manager.js';

export function initFinlookChat() {
    console.log("Initializing embedded Finlook chat via chat-manager...");

    // --- 1. Define the configuration for the embedded chatbot ---
    const finlookChatConfig = {
        isStandalone: false, // This is an embedded chat
        containerSelector: '#mainContent', // The chat UI is inside the main content area
        inputSelector: '#chat-input',
        sendBtnSelector: '#send-btn',
        messagesSelector: '.chat-messages',
        quickQuestionsContainerSelector: '.quick-questions-container',
        // Template for how messages should look in the Finlook page
        messageTemplate: (text, sender) => {
            const isUser = sender === 'user';
            const wrapperClass = `flex items-end gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`;
            const finnyBubbleClasses = "bg-[#04b3e3] text-white p-3 rounded-tr-[20px] rounded-tl-[20px] rounded-br-[20px] max-w-[85%]";
            const userBubbleClasses = "bg-[#004b75] text-white p-3 rounded-tl-[20px] rounded-tr-[20px] rounded-bl-[20px] max-w-[85%]";
            const bubbleClasses = isUser ? userBubbleClasses : finnyBubbleClasses;

            let content = `<div class="${bubbleClasses}"><p class="text-sm sm:text-base">${text}</p></div>`;
            if (!isUser) {
                content = `<img src="assets/images/mascotfin.png" alt="Finny" class="w-10 h-10 object-contain rounded-full flex-shrink-0 self-start" />` + content;
            }

            return `<div class="${wrapperClass}">${content}</div>`;
        }
    };

    // --- 2. Initialize the core chat logic with the specific config ---
    initializeChat(finlookChatConfig);
}
