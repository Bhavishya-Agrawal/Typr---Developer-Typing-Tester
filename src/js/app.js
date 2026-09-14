import { themes, applyTheme } from "./themes.js";

// DOM Elements
const modeBtns = document.querySelectorAll(".mode-btn");
const langBtns = document.querySelectorAll(".lang-btn");
const optionsBar = document.getElementById("optionsBar");
const codeDisplay = document.getElementById("codeDisplay");
const codeHeaderTitle = document.getElementById("codeHeaderTitle");

const wpmMetric = document.getElementById("wpmMetric");
const accMetric = document.getElementById("accMetric");
const timeMetric = document.getElementById("timeMetric");

const restartBtn = document.getElementById("restartBtn");
const nextBtn = document.getElementById("nextBtn");

const resultsView = document.getElementById("resultsView");
const finalWPM = document.getElementById("finalWPM");
const finalAcc = document.getElementById("finalAcc");
const finalTime = document.getElementById("finalTime");
const resultsNextBtn = document.getElementById("resultsNextBtn");
const resultsRetryBtn = document.getElementById("resultsRetryBtn");

const themeDrawer = document.getElementById("themeDrawer");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeCloseBtn = document.getElementById("themeCloseBtn");
const themeGrid = document.getElementById("themeGrid");

// State
let db = null;
let currentLang = "python";
let currentMode = "snippet";
let timeLimit = 30;
let wordLimit = 50;

let snippetText = "";
let inputText = "";
let idx = 0;
let startedAt = null;
let timerId = null;

// Helper Functions
function getBucket(lang, bucket) {
    if (!db || !db.languages) {
        console.error("Database not loaded");
        return [];
    }
    const langNode = db.languages[lang];
    if (!langNode) {
        console.error(`Language ${lang} not found in database`);
        return [];
    }
    const list = langNode[bucket];
    if (!Array.isArray(list)) {
        console.error(`Bucket ${bucket} not found for ${lang}`);
        return [];
    }
    return list;
}

function pickSnippetFromBucket(lang, bucket) {
    const list = getBucket(lang, bucket);
    if (!list.length) {
        console.error(`No snippets found for ${lang} in ${bucket}`);
        return "";
    }
    const i = Math.floor(Math.random() * list.length);
    return list[i];
}

function buildSnippet() {
    console.log(`Building snippet: mode=${currentMode}, lang=${currentLang}`);
    
    if (currentMode === "snippet") {
        // Pick a random size for snippet mode
        const pool = ["words30", "words50", "words100"];
        const bucket = pool[Math.floor(Math.random() * pool.length)];
        console.log(`Snippet mode: using ${bucket}`);
        return pickSnippetFromBucket(currentLang, bucket);
    }
    
    if (currentMode === "words") {
        const bucket = `words${wordLimit}`;
        console.log(`Words mode: using ${bucket}`);
        return pickSnippetFromBucket(currentLang, bucket);
    }
    
    if (currentMode === "time") {
        // For time mode, concatenate multiple snippets
        console.log(`Time mode: ${timeLimit}s`);
        const parts = [];
        let totalWords = 0;
        const targetWords = timeLimit === 15 ? 60 : timeLimit === 30 ? 120 : 200;
        
        while (totalWords < targetWords) {
            const snippet = pickSnippetFromBucket(currentLang, "words50") || 
                           pickSnippetFromBucket(currentLang, "words30");
            if (!snippet) break;
            
            const words = snippet.split(/\s+/).filter(Boolean).length;
            parts.push(snippet);
            totalWords += words;
        }
        
        return parts.join("\n\n");
    }
    
    return "";
}

function setHeader() {
    const modeText = currentMode === "snippet" ? "snippet" : 
                    currentMode === "time" ? `${timeLimit}s` : 
                    `${wordLimit} words`;
    codeHeaderTitle.textContent = `${currentLang} · ${modeText}`;
}

function updateOptions() {
    optionsBar.innerHTML = "";
    
    if (currentMode === "time") {
        [15, 30, 60].forEach(t => {
            const b = document.createElement("button");
            b.className = "chip";
            b.textContent = `${t}s`;
            if (t === timeLimit) b.classList.add("active");
            b.onclick = () => {
                timeLimit = t;
                updateOptions();
                resetSession(true);
            };
            optionsBar.appendChild(b);
        });
    } else if (currentMode === "words") {
        [30, 50, 100].forEach(w => {
            const b = document.createElement("button");
            b.className = "chip";
            b.textContent = `${w} words`;
            if (w === wordLimit) b.classList.add("active");
            b.onclick = () => {
                wordLimit = w;
                updateOptions();
                resetSession(true);
            };
            optionsBar.appendChild(b);
        });
    }
}

