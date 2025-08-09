// =================================================================
// LIFIN Dashboard: UI Manager
// This module handles all direct manipulation of the DOM,
// such as rendering content, updating styles, and managing modals.
// =================================================================

/**
 * Opens the main profile panel and populates it with user data.
 * @param {object} userProfile - The user's profile data from Firestore.
 */
export function openProfilePanel(userProfile) {
    const profileOverlay = document.getElementById("profileOverlay");
    const profilePanel = document.getElementById("profilePanel");
    const namaUserSpan = document.getElementById("namaUser");
    const inputNama = document.getElementById("inputNama");

    if (userProfile) {
        namaUserSpan.textContent = userProfile.nama || "Tamu";
        inputNama.value = userProfile.nama || "";
    } else {
        namaUserSpan.textContent = "Tidak Ditemukan";
    }

    profileOverlay.classList.remove("hidden");
    profileOverlay.classList.add("flex");
    setTimeout(() => {
        profilePanel.classList.remove("opacity-0", "scale-95");
        profilePanel.classList.add("opacity-100", "scale-100");
    }, 10);
}

/**
 * Closes the main profile panel.
 */
export function closeProfilePanel() {
    const profileOverlay = document.getElementById("profileOverlay");
    const profilePanel = document.getElementById("profilePanel");
    profilePanel.classList.remove("opacity-100", "scale-100");
    profilePanel.classList.add("opacity-0", "scale-95");
    setTimeout(() => {
        profileOverlay.classList.add("hidden");
        profileOverlay.classList.remove("flex");
    }, 200);
}

/**
 * Opens a modal dialog by its ID.
 * @param {string} modalId - The ID of the modal element to open.
 */
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
}

/**
 * Closes a modal dialog by its ID.
 * @param {string} modalId - The ID of the modal element to close.
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

/**
 * Displays a temporary toast notification at the bottom of the screen.
 * @param {string} message - The message to display in the toast.
 */
export function showToast(message) {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.style.bottom = '80px'; // For mobile view
    if (window.innerWidth >= 1024) { // lg breakpoint
        toast.style.bottom = '20px';
    }
    setTimeout(() => {
        toast.style.bottom = '-100px';
    }, 3000);
}

/**
 * Updates the visual state of the top and bottom navigation bars.
 * @param {string} page - The name of the currently active page (e.g., 'home', 'game').
 */
export function updateActiveNav(page) {
    const highlight = document.getElementById('highlight');
    const navbarWrapper = document.getElementById('navbarWrapper');
    const mobilePageTitle = document.getElementById('mobilePageTitle');

    // --- Mobile Nav Update ---
    const styleMap = {
        home:   { activeIcon: 'assets/images/home-hover.svg',  color: 'text-[#FF6B6B]' },
        game:   { activeIcon: 'assets/images/game-hover.svg',  color: 'text-[#004B75]' },
        materi: { activeIcon: 'assets/images/materi-hover.svg',color: 'text-[#FFC72C]' },
        panel:  { activeIcon: 'assets/images/panel-hover.svg', color: 'text-[#00BFC3]' },
        finlook:{ color: 'text-[#22C55E]' }
    };
    document.querySelectorAll('.bottom-nav-btn').forEach(btn => {
        const pageId = btn.id.replace('nav-', '');
        const img = btn.querySelector('img');
        const span = btn.querySelector('span');
        if (img && pageId !== 'finlook') {
             img.src = `assets/images/${pageId}-icon.svg`;
        }
        if (span) {
            Object.values(styleMap).forEach(style => span.classList.remove(style.color));
            span.classList.add('text-gray-500');
        }
    });
    const activeBtn = document.getElementById(`nav-${page}`);
    if (activeBtn) {
        const styles = styleMap[page];
        if (styles) {
            const img = activeBtn.querySelector('img');
            const span = activeBtn.querySelector('span');
            if (img && styles.activeIcon) img.src = styles.activeIcon;
            if (span && styles.color) {
                span.classList.remove('text-gray-500');
                span.classList.add(styles.color);
            }
        }
    }
    mobilePageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);

    // --- Desktop Nav Update ---
    if (highlight && navbarWrapper) {
        const pageColors = {
            home: { bg: "#FF6B6B", wrapperBg: "rgba(255,107,107,0.5)" },
            game: { bg: "#004B75", wrapperBg: "rgba(0,75,117,0.5)" },
            finlook: { bg: "#22C55E", wrapperBg: "rgba(34,197,94,0.5)" },
            materi: { bg: "#FFC72C", wrapperBg: "rgba(255,199,44,0.5)" },
            panel: { bg: "#00BFC3", wrapperBg: "rgba(0,191,195,0.5)" }
        };

        const colors = pageColors[page] || pageColors.home;
        navbarWrapper.style.backgroundColor = colors.wrapperBg;
        
        const activeDesktopBtn = document.getElementById(`desktop-nav-${page}`);
        
        if (page === 'finlook' || !activeDesktopBtn) {
            highlight.style.opacity = '0';
        } else {
            highlight.style.opacity = '1';
            highlight.style.backgroundColor = colors.bg;

            if (page === 'home') {
                highlight.style.width = '190px';
                highlight.style.left = '0px';
            } else if (page === 'panel') {
                highlight.style.width = '190px';
                highlight.style.left = '700px';
            } else {
                highlight.style.width = '170px';
                const btnCenter = activeDesktopBtn.offsetLeft + (activeDesktopBtn.offsetWidth / 2);
                highlight.style.left = `${btnCenter - 85}px`;
            }
        }
    }
}

