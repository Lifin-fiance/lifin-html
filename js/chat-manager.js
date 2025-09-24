/**
 * File: /js/chat-manager.js
 * Description: Core, reusable chat logic for both the standalone chatbot and the embedded Finlook page.
 * This module is configured and initialized by other scripts.
 */

// --- Shared configuration and state ---

// The system prompt will be loaded from an external file.
let systemPrompt = 'You are a helpful assistant.'; 
// A central place to hold all quick questions data once fetched.
let quickQuestionsData = null;

// The main exported function. It's now async to handle loading the prompt.
export async function initializeChat(config) {
    // --- 1. Load the System Prompt from external file ---
    try {
        const response = await fetch('/data/finny-system-prompt.txt');
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        systemPrompt = await response.text();
        console.log("System prompt loaded successfully.");
    } catch (error) {
        console.error("Failed to load system prompt:", error);
        // The initial value of systemPrompt will be used as a fallback.
    }
    
    // --- 2. Get DOM elements based on the provided configuration ---
    const chatContainer = document.querySelector(config.containerSelector);
    if (!chatContainer) {
        console.error(`Chat container with selector '${config.containerSelector}' not found.`);
        return;
    }

    const chatInput = chatContainer.querySelector(config.inputSelector);
    const sendBtn = chatContainer.querySelector(config.sendBtnSelector);
    const chatMessages = chatContainer.querySelector(config.messagesSelector);
    const quickQuestionsContainer = chatContainer.querySelector(config.quickQuestionsContainerSelector);

    if (!chatInput || !sendBtn || !chatMessages || !quickQuestionsContainer) {
        console.error("One or more required chat elements are missing inside the container.");
        return;
    }

    // --- 3. Core Chat Functions (shared logic) ---

    const appendMessage = (message, sender) => {
        // Use the message template provided in the config to build the correct HTML
        const messageHTML = config.messageTemplate(message, sender);
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = messageHTML.trim();
        
        const appendedNode = messageDiv.firstChild;
        if (appendedNode) {
            chatMessages.appendChild(appendedNode);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        return appendedNode;
    };

    const generateResponse = async (userMessage) => {
        const typingIndicator = appendMessage("Mengetik...", "finny");
        if (typingIndicator) {
            typingIndicator.classList.add('typing-indicator');
            // Check if the p element exists before adding classes
            const pElement = typingIndicator.querySelector('p');
            if(pElement) pElement.classList.add('italic', 'opacity-75');
        }

        try {
            const response = await fetch("/api/chat-proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // SUGGESTION 1: The 'model' is no longer specified here. 
                // It will be handled by the server-side proxy.
                body: JSON.stringify({
                    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
                    temperature: 0.7,
                    max_tokens: 1024,
                    stream: false
                })
            });
            if (!response.ok) {
                // Try to parse the error response from the server
                const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const finnyResponse = data.choices[0]?.message?.content?.trim() || "Maaf, ada sedikit gangguan. Coba lagi ya!";
            
            const indicatorToRemove = chatMessages.querySelector('.typing-indicator');
            if (indicatorToRemove) indicatorToRemove.remove();

            appendMessage(finnyResponse, "finny");

        } catch (error) {
            console.error("Error calling chat proxy:", error);
            const indicatorToRemove = chatMessages.querySelector('.typing-indicator');
            if (indicatorToRemove) indicatorToRemove.remove();
            
            // SUGGESTION 2: Enhanced error handling with a retry mechanism.
            const errorMessage = "Oops! Ada yang salah. Coba lagi nanti ya.";
            const errorNode = appendMessage(errorMessage, "error"); // Use a new 'error' sender type
            
            const retryButton = document.createElement('button');
            retryButton.innerText = 'Coba Lagi';
            retryButton.className = 'ml-3 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-semibold';
            
            const pElement = errorNode.querySelector('p');
            if (pElement) {
                 pElement.appendChild(retryButton);
            }

            retryButton.addEventListener('click', () => {
                errorNode.remove();
                generateResponse(userMessage); // Retry with the same user message
            });
        }
    };

    const handleChat = (message) => {
        const userMessage = (message || chatInput.value).trim();
        if (!userMessage) return;
        appendMessage(userMessage, "user");
        chatInput.value = "";
        setTimeout(() => generateResponse(userMessage), 600);
    };

    const renderQuickQuestions = async () => {
        try {
            if (!quickQuestionsData) {
                const response = await fetch('./data/pertanyaan-kilat.json');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                quickQuestionsData = await response.json();
            }
            
            let questionsToShow = [];
            if (config.materiJudul && quickQuestionsData[config.materiJudul]) {
                questionsToShow = quickQuestionsData[config.materiJudul];
            } else {
                questionsToShow = Object.values(quickQuestionsData).flat();
            }

            if (questionsToShow.length === 0) {
                 console.warn("No quick questions found for this context.");
                 quickQuestionsContainer.innerHTML = ''; 
                 return;
            }

            quickQuestionsContainer.innerHTML = ''; 
            const button = document.createElement('button');
            button.className = 'w-full py-3 bg-[#ffc72c] rounded-full flex items-center justify-center relative text-white text-lg font-baloo font-extrabold hover:bg-yellow-500 transition-colors shadow-md';
            button.innerHTML = `
                <img src="assets/images/bolt.svg" alt="Bolt Icon" class="w-6 h-6 absolute left-5" />
                <span>Pertanyaan Kilat</span>
            `;

            button.addEventListener('click', () => {
                const randomIndex = Math.floor(Math.random() * questionsToShow.length);
                handleChat(questionsToShow[randomIndex]);
            });
            quickQuestionsContainer.appendChild(button);

        } catch (error) {
            console.error("Could not fetch or render quick questions:", error);
            quickQuestionsContainer.innerHTML = '<p class="text-center text-red-500 text-sm">Gagal memuat pertanyaan kilat.</p>';
        }
    };

    // --- 4. Setup Event Listeners ---
    sendBtn.addEventListener("click", () => handleChat());
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });

    renderQuickQuestions();

    // --- 5. Handle Standalone-Specific Logic ---
    if (config.isStandalone) {
        const chatbotPanel = document.getElementById("chatbot-panel");
        const chatbotToggler = document.getElementById("chatbot-toggler");
        const closeBtn = document.getElementById("close-btn");

        if(chatbotPanel && chatbotToggler && closeBtn) {
            const toggleChatbot = (show) => {
                if (show) {
                    chatbotPanel.classList.remove("chatbot-closed");
                    chatbotPanel.classList.add("chatbot-open");
                    chatbotToggler.classList.add("opacity-0", "pointer-events-none");
                } else {
                    chatbotPanel.classList.remove("chatbot-open");
                    chatbotPanel.classList.add("chatbot-closed");
                    chatbotToggler.classList.remove("opacity-0", "pointer-events-none");
                }
            };

            chatbotToggler.addEventListener("click", () => toggleChatbot(true));
            closeBtn.addEventListener("click", () => toggleChatbot(false));
            window.addEventListener('click', (e) => {
                if (chatbotPanel.classList.contains('chatbot-open') && !chatbotPanel.contains(e.target) && !chatbotToggler.contains(e.target)) {
                    toggleChatbot(false);
                }
            });
        }
    }
}