function renderSnippet() {
    codeDisplay.innerHTML = "";
    for (let i = 0; i < snippetText.length; i++) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = snippetText[i];
        
        if (i < idx) {
            if (inputText[i] === snippetText[i]) {
                span.classList.add("correct");
            } else {
                span.classList.add("incorrect");
            }
        } else if (i === idx) {
            span.classList.add("current");
        }
        
        codeDisplay.appendChild(span);
    }
}

function updateMetrics() {
    if (!startedAt) {
        wpmMetric.textContent = "0";
        accMetric.textContent = "100%";
        timeMetric.textContent = "0s";
        return;
    }
    
    const elapsed = (Date.now() - startedAt) / 1000;
    const minutes = elapsed / 60;
    
    let correct = 0;
    for (let i = 0; i < idx; i++) {
        if (inputText[i] === snippetText[i]) correct++;
    }
    
    const wpm = minutes > 0 ? Math.round((correct / 5) / minutes) : 0;
    const acc = idx > 0 ? Math.round((correct / idx) * 100) : 100;

    let tLabel;
    if (currentMode === "time") {
        const remaining = Math.max(0, timeLimit - Math.floor(elapsed));
        tLabel = `${remaining}s`;
    } else {
        tLabel = `${Math.floor(elapsed)}s`;
    }

    wpmMetric.textContent = String(wpm);
    accMetric.textContent = `${acc}%`;
    timeMetric.textContent = tLabel;
}

function isComplete() {
    if (!startedAt) return false;
    
    if (currentMode === "snippet") {
        return idx >= snippetText.length;
    } else if (currentMode === "time") {
        const elapsed = (Date.now() - startedAt) / 1000;
        return elapsed >= timeLimit;
    } else if (currentMode === "words") {
        const words = inputText.trim().split(/\s+/).filter(Boolean).length;
        return words >= wordLimit;
    }
    
    return false;
}

function showResults() {
    if (!startedAt) return;
    if (timerId) clearInterval(timerId);

    const elapsed = (Date.now() - startedAt) / 1000;
    const minutes = elapsed / 60;
    
    let correct = 0;
    for (let i = 0; i < idx; i++) {
        if (inputText[i] === snippetText[i]) correct++;
    }
    
    const wpm = minutes > 0 ? Math.round((correct / 5) / minutes) : 0;
    const acc = idx > 0 ? Math.round((correct / idx) * 100) : 100;

    finalWPM.textContent = String(wpm);
    finalAcc.textContent = `${acc}%`;
    finalTime.textContent = `${Math.floor(elapsed)}s`;

    resultsView.classList.add("active");
}

function resetSession(reload) {
    // Clear any existing timer to prevent memory leaks
    if (timerId) {
        clearInterval(timerId);
        timerId = null;
    }
    
    idx = 0;
    inputText = "";
    startedAt = null;
    
    try {
        if (reload) {
            snippetText = buildSnippet() || "";
            if (!snippetText) {
                console.error("Failed to load snippet");
                // Provide a fallback snippet if loading fails
                snippetText = "// Error loading snippet. Please try again.";
            }
        }
        setHeader();
        renderSnippet();
        updateMetrics();
        resultsView.classList.remove("active");
    } catch (error) {
        console.error("Error resetting session:", error);
        // Show error to user in a non-blocking way
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Error loading content. Please refresh the page.';
        document.body.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 3000);
    }
    renderSnippet();
    updateMetrics();
    resultsView.classList.remove("active");
}

function startTimerIfNeeded() {
    if (startedAt) return;
    startedAt = Date.now();
    timerId = setInterval(() => {
        updateMetrics();
        if (isComplete()) {
            showResults();
        }
    }, 100);
}