/**
 * Generates the HTML content for a specific page within the dashboard.
 * @param {string} page - The name of the page to generate.
 * @param {object} userProfile - The user's profile data.
 * @param {Array} allMateri - The full array of lesson data from materi.json.
 * @returns {string} The HTML string for the page.
 */
export function generatePageContent(page, userProfile, allMateri) {
    switch (page) {
        // This is the updated 'finlook' case for your generatePageContent function in js/ui-manager.js

case "finlook":
    // This case returns the revamped HTML structure for the Finlook chatbot.
    return `
        <div class="w-full h-full flex items-center justify-center p-4 bg-gray-50">
            <div id="chatbot-panel" class="w-full max-w-2xl h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                
                <!-- Chat Header -->
                <div class="p-4 bg-white border-b border-gray-200 flex items-center gap-4 flex-shrink-0">
                    <img src="assets/images/mascotfin.png" alt="Finny Mascot" class="w-12 h-12 object-contain rounded-full">
                    <div>
                        <h2 class="text-lg font-bold text-gray-800">Finny</h2>
                        <p class="text-sm text-green-500 flex items-center gap-1.5">
                            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                            Online
                        </p>
                    </div>
                </div>

                <!-- Chat Messages Area -->
                <div class="flex-1 p-6 space-y-6 overflow-y-auto chat-messages bg-gray-50">
                    <!-- Messages will be dynamically added here -->
                    <div class="flex items-end gap-3 w-full justify-start">
                        <img src="assets/images/mascotfin.png" alt="Finny" class="w-10 h-10 object-contain rounded-full flex-shrink-0 self-start">
                        <div class="bg-[#04b3e3] text-white p-3 rounded-tr-[20px] rounded-tl-[20px] rounded-br-[20px] max-w-[85%] text-sm sm:text-base">
                            <p class="text-base">Halo! Namaku FINNY! Mau nanyain apa nih seputar keuangan?</p>
                        </div>
                    </div>

                </div>


                <!-- Quick Questions Container -->
                <div class="p-4 bg-white border-t border-gray-200 quick-questions-container">
                    <!-- Pertanyaan Kilat button will be dynamically added here -->
                </div>

                <!-- User Input (Restored Style) -->
                <div class="p-3 sm:p-4 bg-white border-t-2 border-gray-100">
                    <div class="flex items-center w-full bg-white border-2 border-[#04b3e3] rounded-[50px] pr-3">
                        <input id="chat-input" type="text" placeholder="Mau nanya apa?" class="flex-1 bg-transparent outline-none p-3 sm:p-4 text-gray-700 text-sm sm:text-base"/>
                        <button id="send-btn" class="flex-shrink-0">
                            <img src="assets/images/send-icon.svg" alt="Kirim" class="w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity">
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
                
        case "game":
            return `
            <div class="flex mt-7 flex-col gap-8 lg:gap-10 p-4 lg:px-24 lg:py-8 max-w-screen-xl mx-auto">
                <button type="button" onclick="window.location.href='games/dompet-pintar/index.html'" class="group button-3d relative w-full h-48 lg:h-[168px] rounded-3xl bg-[#04B3E3] shadow-[0_10px_0_#038DB4] flex flex-col justify-center text-left p-6 lg:pl-[124px] focus:outline-none overflow-hidden">
                    <img src="assets/images/3dmoney.png" alt="Money" class="absolute -top-3 -right-10 w-48 lg:w-[373.5px] lg:right-[-90px] lg:top-[-40px] transition-transform duration-300 group-hover:scale-110" />
                    <h3 class="font-extrabold text-3xl lg:text-[45px] text-white text-outline leading-tight">DOMPET<br>PINTAR</h3>
                    <div class="mt-4 lg:absolute lg:right-[120px] lg:top-1/2 lg:transform lg:-translate-y-1/2 w-48 lg:w-[254px] h-14 lg:h-[72px] bg-white rounded-full flex items-center justify-center"><span class="text-black text-2xl lg:text-[40px] font-extrabold">MAINKAN</span></div>
                </button>
                <button type="button" class="group button-3d relative w-full h-48 lg:h-[168px] rounded-3xl bg-[#FFD635] shadow-[0_10px_0_#D4B000] flex flex-col justify-center text-left p-6 lg:pl-[200px] focus:outline-none overflow-hidden">
                    <img src="assets/images/raceflag.png" alt="Race Flag" class="absolute bottom-5 -right-[70px] w-48 transform rotate-180 transition-transform duration-300 lg:w-[350px] lg:left-[-128px] lg:top-[10px] lg:rotate-0 group-hover:scale-110" />
                    <h3 class="font-extrabold text-3xl lg:text-[45px] text-white text-outline leading-tight z-10">FINANCE QUIZ<br>RACE</h3>
                    <div class="mt-4 lg:absolute lg:right-[120px] lg:top-1/2 lg:transform lg:-translate-y-1/2 w-48 lg:w-[254px] h-14 lg:h-[72px] bg-white rounded-full flex items-center justify-center z-10"><span class="text-black text-2xl lg:text-[40px] font-extrabold">MAINKAN</span></div>
                </button>
                <button type="button" class="group button-3d mb-12 relative w-full h-48 lg:h-[168px] rounded-3xl bg-[#FF6B6B] shadow-[0_10px_0_#D44F4F] flex flex-col justify-center text-left p-6 lg:pl-[40px] focus:outline-none overflow-hidden">
                    <h3 class="font-extrabold text-3xl lg:text-[45px] text-white text-outline leading-tight">INVESTOR CILIK</h3>
                    <div class="mt-4 mb-10 lg:absolute lg:right-[120px] lg:top-1/2 lg:transform lg:-translate-y-1/2 w-48 lg:w-[254px] h-14 lg:h-[72px] bg-white rounded-full flex items-center justify-center"><span class="text-black text-2xl lg:text-[40px] font-extrabold">MAINKAN</span></div>
                </button>
            </div>`;
        case "materi":
            if (!userProfile || !allMateri) return `<div class="text-center text-red-500 p-10">Gagal memuat data pengguna atau materi.</div>`;
            
            const currentLevel = userProfile.level || 'Beginner';
            let materiToShow;
            let levelTitle;
            const lessonsCompleted = userProfile.progress[currentLevel] || 0;
            let levelStartMateri = 0;

            switch(currentLevel) {
                case 'Smart Spender': 
                    materiToShow = allMateri.slice(10, 20); 
                    levelTitle = 'SMART SPENDER'; 
                    levelStartMateri = 10;
                    break;
                case 'Future Investor': 
                    materiToShow = allMateri.slice(20, 30); 
                    levelTitle = 'INVESTOR CILIK';
                    levelStartMateri = 20;
                    break;
                default: 
                    materiToShow = allMateri.slice(0, 10); 
                    levelTitle = 'BEGINNER';
                    levelStartMateri = 0;
                    break;
            }

            const progressInLevelMateri = Math.max(0, lessonsCompleted - levelStartMateri);
            const progressPercent = (progressInLevelMateri / 10) * 100;

            const materiListHTML = materiToShow.map(materi => {
                const isLocked = materi.Nomor > lessonsCompleted + 1;
                const bgColor = isLocked ? 'bg-gray-400' : 'bg-[#04B3E3]';
                const buttonColor = isLocked ? 'bg-gray-500' : 'bg-[#FFD635]';
                const buttonShadow = isLocked ? 'shadow-[0_5px_0_#9ca3af]' : 'shadow-[0_5px_0_#D4B000]';
                const buttonText = isLocked ? 'Terkunci' : 'Mulai';

                return `
                <div class="w-full h-auto ${bgColor} rounded-[64px] mt-8 p-4 lg:p-3 materi-item flex flex-col lg:flex-row lg:items-center">
                    <div class="flex items-center w-full">
                        <div class="w-16 h-16 lg:w-20 lg:h-20 bg-[#004B75] rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-white text-2xl lg:text-3xl font-extrabold">Lv ${materi.Nomor}</span>
                        </div>
                        <div class="flex-1 px-4 text-left">
                            <span class="text-white text-base lg:text-xl font-bold" style="font-family: 'Poppins', sans-serif;">${materi["Judul Materi"]}</span>
                        </div>
                    </div>
                    <div class="w-full flex justify-center lg:justify-end mt-4 lg:mt-0 lg:w-auto">
                        <button data-action="buka-materi" data-nomor="${materi.Nomor}" 
                                class="button-3d button2 w-full max-w-xs lg:w-auto h-12 lg:h-14 ${buttonColor} text-black text-xl lg:text-2xl font-extrabold rounded-full lg:px-8 ${buttonShadow} focus:outline-none flex-shrink-0 ${isLocked ? 'cursor-not-allowed' : ''}"
                                ${isLocked ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>
                </div>`;
            }).join("");

            return `
                <div class="w-full max-w-screen-lg mx-auto flex flex-col items-center gap-4 p-4 mt-7">
                    <div class="w-full h-20 bg-[#04B3E3] rounded-[64px] flex items-center justify-center materi-item">
                        <div class="text-3xl lg:text-[40px] font-extrabold text-white">${levelTitle}</div>
                    </div>
                    <div class="w-full max-w-4xl -mt-8 z-10 ">
                        <div class="h-10 lg:h-12 bg-white border-2 border-black rounded-[64px] relative overflow-hidden p-1 flex items-center justify-center">
                            <div class="absolute top-0 left-0 h-full bg-[#FFD635] rounded-[64px] transition-all duration-500" style="width: ${progressPercent}%;"></div>
                            <span class="relative z-10 text-black text-sm lg:text-base font-semibold" style="font-family: 'Poppins', sans-serif;">${progressPercent.toFixed(0)}% Complete</span>
                        </div>
                    </div>
                    <div class="relative w-full">
                        <div class="w-full h-[55vh] lg:h-[440px] overflow-y-auto flex flex-col items-center space-y-4 lg:space-y-6 p-2 no-scrollbar">${materiListHTML}</div>
                        <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                    <div class="py-4 text-center mx-auto text-base lg:text-xl font-extrabold">
                        <button data-action="switch-level" class="text-[#04B3E3] cursor-pointer hover:underline">
                           levelnya terlalu susah? beralih level →
                        </button>
                    </div>
                </div>`;

        case "panel":
            return `
            <div class="flex flex-col items-center p-4 max-w-screen-xl mx-auto">
                <div class="flex items-center gap-3 mx-auto mb-8 mt-7 text-center">
                    <span class="text-2xl lg:text-3xl font-extrabold text-[#04B3E3]">Klik Fitur Yang Kamu Butuhin</span>
                    <img src="assets/images/touch.svg" alt="Touch Icon" class="w-8 h-8 hidden lg:w-10 lg:h-10">
                </div>
                <div class="w-full flex  flex-col lg:mb-[96px] mb-12 gap-16 lg:flex-row lg:gap-16">
                    <button type="button" onclick="window.location.href='Features/kalkulator-keuangan.html'" class="button-3d relative w-full lg:w-1/2 h-[100px] lg:h-[396px] rounded-3xl bg-[#04B3E3] shadow-[0_10px_0_#038DB4] flex items-center justify-center text-center overflow-hidden focus:outline-none p-4">
                        <div class="absolute bottom-0 left-0 w-20 h-20 lg:w-[125px] lg:h-[125px] bg-white rounded-tr-full"><img src="assets/images/icon-kalku.svg" alt="Kalku Icon" class="absolute w-16 lg:w-[100px] bottom-[-5px] right-[22px] lg:bottom-[-10px] lg:right-[45px]"></div>
                        <img src="assets/images/pvkalku.png" alt="Kalkulator Icon" class="absolute top-[260px] -translate-y-1/2 right-[-80px] w-[400px] lg:w-[582px] lg:top-[150px] lg:right-[-120px] opacity-60 -rotate-[15deg] z-0">
                        <div class="z-10 text-4xl lg:text-5xl xl:text-[64px] text-white leading-tight lg:-translate-y-12">KALKULATOR<br>KEUANGAN</div>
                    </button>
                    <button type="button" onclick="window.location.href='Features/mesin-waktu-finansial.html'" class="button-3d relative w-full lg:w-1/2 h-[100px] lg:h-[396px] rounded-3xl bg-[#FFD635] shadow-[0_10px_0_#D4B000] flex items-center justify-center text-center overflow-hidden focus:outline-none p-4">
                        <div class="absolute bottom-0 right-0 w-20 h-20 lg:w-[125px] lg:h-[125px] bg-white rounded-tl-full"><img src="assets/images/icon-sand.svg" alt="Sand Icon" class="absolute w-16 lg:w-[100px] bottom-[-5px] left-[22px] lg:bottom-[-10px] lg:left-[50px]"></div>
                        <img src="assets/images/pvtm.png" alt="Mesin Waktu Icon" class="absolute top-[240px] -translate-y-1/2 left-[-80px] w-[400px] lg:w-[582px] lg:top-[150px] lg:left-[-120px] opacity-60 rotate-[15deg] z-0">
                        <div class="z-10 text-4xl lg:text-5xl xl:text-[64px] text-white font-extrabold leading-tight lg:-translate-y-12">MESIN WAKTU<br>FINANSIAL</div>
                    </button>
                </div>
            </div>`;

        default: // home
            const circleLength = 678;
            let progressPercentage = 0;
            let homeLessonsCompleted = 0; 
            let levelStart = 0;
            
            if (userProfile && userProfile.progress) {
                const currentLevel = userProfile.level || 'Beginner';
                homeLessonsCompleted = userProfile.progress[currentLevel] || 0;

                switch (currentLevel) {
                    case 'Smart Spender':
                        levelStart = 10;
                        break;
                    case 'Future Investor':
                        levelStart = 20;
                        break;
                    default: // Beginner
                        levelStart = 0;
                        break;
                }
                
                const progressInLevel = Math.max(0, homeLessonsCompleted - levelStart);
                progressPercentage = (progressInLevel / 10) * 100;
            }

            const offset = circleLength * (1 - progressPercentage / 100);

            return `
            <div class="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="w-full mx-auto mt-10 flex flex-col lg:flex-row gap-8">
                    <div class="flip-container aspect-[4/5] lg:aspect-video cursor-pointer w-full lg:w-2/3" data-action="flip-card">
                        <div class="flip-inner">
                            <div class="face front">
                                <div class="flex flex-col items-center justify-center gap-4">
                                    <div id="card-head-text" class="text-4xl md:text-5xl lg:text-[64px] font-bold leading-tight text-outline px-4">Memuat...</div>
                                    <div class="tap-label text-xl sm:text-2xl">Tap to Flip</div>
                                </div>
                                <div class="corner"><img src="assets/images/flashfin.png" alt="FlashFin" /></div>
                            </div>
                            <div class="face back">
                                <div class="absolute inset-0 flex items-center justify-center px-6 text-center">
                                    <div id="card-info-text" class="text-2xl md:text-3xl lg:text-[40px] leading-relaxed">Memuat info...</div>
                                </div>
                                <div class="corner"><img src="assets/images/flashfin.png" alt="FlashFin" /></div>
                                <img src="assets/images/searchbar.svg" alt="Cari di Google" data-action="search-google" class="absolute bottom-4 right-4 w-[48px] h-[48px] lg:bottom-6 lg:right-6 lg:w-[60px] lg:h-[60px] cursor-pointer hover:scale-125 transition" />
                            </div>
                        </div>
                    </div>
                    <div class="w-full lg:w-1/3 h-auto lg:h-[440px] bg-[#FFD635] rounded-[32px] relative flex flex-col items-center py-8 lg:pt-[32px]">
                        <div class="w-[200px] md:w-[263px] h-[40px] bg-white rounded-bl-[32px] rounded-br-[32px] flex items-center justify-center absolute top-0 left-1/2 -translate-x-1/2">
                            <p class="text-2xl md:text-[32px] font-extrabold text-[#000]">Progressmu</p>
                        </div>
                        <div class="w-[200px] h-[200px] md:w-[270px] md:h-[270px] relative mt-8 md:mt-[38px]">
                            <svg class="absolute top-0 left-0" width="100%" height="100%" viewBox="0 0 270 270"><circle cx="135" cy="135" r="108" stroke="#fff" stroke-width="24" fill="none" /><circle id="progressCircle" cx="135" cy="135" r="108" stroke="#FF6B6B" stroke-width="24" fill="none" stroke-linecap="round" stroke-dasharray="${circleLength}" stroke-dashoffset="${offset.toFixed(2)}" transform="rotate(-90 135 135)" class="transition-stroke" /></svg>
                            <div class="absolute inset-0 flex items-center justify-center"><p id="progressValue" class="text-white text-4xl md:text-[48px] font-extrabold">${progressPercentage.toFixed(0)}%</p></div>
                        </div>
                        <button data-action="set-page" data-page="materi" class="button-3d mt-6 md:mt-[15px] w-[220px] md:w-[265px] h-[49px] bg-white rounded-[32px] shadow-[0_6px_0_rgba(255,255,255,0.65)] text-[#04B3E3] text-xl md:text-[24px] font-extrabold focus:outline-none">Lanjut Belajar</button>
                    </div>
                </div>
                <div class="h-16"></div>
                <div class="w-full mx-auto mb-16 flex flex-col md:flex-row gap-6">
                    <button type="button" class="button-3d w-full h-[180px] md:h-[240px] bg-[#FF6B6B] rounded-[32px] shadow-[0_10px_0_0_#D44F4F] flex flex-col items-center justify-center focus:outline-none p-4 mb-5"><img src="assets/images/berita.svg" alt="Judi Konyol" class="w-[90px] h-[90px] md:w-[134px] md:h-[139px] mb-2 md:mb-[12px]"><p class="text-white text-3xl md:text-[36px] font-extrabold">Judi Konyol</p></button>
                    <button type="button" class="button-3d w-full h-[180px] md:h-[240px] bg-[#04B3E3] rounded-[32px] shadow-[0_10px_0_0_#038DB4] flex flex-col items-center justify-center focus:outline-none p-4"><img src="assets/images/juol.svg" alt="Berita" class="w-[100px] h-[90px] md:w-[146px] md:h-[127px] mb-2 md:mb-[12px]"><p class="text-white text-3xl md:text-[36px] font-extrabold">Berita</p></button>
                </div>
            </div>`;
    }
}

/**
 * Updates the text of the flashcard.
 * @param {string} head - The main heading text.
 * @param {string} info - The detailed info text for the back of the card.
 */
export function updateFlashcard(head, info) {
    const headEl = document.getElementById('card-head-text');
    const infoEl = document.getElementById('card-info-text');
    if (headEl) headEl.textContent = head;
    if (infoEl) infoEl.textContent = info;
}