// Event Listeners
document.addEventListener("keydown", e => {
    if (resultsView.classList.contains("active")) return;
    if (themeDrawer.style.display === "flex") return;

    if (e.key === "Backspace") {
        e.preventDefault();
        if (idx > 0) {
            inputText = inputText.slice(0, -1);
            idx--;
            renderSnippet();
            updateMetrics();
        }
        return;
    }

    if (e.key.length === 1 || e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        startTimerIfNeeded();

        if (currentMode !== "time" && idx >= snippetText.length) return;

        if (e.key === "Enter") {
            let lineStart = inputText.lastIndexOf("\n");
            if (lineStart === -1) lineStart = 0;
            else lineStart += 1;
            
            const currentLine = inputText.slice(lineStart);
            let indent = "";
            const m = currentLine.match(/^[ \t]*/);
            if (m) indent = m[0];
            
            const trimmed = currentLine.trimEnd();
            if (trimmed.endsWith(":") || trimmed.endsWith("{")) {
                indent += "    ";
            }
            
            inputText += "\n" + indent;
            idx += 1 + indent.length;
        } else if (e.key === "Tab") {
            inputText += "    ";
            idx += 4;
        } else {
            inputText += e.key;
            idx++;
        }

        renderSnippet();
        updateMetrics();
        if (isComplete()) showResults();
    }
});

// Mode buttons
modeBtns.forEach(b => {
    b.addEventListener("click", () => {
        console.log(`Mode button clicked: ${b.dataset.mode}`);
        modeBtns.forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        currentMode = b.dataset.mode;
        updateOptions();
        resetSession(true);
    });
});

// Language buttons
langBtns.forEach(b => {
    b.addEventListener("click", () => {
        console.log(`Language button clicked: ${b.dataset.lang}`);
        langBtns.forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        currentLang = b.dataset.lang;
        resetSession(true);
    });
});

// Action buttons
restartBtn.addEventListener("click", () => {
    console.log("Restart clicked");
    resetSession(true);
});

nextBtn.addEventListener("click", () => {
    console.log("Next clicked");
    resetSession(true);
});

resultsNextBtn.addEventListener("click", () => {
    console.log("Results Next clicked");
    resetSession(true);
});

resultsRetryBtn.addEventListener("click", () => {
    console.log("Results Retry clicked");
    resetSession(false);
});

// Theme drawer
function openThemeDrawer() {
    console.log("Opening theme drawer");
    themeDrawer.style.display = "flex";
}

function closeThemeDrawer() {
    console.log("Closing theme drawer");
    themeDrawer.style.display = "none";
}

themeToggleBtn.addEventListener("click", () => {
    console.log("Theme toggle clicked");
    openThemeDrawer();
});

themeCloseBtn.addEventListener("click", () => {
    closeThemeDrawer();
});

themeDrawer.addEventListener("click", e => {
    if (e.target === themeDrawer) closeThemeDrawer();
});

function buildThemeGrid() {
    themeGrid.innerHTML = "";
    Object.entries(themes).forEach(([key, t]) => {
        const card = document.createElement("button");
        card.className = "theme-card";
        
        const name = document.createElement("div");
        name.className = "theme-card-name";
        name.textContent = t.name;
        
        const sw = document.createElement("div");
        sw.className = "theme-card-swatches";

        const s1 = document.createElement("div");
        s1.className = "theme-swatch";
        s1.style.background = t.bg;

        const s2 = document.createElement("div");
        s2.className = "theme-swatch";
        s2.style.background = t.surface;

        const s3 = document.createElement("div");
        s3.className = "theme-swatch";
        s3.style.background = t.accent;

        sw.appendChild(s1);
        sw.appendChild(s2);
        sw.appendChild(s3);
        card.appendChild(name);
        card.appendChild(sw);

        card.addEventListener("click", () => {
            console.log(`Theme selected: ${key}`);
            applyTheme(key);
            closeThemeDrawer();
        });

        themeGrid.appendChild(card);
    });
}

async function loadDb() {
    try {
        console.log("Loading snippets database...");
        const res = await fetch("./src/data/snippets.json");
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        db = await res.json();
        console.log("Database loaded successfully:", db);
        
        // Verify structure
        if (db && db.languages) {
            console.log("Available languages:", Object.keys(db.languages));
        }
    } catch (error) {
        console.error("Failed to load snippets database:", error);
        alert("Failed to load code snippets. Please check if snippets.json exists in src/data/");
    }
}

async function init() {
    console.log("Initializing Typr_...");
    applyTheme("default");
    buildThemeGrid();
    await loadDb();
    updateOptions();
    snippetText = buildSnippet();
    setHeader();
    renderSnippet();
    updateMetrics();
    console.log("Initialization complete");
}

init();