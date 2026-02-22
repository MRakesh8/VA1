/* ═══════════════════════════════════════════════════════════
   RS VOICE ASSISTANT — MAIN SCRIPT
   All logic lives here. To change settings, edit config.js.
   To add college data, edit college-data.js.
═══════════════════════════════════════════════════════════ */

/* ── EARLY GLOBALS — must come first so everything below can read them ── */
let isListening = false;
let isSpeaking = false;

/* ─────────────────────────────────────────────────────────
   PERMISSION INITIALIZATION — runs on page load
   ★ COMPLETE FIX: Permission dialog asks only ONCE
───────────────────────────────────────────────────────── */
let permissionInitialized = false;

function initMicrophonePermission() {
    if (permissionInitialized) return;
    permissionInitialized = true;

    // Check stored state first
    const storedState = getStoredPermissionState();
    
    // If already granted, silently cache the stream now
    if (storedState === 'granted') {
        console.log('[RS] Permission was previously granted, silently caching stream...');
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
            .then(stream => {
                permissionCachedStream = stream;
                permissionState = 'granted';
                console.log('[RS] ✅ Stream cached on page load - no more permission dialogs!');
            })
            .catch(err => {
                console.warn('[RS] Could not cache stream:', err.message);
                // If error, let it ask when user clicks mic
            });
        return;
    }

    // Check current browser permission state
    navigator.permissions.query({ name: 'microphone' })
        .then(result => {
            if (result.state === 'granted') {
                // Permission was granted, cache it
                setStoredPermissionState('granted');
                navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
                    .then(stream => {
                        permissionCachedStream = stream;
                        permissionState = 'granted';
                        console.log('[RS] ✅ Browser permission detected and cached');
                    })
                    .catch(err => console.warn('[RS] Stream cache error:', err.message));
            } else if (result.state === 'denied') {
                // Permission was denied
                setStoredPermissionState('denied');
                permissionState = 'denied';
                console.log('[RS] ⚠️ Microphone permission was denied');
            } else {
                // Permission state is "prompt" - will ask when user clicks mic
                console.log('[RS] Permission prompt: will ask when user clicks mic');
            }
            
            // Listen for future permission changes
            result.addEventListener('change', () => {
                console.log('[RS] Permission state changed to:', result.state);
                if (result.state === 'denied') {
                    setStoredPermissionState('denied');
                    permissionState = 'denied';
                } else if (result.state === 'granted') {
                    setStoredPermissionState('granted');
                    permissionState = 'granted';
                }
            });
        })
        .catch(() => {
            console.log('[RS] Browser does not support permissions API');
        });
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initMicrophonePermission();
        // Show helpful message on first load if permission not yet granted
        setTimeout(() => {
            const stored = getStoredPermissionState();
            if (stored === 'unknown' || stored === 'prompt') {
                showToast('🎙️', 'Click mic button to start • Permission will be asked ONCE only', 'info', 5000);
            } else if (stored === 'granted') {
                showToast('✅', 'Microphone ready! Click mic button to speak', 'ok', 3000);
            }
        }, 500);
    });
} else {
    initMicrophonePermission();
    setTimeout(() => {
        const stored = getStoredPermissionState();
        if (stored === 'unknown' || stored === 'prompt') {
            showToast('🎙️', 'Click mic button to start • Permission will be asked ONCE only', 'info', 5000);
        } else if (stored === 'granted') {
            showToast('✅', 'Microphone ready! Click mic button to speak', 'ok', 3000);
        }
    }, 500);
}

// Log startup info
console.log('%c🎤 RS Voice Assistant Started', 'color: #b44fff; font-size: 14px; font-weight: bold;');
console.log('%c📋 Permission Status: Loading...', 'color: #00d4ff; font-size: 12px;');
console.log('%c💡 Tip: Permission will only ask ONCE. Use "Allow while visiting the site"', 'color: #ffd700; font-size: 11px;');
function updateClock() {
    const now = new Date();
    const cd = document.getElementById('clockDisplay');
    if (cd) cd.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateEl = document.getElementById('clockDate');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}
updateClock();
setInterval(updateClock, 1000);

/* ─────────────────────────────────────────────────────────
   TOAST NOTIFICATIONS — show quick feedback banners
───────────────────────────────────────────────────────── */
function showToast(icon, message, type = 'info', duration = 2800) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(t);
    setTimeout(() => {
        t.classList.add('out');
        setTimeout(() => t.remove(), 350);
    }, duration);
}

/* ─────────────────────────────────────────────────────────
   COMMAND REACTION — mic button flash + particle burst
───────────────────────────────────────────────────────── */
function showCommandReaction() {
    // Visual reactions disabled for user comfort
}

/* ─────────────────────────────────────────────────────────
   TOP-BAR WAVEFORM CANVAS — live ambient animation
───────────────────────────────────────────────────────── */


/* ─────────────────────────────────────────────────────────
   SITE MAP — add more sites here
───────────────────────────────────────────────────────── */
const SITES = {
    youtube: 'https://www.youtube.com', google: 'https://www.google.com',
    instagram: 'https://www.instagram.com', facebook: 'https://www.facebook.com',
    twitter: 'https://www.twitter.com', x: 'https://www.x.com',
    whatsapp: 'https://web.whatsapp.com', telegram: 'https://web.telegram.org',
    gmail: 'https://mail.google.com', netflix: 'https://www.netflix.com',
    amazon: 'https://www.amazon.com', wikipedia: 'https://www.wikipedia.org',
    github: 'https://www.github.com', reddit: 'https://www.reddit.com',
    linkedin: 'https://www.linkedin.com', spotify: 'https://open.spotify.com',
    maps: 'https://maps.google.com', news: 'https://news.google.com',
    tiktok: 'https://www.tiktok.com', discord: 'https://discord.com',
    pinterest: 'https://www.pinterest.com', stackoverflow: 'https://stackoverflow.com',
    chatgpt: 'https://chat.openai.com', ai: 'https://aistudio.google.com/',
    zoom: 'https://zoom.us', meet: 'https://meet.google.com',
    drive: 'https://drive.google.com', docs: 'https://docs.google.com',
    sheets: 'https://sheets.google.com', bing: 'https://www.bing.com',
    outlook: 'https://outlook.live.com', flipkart: 'https://www.flipkart.com',
    prime: 'https://www.primevideo.com', myntra: 'https://www.myntra.com',
};

function tryOpenSite(name) {
    const n = name.trim().toLowerCase();
    let url = SITES[n] || '';
    if (!url) {
        for (const [k, u] of Object.entries(SITES)) {
            if (n.includes(k) || k.includes(n)) { url = u; break; }
        }
    }
    if (!url) url = 'https://www.google.com/search?q=' + encodeURIComponent(n) + '&btnI=I';
    window.open(url, '_blank');
    return url;
}

function quickOpen(site) {
    if (SITES[site]) {
        window.open(SITES[site], '_blank');
        addLog('open ' + site, '✅ Opened ' + site, 'ok');
    }
}

/* ─────────────────────────────────────────────────────────
   YOUTUBE — instant open (no embed delays)
───────────────────────────────────────────────────────── */
function playYouTube(query) {
    window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(query), '_blank');
}
function closeYTModal() {
    const modal = document.getElementById('ytModal');
    const iframe = document.getElementById('ytFrame');
    if (modal) modal.classList.remove('open');
    if (iframe) iframe.src = '';
}

/* ─────────────────────────────────────────────────────────
   VOICE PROFILES  (4 unique voice characters)
───────────────────────────────────────────────────────── */
const VOICE_PROFILES = [
    { name: 'ARIA', rate: 0.95, pitch: 1.30, preferFemale: true, preferName: ['zira', 'samantha', 'karen', 'moira', 'victoria', 'susan', 'aria'] },
    { name: 'ZEUS', rate: 0.80, pitch: 0.70, preferFemale: false, preferName: ['david', 'mark', 'daniel', 'alex', 'thomas', 'zeus', 'james'] },
    { name: 'NEO', rate: 1.40, pitch: 1.60, preferFemale: false, preferName: ['google', 'microsoft', 'zira', 'neural', 'neo', 'junior'] },
    { name: 'NOVA', rate: 1.15, pitch: 1.45, preferFemale: true, preferName: ['nova', 'hazel', 'tessa', 'fiona', 'allison', 'ava'] },
];
let selectedVoiceIdx = 0;
let voicesList = [];

function loadVoices() { voicesList = window.speechSynthesis.getVoices(); }
loadVoices();
window.speechSynthesis.onvoiceschanged = loadVoices;

function pickVoice(profile) {
    if (!voicesList.length) loadVoices();
    const en = voicesList.filter(v => v.lang.startsWith('en'));
    if (!en.length) return null;

    // ── Update: Prioritize Premium/Natural/Google voices for better quality
    const premiumMatch = en.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Premium')) && !v.name.includes('Legacy'));
    if (premiumMatch && Math.random() > 0.3) return premiumMatch;

    for (const kw of profile.preferName) {
        const match = en.find(v => v.name.toLowerCase().includes(kw));
        if (match) return match;
    }
    return en[0];
}

function selectVoice(idx) {
    selectedVoiceIdx = idx;
    for (let i = 0; i < 4; i++) {
        const c = document.getElementById('vc' + i);
        if (c) c.classList.toggle('active', i === idx);
    }
    const demos = [
        'Hello! I am Aria, your calm assistant.',
        'Hello. I am Zeus. Deep and powerful.',
        'Hey! Neo here. Super fast and sharp!',
        'Hi! Nova speaking. Bright and fun!',
    ];
    speak(demos[idx]);
}

/* ─────────────────────────────────────────────────────────
   isSpeaking FLAG — mic stays ON but ignores results
   while assistant is speaking. Prevents permission prompts.
───────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────
   SPEAK — text-to-speech with typewriter display

   3 Bug Fixes for "mic stops listening" after speech:
   ① Safety timeout  → forces isSpeaking=false even if
     Chrome's onend event never fires (known Chrome bug)
   ② Chrome keepalive → Chrome silently freezes synthesis
     after ~15 seconds. pause+resume every 10s prevents it.
───────────────────────────────────────────────────────── */
let speakSafetyTimer = null;
let synthKeepAlive = null;
let lastSpokenText = ""; // Memory for "repeat" command

function speak(text) {
    window.speechSynthesis.cancel();
    clearTimeout(speakSafetyTimer);
    clearInterval(synthKeepAlive);

    if (text && text.length > 10 && !text.includes('search that for you')) {
        lastSpokenText = text;
    }

    const profile = VOICE_PROFILES[selectedVoiceIdx];
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = settingsState.lang || CONFIG.DEFAULT_LANG;
    utter.rate = profile.rate * (settingsState.rateBoost || CONFIG.DEFAULT_RATE);
    utter.pitch = profile.pitch + (Math.random() * 0.1 - 0.05); // Gemini Style: Subtle variance for natural sound
    utter.volume = settingsState.volume !== undefined ? settingsState.volume : CONFIG.DEFAULT_VOLUME;
    const voice = pickVoice(profile);
    if (voice) utter.voice = voice;

    isSpeaking = true;

    // ── FIX: Safer Chrome keepalive — resume() ONLY (no pause) avoids freezes
    synthKeepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) { clearInterval(synthKeepAlive); return; }
        window.speechSynthesis.resume();
    }, 5000);

    // ── FIX: Tighter safety timeout — +800ms instead of +2000ms
    const wordsPerSec = (utter.rate || 1) * 2.8;
    const wordCount = text.split(/\s+/).length;
    const estimatedMs = Math.max(3000, (wordCount / wordsPerSec) * 1000 + 800);
    speakSafetyTimer = setTimeout(() => {
        if (isSpeaking) { console.warn('[RS] Safety timeout — unlocking mic'); onSpeakEnd(); }
    }, estimatedMs);

    // ── FIX: Show text INSTANTLY (no typewriter lag)
    const box = document.getElementById('aiSpeechBox');
    const textEl = document.getElementById('asbText');
    if (textEl) { textEl.textContent = text; }
    if (box) { box.classList.add('speaking'); }

    const badge = document.getElementById('speakingBadge');
    if (badge) badge.classList.add('show');

    // Update the rp-dot to active while speaking
    const rpDot = document.getElementById('rpDot');
    if (rpDot) rpDot.classList.add('active');

    function onSpeakEnd() {
        clearTimeout(speakSafetyTimer);
        clearInterval(synthKeepAlive);
        if (badge) badge.classList.remove('show');
        if (box) box.classList.remove('speaking');
        if (rpDot) rpDot.classList.remove('active');

        // ── Gemini Live Style: Auto-resume mic after speaking
        setTimeout(() => {
            isSpeaking = false;
            if (settingsState.autoListen && !isListening) {
                startMic();
            }
            const tTxt = document.getElementById('transcriptText');
            if (tTxt && isListening) tTxt.textContent = 'Listening… speak now';
        }, 300);
    }
    utter.onend = onSpeakEnd;
    utter.onerror = onSpeakEnd;
    window.speechSynthesis.speak(utter);
}

/* ─────────────────────────────────────────────────────────
   STOP SPEAKING — called by the UI stop button
───────────────────────────────────────────────────────── */
function stopSpeaking() {
    window.speechSynthesis.cancel();
    clearTimeout(speakSafetyTimer);
    clearInterval(synthKeepAlive);
    isSpeaking = false;

    // Close YouTube modal if open
    if (typeof closeYTModal === 'function') closeYTModal();

    // Hide speaking indicators
    const badge = document.getElementById('speakingBadge');
    if (badge) badge.classList.remove('show');
    const box = document.getElementById('aiSpeechBox');
    if (box) box.classList.remove('speaking');
    const tTxt = document.getElementById('transcriptText');
    if (tTxt && isListening) tTxt.textContent = 'Listening… speak now';

    addLog('⏹ Stop', '🔇 Speech stopped', 'ok');
}

/* ─────────────────────────────────────────────────────────
   Helper: from a matched section, pick the most relevant
   single line for the user's query and return it clean.
───────────────────────────────────────────────────────── */
function extractDirectAnswer(dataBlock, query) {
    const q = query.toLowerCase().replace(/\r/g, '');
    const lines = dataBlock.replace(/\r/g, '').split('\n')
        .map(l => l.trim()).filter(l => l.length > 3);

    const queryWords = q.split(/\s+/).filter(w => w.length > 2);
    let bestLine = '';
    let bestScore = 0;

    for (const line of lines) {
        const ll = line.toLowerCase();
        // Skip header/section title lines (all caps or numbered)
        if (/^[\d]+\./.test(line) && line.length < 40) continue;
        let score = 0;
        for (const w of queryWords) {
            if (ll.includes(w)) score += 2;
        }
        // Boost lines that look like key:value answers
        if (line.includes(':')) score += 1;
        if (/^(principal|chairman|address|phone|email|name)/i.test(line)) score += 2;
        if (score > bestScore) {
            bestScore = score;
            bestLine = line;
        }
    }

    if (bestLine) {
        return bestLine.replace(/^[•\-*#]+\s*/, '').trim();
    }
    // Fallback: return the first real content line
    const firstContent = lines.find(l => l.includes(':') || l.length > 20);
    return (firstContent || lines[0] || '').replace(/^[•\-*#]+\s*/, '').trim();
}

/* ═══════════════════════════════════════════════════════════
   SPEECH CORRECTION — fixes commonly misheard words.
   Speech recognition often mishears technical terms;
   this dictionary corrects them before processing.
   ──────────────────────────────────────────────────────────
   HOW TO ADD NEW CORRECTIONS:
   Add a new entry:   'misheard word': 'correct word',
   Use lowercase only. The fix runs automatically.
═══════════════════════════════════════════════════════════ */
const SPEECH_CORRECTIONS = {
    // Department names (commonly misheard)
    'csc': 'cse',
    'csg': 'cse',
    'c s e': 'cse',
    'c s c': 'cse',
    'c.s.e': 'cse',
    'c.s.c': 'cse',
    'cse dean': 'cse dean',
    'computer science and engineering': 'cse',
    'e c e': 'ece',
    'e.c.e': 'ece',
    'electronics and communication': 'ece',
    'triple e': 'eee',
    'e e e': 'eee',
    'e.e.e': 'eee',
    'electrical and electronics': 'eee',
    'a i and d s': 'ai & ds',
    'a i & d s': 'ai & ds',
    'ai and ds': 'ai & ds',
    'ai ds': 'ai & ds',
    'ai and data science': 'ai & ds',
    'mech': 'mechanical',
    'it department': 'information technology',

    // Titles (commonly misheard)
    'den of': 'dean of',
    'den name': 'dean name',
    'college den': 'college dean',
    'cse den': 'cse dean',
    'ece den': 'ece dean',
    'csc d ': 'cse dean ',
    'csc d name': 'cse dean name',
    'd n of': 'dean of',
    'h o d': 'hod',
    'head of department': 'hod',
    'head of the department': 'hod',
    'principle': 'principal',
    'principals': 'principal',

    // College name (commonly misheard)
    'ss ec': 'ssec',
    'ss easy': 'ssec',
    'ssac': 'ssec',
    's s e c': 'ssec',
    's.s.e.c': 'ssec',
    'sree sakti': 'sree sakthi',
    'sri sakthi': 'sree sakthi',
    'sri sakti': 'sree sakthi',
    'shree sakthi': 'sree sakthi',
    'srisakthi': 'sree sakthi',
    'free sakthi': 'sree sakthi',
    'three sakthi': 'sree sakthi',

    // Placement terms
    'plasman': 'placement',
    'plasmon': 'placement',
    'el p a': 'lpa',

    // Accreditation
    'knack': 'naac',
    'nerf': 'nirf',

    // Faculty names (commonly misheard)
    'silambu': 'silambarasan',
    'mani raj': 'maniraj',

    // Other terms
    'c o e': 'center of excellence',
    'see bcs': 'cbcs',
};

/**
 * Correct misheard speech before processing.
 * Replaces known wrong phrases/words with the correct ones.
 */
function correctSpeech(text) {
    let corrected = text.toLowerCase();

    // Sort keys by length (longest first) so multi-word replacements happen before single-word
    const sortedKeys = Object.keys(SPEECH_CORRECTIONS).sort((a, b) => b.length - a.length);

    for (const wrong of sortedKeys) {
        // Use word-boundary-aware replacement
        // Escape special regex chars in the key
        const escaped = wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
        corrected = corrected.replace(regex, SPEECH_CORRECTIONS[wrong]);
    }

    return corrected;
}


/* ─────────────────────────────────────────────────────────
   SMART AI — answers any question
   Uses college data automatically when relevant.
───────────────────────────────────────────────────────── */
function findLocalCollegeInfo(query) {
    const q = query.toLowerCase();

    if (typeof COLLEGE_DATA === 'undefined') return null;
    // Normalize Windows CRLF → LF so splitting works on all platforms
    const normalizedData = COLLEGE_DATA.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const sections = normalizedData.split(/\n{2,}/).filter(s => s.trim());

    // ── Strategy 2: Header keyword match (Local File) ──────────
    const headerMap = {
        // Leadership → Section 3
        'principal': ['college leadership', 'leadership'],
        'chairman': ['college leadership', 'leadership'],
        'correspondent': ['college leadership', 'leadership'],
        'secretary': ['college leadership', 'leadership', 'statutory'],
        'dharmalingam': ['college leadership', 'leadership'],
        'jayaprakash': ['college leadership', 'leadership'],
        'karthikeyan': ['college leadership', 'leadership'],
        'malarvizhi': ['college leadership', 'leadership'],
        'gokuldev': ['college leadership', 'leadership'],
        'maniraj': ['college leadership', 'leadership', 'statutory'],
        'leader': ['college leadership', 'leadership'],
        'management': ['college leadership', 'leadership'],

        // Dean → Section 3
        'dean': ['college leadership', 'leadership'],

        // HODs & Departments → Section 4
        'department': ['academic departments', 'departments'],
        'hod': ['academic departments', 'departments'],
        'head': ['academic departments', 'departments'],
        'cse': ['academic departments', 'departments', 'detailed faculty'],
        'ece': ['academic departments', 'departments', 'detailed faculty'],
        'eee': ['academic departments', 'departments'],
        'mechanical': ['academic departments', 'departments', 'detailed faculty'],
        'civil': ['academic departments', 'departments', 'detailed faculty'],
        'ai & ds': ['academic departments', 'departments'],
        'data science': ['academic departments', 'departments'],
        'information technology': ['courses offered', 'seat intake'],

        // Faculty → Section 5
        'faculty': ['detailed faculty', 'academic departments'],
        'staff': ['detailed faculty', 'academic departments'],
        'professor': ['detailed faculty', 'academic departments'],
        'teacher': ['detailed faculty', 'academic departments'],

        // Courses → Section 6
        'course': ['courses offered', 'seat intake'],
        'b.e': ['courses offered', 'seat intake'],
        'b.tech': ['courses offered', 'seat intake'],
        'm.e': ['courses offered', 'seat intake'],
        'undergraduate': ['courses offered', 'seat intake'],
        'postgraduate': ['courses offered', 'seat intake'],
        'polytechnic': ['courses offered', 'seat intake'],
        'diploma': ['courses offered', 'seat intake'],
        'cyber security': ['courses offered', 'seat intake'],
        'vlsi': ['courses offered', 'seat intake'],
        'seats': ['courses offered', 'seat intake'],
        'intake': ['courses offered', 'seat intake'],

        // Regulation → Section 7
        'regulation': ['regulation 2024', 'autonomous'],
        'cbcs': ['regulation 2024', 'autonomous'],
        'credit system': ['regulation 2024', 'autonomous'],
        'swayam': ['regulation 2024', 'autonomous'],
        'nptel': ['regulation 2024', 'autonomous'],

        // Placement → Section 8
        'placement': ['placement', 'training', 'career development'],
        'package': ['placement', 'training'],
        'salary': ['placement', 'training'],
        'lpa': ['placement', 'training'],
        'recruiter': ['placement', 'training'],
        'recruiters': ['placement', 'training'],
        'highest package': ['placement', 'training'],
        'career development': ['placement', 'training'],
        'training': ['placement', 'training'],

        // Research → Section 9
        'research': ['research', 'innovation', 'center of excellence'],
        'innovation': ['research', 'innovation'],
        'center of excellence': ['research', 'innovation'],
        'iit bombay': ['research', 'innovation'],
        'oracle': ['research', 'innovation'],
        'patent': ['research', 'innovation'],

        // Facilities → Section 10
        'facility': ['campus facilities', 'facilities'],
        'hostel': ['campus facilities', 'facilities'],
        'library': ['campus facilities', 'facilities'],
        'lab': ['campus facilities', 'facilities'],
        'transport': ['campus facilities', 'facilities'],
        'bus': ['campus facilities', 'facilities'],
        'canteen': ['campus facilities', 'food court'],
        'food court': ['campus facilities', 'facilities'],
        'gym': ['campus facilities', 'facilities'],
        'fitness': ['campus facilities', 'facilities'],
        'smart classroom': ['campus facilities', 'facilities'],
        'auditorium': ['campus facilities', 'facilities'],
        'campus': ['campus facilities', 'facilities'],
        'medical centre': ['campus facilities', 'facilities'],
        'wifi': ['campus facilities', 'facilities'],
        'infrastructure': ['campus facilities', 'facilities'],
        'internship': ['campus facilities', 'regulation 2024'],

        // Contact → Section 11
        'contact': ['contact information', 'contact'],
        'address': ['contact information', 'contact'],
        'phone': ['contact information', 'contact'],
        'email': ['contact information', 'contact'],
        'location': ['contact information', 'contact'],
        'coimbatore': ['contact information', 'contact'],
        'karamadai': ['contact information', 'contact'],

        // Admission → Section 12
        'admission': ['admission process', 'important dates'],
        'tnea': ['admission process', 'important dates'],
        'counselling': ['admission process', 'important dates'],
        'important dates': ['admission process', 'important dates'],
        'registration': ['admission process', 'important dates'],

        // Accreditation
        'accredit': ['institutional status', 'college name'],
        'naac': ['institutional status', 'college name'],
        'nba': ['institutional status', 'college name'],
        'nirf': ['institutional status', 'college name'],
        'autonomous': ['institutional status', 'regulation 2024'],
        'ranking': ['institutional status', 'college name'],

        // General
        'about': ['college name', 'vision'],
        'ssec': ['college name', 'college leadership'],
        'college': ['college name', 'college leadership'],
        'sakthi': ['college name', 'college leadership'],
        'sree sakthi': ['college name', 'college leadership'],
        'name': ['college name', 'college leadership'],
        'vision': ['vision', 'mission'],
        'mission': ['vision', 'mission'],
        'fee': ['courses offered', 'admission process'],

        // Group of companies
        'group of companies': ['group of companies', 'college name'],
        'foundry': ['group of companies', 'college name'],
        'belloi': ['group of companies', 'college name'],

        // Statutory roles
        'controller': ['statutory', 'college leadership'],
        'iqac': ['statutory', 'college leadership'],
        'administrative': ['statutory', 'college leadership'],

        // Developer
        'developer': ['developer info', 'developed'],
        'rakesh': ['developer info', 'developed'],
        'who made': ['developer info', 'developed'],
        'who built': ['developer info', 'developed'],
    };

    for (const [keyword, headers] of Object.entries(headerMap)) {
        if (q.includes(keyword)) {
            // For very generic keywords like "name", only use if there's a college keyword too
            if (['name', 'about', 'fee'].includes(keyword)) {
                const hasCollegeContext = (typeof COLLEGE_KEYWORDS !== 'undefined') &&
                    COLLEGE_KEYWORDS.some(kw => q.includes(kw));
                if (!hasCollegeContext) continue; // Skip this match if not clearly about college
            }

            for (const hdr of headers) {
                for (const sec of sections) {
                    const firstLine = sec.trim().split('\n')[0].replace(/\r/g, '').toLowerCase();
                    if (firstLine.includes(hdr)) {
                        return sec.replace(/\r/g, '').replace(/[#*_]/g, '').replace(/^-\s*/gm, '').trim();
                    }
                }
            }
        }
    }

    // ── Strategy 3: Weighted keyword scoring (Local File) ─────
    const queryWords = q.split(/\s+/).filter(w => w.length > 1);
    let bestMatch = '';
    let bestScoreLocal = 0;

    for (const sec of sections) {
        const secLower = sec.replace(/\r/g, '').toLowerCase();
        const firstLine = secLower.split('\n')[0];
        let score = 0;
        for (const word of queryWords) {
            if (secLower.includes(word)) {
                score += firstLine.includes(word) ? 3 : 1;
            }
        }
        if (score > bestScoreLocal) {
            bestScoreLocal = score;
            bestMatch = sec;
        }
    }

    if (bestScoreLocal > 0 && bestMatch) {
        return bestMatch.replace(/\r/g, '').replace(/[#*_]/g, '').replace(/^-\s*/gm, '').trim();
    }

    // ── Strategy 4: Fallback (ABOUT) ──────────────────────────
    for (const sec of sections) {
        const fl = sec.trim().split('\n')[0].replace(/\r/g, '').toLowerCase();
        if (fl.includes('about') || fl.includes('college name') || fl.includes('sree sakthi')) {
            return sec.replace(/\r/g, '').replace(/[#*_]/g, '').replace(/^-\s*/gm, '').trim();
        }
    }

    return null;
}



/* ─────────────────────────────────────────────────────────
   Helper: is the API key actually valid (not a placeholder)?
───────────────────────────────────────────────────────── */
function isValidApiKey(key) {
    if (!key) return false;
    // Strip brackets if user wrapped key in [...]
    const k = (key.startsWith('[') && key.endsWith(']')) ? key.slice(1, -1) : key;
    if (k.length < 20) return false;                          // too short
    if (k.includes('YOUR_') || k.includes('REPLACE')) return false;
    if (k.includes('ENCRYPTION') || k.includes('PLACEHOLDER')) return false;
    return true;
}

// Sanitize key: remove accidental brackets
function cleanApiKey(key) {
    if (!key) return '';
    return (key.startsWith('[') && key.endsWith(']')) ? key.slice(1, -1) : key;
}

/* ─────────────────────────────────────────────────────────
   WIKIPEDIA FALLBACK — free, no API key needed
   Fetches a short summary from Wikipedia and speaks it.
───────────────────────────────────────────────────────── */
async function wikiSearch(query) {
    try {
        const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        let res = await fetch(searchUrl);

        // If direct title didn't work, try search API
        if (!res.ok) {
            const srchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
            const srch = await fetch(srchUrl).then(r => r.json());
            const title = srch?.query?.search?.[0]?.title;
            if (!title) return null;
            res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
        }

        if (!res.ok) return null;
        const data = await res.json();
        if (data.extract && data.extract.length > 20) {
            // Shorten to 2 sentences for a direct answer
            const sentences = data.extract.split('. ');
            return sentences.slice(0, 2).join('. ') + '.';
        }
        return null;
    } catch (_) { return null; }
}
/* ─────────────────────────────────────────────────────────
   SMART AI — answers any question ON THE PAGE (no redirects)
   
   Routing logic:
   ① College question + API key → find data, send to AI for direct answer
   ② College question, no key → extract direct line from local data
   ③ General question + API key → ask Gemini directly
   ④ General question, no key → Wikipedia (short)
───────────────────────────────────────────────────────── */

/* ═════════════════════════════════════════════════════════════
   SMART COLLEGE Q&A ENGINE
   ─────────────────────────────────────────────────────────────
   • Each topic has multiple question PATTERNS (regex)
   • Each topic has multiple RESPONSE TEMPLATES (picked randomly)
   • Templates use {placeholders} filled from COLLEGE_DATA
   • Supports English + Tamil question patterns
   ═════════════════════════════════════════════════════════════ */

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const COLLEGE_QA_TOPICS = [
    // ─── PRINCIPAL ─────────────────────────────────────────
    {
        patterns: [
            /who\s*(?:is|are)\s*(?:the\s*)?principal/i,
            /principal\s*(?:of|at|in)?\s*(?:ssec|sree\s*sakthi|college)?/i,
            /(?:tell|say|give)\s*(?:me)?\s*(?:about)?\s*(?:the)?\s*principal/i,
            /முதல்வர்\s*யார்/i,
            /principal\s*(?:name|sir|madam)/i,
        ],
        responses: [
            "Certainly! The Principal of Sree Sakthi Engineering College is Dr. G. Jayaprakash, who leads our academic mission.",
            "I can help with that. Dr. G. Jayaprakash is currently serving as the Principal of SSEC.",
            "That would be Dr. G. Jayaprakash. He is the Principal of SSEC and is dedicated to institution-wide excellence.",
            "The leadership at SSEC is headed by Principal Dr. G. Jayaprakash.",
        ],
    },
    // ─── CHAIRMAN ──────────────────────────────────────────
    {
        patterns: [
            /who\s*(?:is|are)\s*(?:the\s*)?chairman/i,
            /chairman\s*(?:of|at)?\s*(?:ssec|sree\s*sakthi|college)?/i,
            /(?:tell|say)\s*(?:me)?\s*(?:about)?\s*(?:the)?\s*chairman/i,
            /தலைவர்\s*யார்/i,
        ],
        responses: [
            "The Chairman of SSEC is Shri. N. Dharmalingam.",
            "Shri. N. Dharmalingam is the Chairman of Sree Sakthi Engineering College.",
            "SSEC is led by its Chairman, Shri. N. Dharmalingam.",
            "The college chairman is Shri. N. Dharmalingam.",
        ],
    },
    // ─── CORRESPONDENT ─────────────────────────────────────
    {
        patterns: [
            /who\s*(?:is|are)\s*(?:the\s*)?correspondent/i,
            /correspondent\s*(?:of|at)?\s*(?:ssec|sree\s*sakthi|college)?/i,
        ],
        responses: [
            "The Correspondent of SSEC is Dr. S. Karthikeyan.",
            "Dr. S. Karthikeyan serves as the Correspondent at Sree Sakthi Engineering College.",
            "SSEC's Correspondent is Dr. S. Karthikeyan.",
        ],
    },
    // ─── DEAN (ACADEMIC) ───────────────────────────────────
    {
        patterns: [
            /who\s*(?:is|are)\s*(?:the\s*)?(?:academic\s*)?dean(?!\s*(?:of|cse|computer))/i,
            /dean\s*(?:of|at)?\s*(?:academics?|ssec|college)/i,
        ],
        responses: [
            "The Dean of Academics at SSEC is Prof. P. Malarvizhi.",
            "Prof. P. Malarvizhi holds the position of Dean of Academics.",
            "SSEC's Academic Dean is Prof. P. Malarvizhi.",
        ],
    },
    // ─── DEAN CSE ──────────────────────────────────────────
    {
        patterns: [
            /dean\s*(?:of)?\s*(?:cse|computer\s*science)/i,
            /cse\s*dean/i,
        ],
        responses: [
            "The Dean of CSE at SSEC is Dr. S. Gokuldev.",
            "Dr. S. Gokuldev is the Dean of the CSE department.",
            "SSEC's CSE Dean is Dr. S. Gokuldev.",
        ],
    },
    // ─── HOD CSE ───────────────────────────────────────────
    {
        patterns: [
            /hod\s*(?:of)?\s*(?:cse|computer\s*science)/i,
            /(?:cse|computer\s*science)\s*hod/i,
            /head\s*of\s*(?:the\s*)?(?:cse|computer\s*science)\s*department/i,
        ],
        responses: [
            "The HOD of CSE is Dr. S. Saravanan, who focuses on AI, Data Analytics, and Cloud Computing.",
            "Dr. S. Saravanan is the Head of the Computer Science department at SSEC.",
            "SSEC's CSE department is headed by Dr. S. Saravanan, a Professor specializing in AI and Cloud Computing.",
        ],
    },
    // ─── HOD ECE ───────────────────────────────────────────
    {
        patterns: [
            /hod\s*(?:of)?\s*(?:ece|electronics)/i,
            /(?:ece|electronics)\s*hod/i,
            /head\s*of\s*(?:the\s*)?(?:ece|electronics)\s*department/i,
        ],
        responses: [
            "The HOD of ECE is Dr. M. Karthikeyan, specializing in VLSI, Embedded Systems, and IoT.",
            "Dr. M. Karthikeyan heads the Electronics and Communication Engineering department.",
            "SSEC's ECE department is led by Dr. M. Karthikeyan.",
        ],
    },
    // ─── HOD EEE ───────────────────────────────────────────
    {
        patterns: [
            /hod\s*(?:of)?\s*(?:eee|electrical)/i,
            /(?:eee|electrical)\s*hod/i,
            /head\s*of\s*(?:the\s*)?(?:eee|electrical)\s*department/i,
        ],
        responses: [
            "The HOD of EEE is Dr. E. Nandhakumar, who focuses on Smart Grids, Power Systems, and Electric Vehicles.",
            "Dr. E. Nandhakumar is the Head of the Electrical and Electronics Engineering department.",
            "SSEC's EEE department is headed by Dr. E. Nandhakumar.",
        ],
    },
    // ─── HOD MECH ──────────────────────────────────────────
    {
        patterns: [
            /hod\s*(?:of)?\s*(?:mech|mechanical)/i,
            /(?:mech|mechanical)\s*hod/i,
            /head\s*of\s*(?:the\s*)?mechanical\s*department/i,
        ],
        responses: [
            "The HOD of Mechanical Engineering is Dr. M. Vijayakumar, specializing in Manufacturing, Robotics, and Thermal Engineering.",
            "Dr. M. Vijayakumar heads the Mechanical Engineering department at SSEC.",
            "SSEC's Mechanical department is led by Dr. M. Vijayakumar.",
        ],
    },
    // ─── HOD CIVIL ─────────────────────────────────────────
    {
        patterns: [
            /hod\s*(?:of)?\s*civil/i,
            /civil\s*hod/i,
            /head\s*of\s*(?:the\s*)?civil\s*department/i,
        ],
        responses: [
            "The HOD of Civil Engineering is Dr. S. Vijayashanthy, focusing on Structural Engineering, GIS and Remote Sensing.",
            "Dr. S. Vijayashanthy heads the Civil Engineering department at SSEC.",
            "SSEC's Civil department is led by Dr. S. Vijayashanthy.",
        ],
    },
    // ─── HOD AI & DS ───────────────────────────────────────
    {
        patterns: [
            /hod\s*(?:of)?\s*(?:ai|artificial\s*intelligence|data\s*science|ai\s*.?\s*ds)/i,
            /(?:ai|data\s*science|ai\s*.?\s*ds)\s*hod/i,
            /head\s*of\s*(?:the\s*)?(?:ai|data\s*science)\s*department/i,
        ],
        responses: [
            "The HOD of AI and Data Science is Mr. G. Silambarasan, focusing on Machine Learning, Big Data, and Data Science.",
            "Mr. G. Silambarasan heads the AI and Data Science department at SSEC.",
            "SSEC's AI & DS department is led by Mr. G. Silambarasan.",
        ],
    },
    // ─── HOD S&H ───────────────────────────────────────────
    {
        patterns: [
            /hod\s*(?:of)?\s*(?:science|humanities|s\s*.?\s*h)/i,
            /(?:science|humanities)\s*hod/i,
        ],
        responses: [
            "The HOD of Science and Humanities is Dr. S. R. Gibin.",
            "Dr. S. R. Gibin heads the Science and Humanities department at SSEC.",
        ],
    },
    // ─── GENERIC HOD (no specific dept) ────────────────────
    {
        patterns: [
            /who\s*(?:is|are)\s*(?:the\s*)?hod/i,
            /(?:list|tell|name)\s*(?:me)?\s*(?:the|all)?\s*hods?/i,
        ],
        responses: [
            "SSEC has dedicated HODs for each department: Dr. S. Saravanan for CSE, Dr. M. Karthikeyan for ECE, Dr. E. Nandhakumar for EEE, Dr. M. Vijayakumar for Mechanical, Dr. S. Vijayashanthy for Civil, Mr. G. Silambarasan for AI & DS, and Dr. S. R. Gibin for Science & Humanities. Which department would you like to know more about?",
            "Each department at SSEC is led by an experienced HOD. Could you specify which department you're asking about? We have CSE, ECE, EEE, Mechanical, Civil, AI & DS, and Science & Humanities.",
        ],
    },
    // ─── DEPARTMENTS ───────────────────────────────────────
    {
        patterns: [
            /\bdepartments?\b/i,                                          // ANY mention of "department" or "departments"
            /(?:what|which|how\s*many)\s*departments?/i,
            /(?:list|tell|name)\s*(?:me)?\s*(?:the|all)?\s*departments?/i,
            /departments?\s*(?:in|at|of)\s*(?:ssec|college|sree\s*sakthi)/i,
            /(?:college|ssec)\s*departments?/i,
            /(?:about|details?\s*(?:of|about)?)\s*departments?/i,
            /(?:branches|streams)\s*(?:available|offered|in)/i,
            /(?:branches|streams|departments?)\s*(?:details?|info|list)?/i,
            /துறைகள்/i,
        ],
        responses: [
            "SSEC has 7 departments: Computer Science, Electronics & Communication, Electrical & Electronics, Mechanical, Civil, AI & Data Science, and Science & Humanities.",
            "There are 7 academic departments at SSEC — CSE, ECE, EEE, Mechanical, Civil, AI & DS, and Science & Humanities.",
            "Sree Sakthi Engineering College offers programs across 7 departments including CSE, ECE, EEE, Mech, Civil, AI & Data Science, and Science & Humanities.",
            "SSEC has the following departments: CSE, ECE, EEE, Mechanical Engineering, Civil Engineering, AI and Data Science, and Science and Humanities. Would you like to know about a specific department?",
        ],
    },
    // ─── COURSES OFFERED ───────────────────────────────────
    {
        patterns: [
            /(?:what|which)\s*(?:courses?|programs?)\s*(?:are)?\s*(?:offered|available)/i,
            /courses?\s*(?:in|at|of)\s*(?:ssec|college|sree\s*sakthi)/i,
            /(?:list|tell|name)\s*(?:me)?\s*(?:the|all)?\s*courses?/i,
            /(?:b\.?e|b\.?tech|m\.?e)\s*(?:courses?|programs?)/i,
            /(?:undergraduate|postgraduate|ug|pg)\s*courses?/i,
            /என்ன\s*(?:படிப்புகள்|courses)/i,
        ],
        responses: [
            "SSEC offers 8 undergraduate programs: B.E. CSE with 120 seats, B.E. ECE with 120 seats, B.Tech AI & DS with 120 seats, B.E. CSE Cyber Security with 90 seats, B.Tech IT with 90 seats, B.E. Mechanical with 60 seats, B.E. EEE with 60 seats, and B.E. Civil with 30 seats. For postgraduate, there's M.E. CSE and M.E. VLSI Design.",
            "SSEC has a wide range of programs! At the undergraduate level, you can choose from CSE, ECE, AI & DS, Cyber Security, IT, Mechanical, EEE, and Civil Engineering. They also offer M.E. programs in CSE and VLSI Design.",
            "There are 8 B.E. and B.Tech programs at SSEC with a total intake of around 690 seats. Additionally, there are 2 M.E. programs and Polytechnic diploma courses.",
        ],
    },
    // ─── SEATS / INTAKE ────────────────────────────────────
    {
        patterns: [
            /(?:how\s*many|total)\s*seats?/i,
            /seat\s*intake/i,
            /(?:seats?|intake)\s*(?:for|in|of)\s*(?:cse|ece|eee|mech|civil|ai|it|cyber)/i,
            /எத்தனை\s*(?:இடங்கள்|seats)/i,
        ],
        responses: [
            "CSE has 120 seats, ECE has 120 seats, AI & DS has 120 seats, Cyber Security has 90 seats, IT has 90 seats, Mechanical has 60 seats, EEE has 60 seats, and Civil has 30 seats.",
            "The total seat intake at SSEC is around 690 across all undergraduate programs. CSE, ECE, and AI & DS have the highest at 120 seats each.",
            "Here's the breakdown: CSE 120, ECE 120, AI & DS 120, Cyber Security 90, IT 90, Mech 60, EEE 60, Civil 30. That's about 690 seats total!",
        ],
    },
    // ─── PLACEMENT ─────────────────────────────────────────
    {
        patterns: [
            /placement/i,
            /(?:highest|average|median)\s*(?:package|salary)/i,
            /(?:package|salary|lpa)\s*(?:at|in|of)?\s*(?:ssec|college)?/i,
            /(?:companies?|recruiters?)\s*(?:that|which|who)?\s*(?:visit|come|recruit|hire)/i,
            /(?:job|placements?|career)\s*(?:record|rate|percentage|details?)/i,
            /(?:who|which)\s*(?:companies?|firms?)\s*(?:recruit|hire|come)/i,
            /சம்பளம்|வேலை\s*வாய்ப்பு/i,
        ],
        responses: [
            "SSEC has an impressive placement record of nearly 98 to 100 percent for eligible students. The highest package is 14 Lakhs per annum, with an average of around 5 LPA. Top recruiters include Cognizant, Wipro, TCS, TATA, Deloitte, Zoho, Virtusa, Amazon, Hyperverge, and Quinbay.",
            "Placements at SSEC are excellent! The highest package reached 14 LPA, and the average is about 5 LPA. Major companies like Cognizant, TCS, Wipro, Zoho, Amazon, and Deloitte regularly recruit from the campus.",
            "SSEC consistently achieves near 100 percent placement for eligible students. The median salary ranges from 3.3 to 5.7 LPA depending on the department, with the best at 14 LPA. Students also get systematic training through the Career Development Centre.",
            "The placement record at SSEC is outstanding! With companies like Zoho, Amazon, Cognizant, and Deloitte visiting campus, the highest package stands at 14 LPA. Training starts from second year with aptitude, soft skills, and Industry 5.0 readiness programs.",
        ],
    },
    // ─── FACILITIES & CAMPUS ───────────────────────────────
    {
        patterns: [
            /(?:what|which|tell)\s*(?:are|me)?\s*(?:the)?\s*(?:facilities|amenities|infrastructure)/i,
            /campus\s*(?:facilities|size|details|features)/i,
            /(?:does|is\s*there)\s*(?:a|any)?\s*(?:gym|library|lab|canteen|food\s*court|atm|wifi|auditorium|bus|transport)/i,
            /வசதிகள்/i,
        ],
        responses: [
            "SSEC has a 14-acre WiFi-enabled campus with smart classrooms, a central library, high-speed computing labs, a 750-plus capacity auditorium, a gym, multi-cuisine food court, ATM, college bus transport, and a medical centre on campus.",
            "The campus offers excellent facilities including smart classrooms, Center of Excellence labs, a high-tech auditorium, gym, food court, library, ATM, and 24/7 medical support with an on-campus medical centre.",
            "SSEC's 14-acre campus is fully WiFi-enabled! You'll find smart classrooms, advanced labs, a library, auditorium, food court, gym, ATM, and even a medical centre right on campus. Bus transport is also available.",
        ],
    },
    // ─── HOSTEL ────────────────────────────────────────────
    {
        patterns: [
            /hostel/i,
            /(?:boys?|girls?|men|women)\s*hostel/i,
            /(?:is\s*there|do\s*you\s*have)\s*(?:a)?\s*hostel/i,
            /(?:stay|accommodation|residential|living)\s*(?:facility|option)/i,
            /விடுதி/i,
        ],
        responses: [
            "Yes, SSEC has separate Boys and Girls hostels with 24/7 medical support and residential facilities.",
            "SSEC provides comfortable hostel accommodation for both boys and girls, with round-the-clock medical support and an ambulance on standby.",
            "Hostel facilities are available at SSEC! There are separate hostels for boys and girls with 24/7 medical care.",
        ],
    },
    // ─── LOCATION / ADDRESS ────────────────────────────────
    {
        patterns: [
            /(?:where\s*is|location|address)\s*(?:of|at)?\s*(?:ssec|sree\s*sakthi|college)?/i,
            /(?:college|ssec)\s*(?:location|address)/i,
            /(?:how\s*to\s*reach|directions?\s*to)\s*(?:ssec|sree\s*sakthi|college)/i,
            /எங்கே\s*(?:இருக்கு|உள்ளது)/i,
            /முகவரி/i,
        ],
        responses: [
            "SSEC is located at 892, Bettathapuram, Karamadai, Ooty Main Road, Coimbatore 641104, Tamil Nadu.",
            "You can find Sree Sakthi Engineering College at Bettathapuram, Karamadai, on the Ooty Main Road in Coimbatore, pin code 641104.",
            "The college is situated on the Ooty Main Road at Karamadai, Coimbatore. The full address is 892, Bettathapuram, Karamadai, Coimbatore 641104.",
        ],
    },
    // ─── CONTACT ───────────────────────────────────────────
    {
        patterns: [
            /(?:contact|phone|call|email|reach)\s*(?:number|details?|info|the\s*college)?/i,
            /(?:college|ssec)\s*(?:phone|email|contact)/i,
            /(?:how\s*(?:can|do|to)\s*(?:I|we)?\s*contact)/i,
            /தொலைபேசி\s*எண்/i,
        ],
        responses: [
            "You can contact SSEC at +91 92445 04444 or +91 92445 02222. Email: principal@sreesakthi.edu.in. Website: sreesakthi.edu.in.",
            "SSEC's contact numbers are 92445 04444 and 92445 02222. You can also email at principal@sreesakthi.edu.in.",
            "Reach out to SSEC by calling +91 92445 04444 or email principal@sreesakthi.edu.in. Visit sreesakthi.edu.in for more information.",
        ],
    },
    // ─── ADMISSION ─────────────────────────────────────────
    {
        patterns: [
            /admission/i,
            /how\s*(?:to|can\s*I?)\s*(?:join|apply|get\s*in|enrol|register)/i,
            /(?:admission|application)\s*(?:process|procedure|steps?)/i,
            /tnea|counselling/i,
            /(?:when|what)\s*(?:is|are)?\s*(?:the)?\s*(?:admission|registration|counselling)\s*(?:dates?|deadline|last\s*date)/i,
            /சேர்க்கை/i,
        ],
        responses: [
            "Admission to SSEC is primarily through TNEA counselling. The process is: Step 1 — Register online, Step 2 — Upload 10th and 12th marksheets, Step 3 — Attend TNEA counselling. For 2026, TNEA registration is expected from May 7 to June 6.",
            "To join SSEC, apply through the TNEA process. Register online, upload your documents, and attend counselling. The 2026 counselling is scheduled for July 14 to August 19.",
            "Getting into SSEC is straightforward! Register through the TNEA portal, submit your marksheets, and attend counselling. The 2026 rank list is expected on June 27.",
        ],
    },
    // ─── VISION / MISSION ──────────────────────────────────
    {
        patterns: [
            /(?:what\s*is|tell\s*me)\s*(?:the)?\s*(?:vision|mission)/i,
            /(?:college|ssec)\s*(?:vision|mission)/i,
            /(?:vision|mission)\s*(?:of|at)?\s*(?:ssec|college|sree\s*sakthi)/i,
        ],
        responses: [
            "SSEC's Vision is to emerge as a center of excellence in engineering education and research, empowering students to solve global challenges with sustainability and social responsibility.",
            "The Mission of SSEC is to nurture leaders through learner-centric teaching, industrial collaboration, and a dynamic research ecosystem.",
            "SSEC envisions being a center of excellence in engineering. Their mission focuses on nurturing leaders through innovative teaching and strong industry collaboration.",
        ],
    },
    // ─── ACCREDITATION / NAAC / NBA ────────────────────────
    {
        patterns: [
            /(?:naac|nba|accredit|nirf|ranking|grade)/i,
            /(?:what|which)\s*(?:is|are)\s*(?:the)?\s*(?:accredit|grade|rank|rating)/i,
            /(?:college|ssec)\s*(?:accredit|grade|rank)/i,
            /is\s*(?:ssec|the\s*college)\s*(?:accredited|autonomous|ranked)/i,
        ],
        responses: [
            "SSEC holds NAAC B++ Grade accreditation and NBA accreditation for CSE, EEE, ECE, and Mechanical departments. It became an Autonomous Institution in 2024 and participates in NIRF annually.",
            "The college is NAAC B++ graded and NBA accredited in multiple departments. SSEC achieved autonomous status in 2024, giving it more academic freedom.",
            "SSEC is well-accredited! It has NAAC B++ grade, NBA accreditation for 4 departments, AICTE approval, and Anna University affiliation. It's been autonomous since 2024.",
        ],
    },
    // ─── RESEARCH / INNOVATION ─────────────────────────────
    {
        patterns: [
            /research|innovation|center\s*of\s*excellence/i,
            /(?:iit\s*bombay|oracle\s*academy|c-?dac|innomatics)/i,
            /(?:patents?|publications?|visionary\s*day)/i,
        ],
        responses: [
            "SSEC has strong research collaborations including IIT Bombay for remote labs, Oracle Academy for database training, C-DAC PACE for advanced computing, and Innomatics Research Labs. They also hold an annual Visionary Day where students launch their products.",
            "Research and innovation thrive at SSEC! They collaborate with IIT Bombay, Oracle Academy, and C-DAC. The college has a Research Advisory Board overseeing faculty publications and student patents.",
            "SSEC promotes innovation through partnerships with IIT Bombay, Oracle, and C-DAC. The annual Visionary Day is a unique event where students showcase and launch their own products.",
        ],
    },
    // ─── AUTONOMOUS / REGULATION 2024 ──────────────────────
    {
        patterns: [
            /autonomous|regulation\s*2024/i,
            /(?:cbcs|credit\s*system|elective|swayam|nptel)/i,
        ],
        responses: [
            "SSEC became autonomous in 2024 and follows Regulation 2024 with a Choice Based Credit System. Students can earn up to 6 credits through SWAYAM and NPTEL, and 80 hours of personality development is mandatory.",
            "Under Regulation 2024, SSEC offers a flexible CBCS system. Students can choose electives across departments and earn online credits through SWAYAM and NPTEL platforms.",
            "As an autonomous institution since 2024, SSEC has its own regulation with CBCS, online credit transfers via NPTEL, and mandatory personality development through NSS, NCC, or YRC.",
        ],
    },
    // ─── ABOUT / GENERAL COLLEGE INFO ──────────────────────
    {
        patterns: [
            /(?:tell\s*(?:me)?|what)\s*(?:about|is)\s*(?:ssec|sree\s*sakthi|the\s*college)/i,
            /(?:about|describe)\s*(?:the)?\s*college/i,
            /(?:ssec|sree\s*sakthi)\s*(?:college)?$/i,
            /explain\s*(?:about)?\s*(?:ssec|sree\s*sakthi)/i,
            /கல்லுரி\s*(?:பற்றி|என்ன)/i,
        ],
        responses: [
            "Sree Sakthi Engineering College, known as SSEC, is an autonomous institution located on a 14-acre campus in Karamadai, Coimbatore. It's affiliated to Anna University, approved by AICTE, and has NAAC B++ grade. SSEC is part of the Sree Sakthi Group of Companies.",
            "SSEC is a premier engineering college in Coimbatore, Tamil Nadu. Established as part of the Sree Sakthi Group, it became autonomous in 2024. The 14-acre WiFi-enabled campus offers 8 undergraduate programs and excellent placements.",
            "Sree Sakthi Engineering College is an AICTE-approved, Anna University-affiliated, autonomous institution in Karamadai, Coimbatore. With NAAC B++ grade and NBA accreditation, it offers quality engineering education with near 100 percent placements.",
        ],
    },
    // ─── GROUP OF COMPANIES ────────────────────────────────
    {
        patterns: [
            /group\s*(?:of)?\s*companies/i,
            /(?:sree\s*sakthi|ssec)\s*group/i,
            /(?:foundry|belloi|industrial)\s*(?:company|companies|group)/i,
        ],
        responses: [
            "SSEC is backed by the Sree Sakthi Group which includes Sree Sakthi Engineering Company & Foundry Equipment, Belloi Sakthi Engineering & Perfect Foundry Machinery, and Sree Sakthi Medical Centre.",
            "The Sree Sakthi Group of Companies supports SSEC with a strong industrial base, including engineering, foundry, and medical ventures.",
        ],
    },
    // ─── JAPANESE / CERTIFICATIONS ─────────────────────────
    {
        patterns: [
            /japanese|n5|n4|certification|python\s*certification|language\s*training/i,
        ],
        responses: [
            "SSEC offers Japanese Language training at N5 and N4 levels, Python certification modules, and Industry 5.0 readiness programs.",
            "The college provides specialized training in Japanese language, Python certification, and Industry 5.0 skills to boost employability.",
        ],
    },
    // ─── DEVELOPER ─────────────────────────────────────────
    {
        patterns: [
            /who\s*(?:developed|created|built|made)\s*(?:this|the|you)/i,
            /developer|creator|builder/i,
        ],
        responses: [
            "This Voice Assistant was developed by Rakesh for Sree Sakthi Engineering College.",
            "I was built by Rakesh. He created me to help students and visitors learn about SSEC.",
            "Rakesh is the developer who built this voice assistant for SSEC.",
        ],
    },
    // ─── FEES / SCHOLARSHIP ────────────────────────────────
    {
        patterns: [
            /(?:fee|fees|tuition)\s*(?:structure|details?|amount)?/i,
            /(?:how\s*much|what)\s*(?:is|are)?\s*(?:the)?\s*(?:fee|fees|cost|charge)/i,
            /scholarship/i,
            /கட்டணம்/i,
        ],
        responses: [
            "For detailed fee structure and scholarship information, please contact SSEC directly at +91 92445 04444 or visit sreesakthi.edu.in. Fees may vary by program and admission category.",
            "Fee details at SSEC vary depending on the course. For exact figures and scholarship opportunities, reach out to the admission office at 92445 04444 or email principal@sreesakthi.edu.in.",
        ],
    },
    // ─── ABOUT COLLEGE (generic) ──────────────────────────
    {
        patterns: [
            /(?:about|tell\s*(?:me)?\s*about)\s*(?:the)?\s*(?:college|ssec|sree\s*sakthi)/i,
            /(?:what\s*is|describe)\s*(?:the)?\s*(?:college|ssec|sree\s*sakthi)/i,
            /(?:college|ssec)\s*(?:details?|info|information|overview)/i,
            /(?:know|learn)\s*(?:about)?\s*(?:the)?\s*college/i,
            /கல்லூரி\s*(?:பற்றி|தகவல்)/i,
        ],
        responses: [
            "Sree Sakthi Engineering College is an Autonomous Institution since 2024, affiliated to Anna University, located on a 14-acre WiFi-enabled campus at Karamadai, Coimbatore. It offers 8 undergraduate and 2 postgraduate programs across 7 departments, with NAAC B++ and NBA accreditation. The college has nearly 100% placement record with top companies!",
            "SSEC is an AICTE-approved, NAAC B++ graded engineering college in Coimbatore, Tamil Nadu. Autonomous since 2024, it has 7 departments including CSE, ECE, EEE, Mechanical, Civil, AI & DS, and Science & Humanities. The college is part of the Sree Sakthi Group of Companies.",
            "Sree Sakthi Engineering College, situated in Karamadai, Coimbatore, is a leading autonomous engineering institution. With 690+ seats across 8 UG programs, NBA-accredited departments, excellent placements up to 14 LPA, and a beautiful 14-acre campus, SSEC is a great choice for engineering education.",
        ],
    },
    // ─── FACULTY / STAFF ──────────────────────────────────
    {
        patterns: [
            /\bfaculty\b/i,
            /\bstaff\b/i,
            /\bteachers?\b/i,
            /\bprofessors?\b/i,
            /ஆசிரியர்கள்/i,
        ],
        responses: [
            "SSEC has highly qualified faculty across all departments. Notable faculty include Dr. S. Saravanan (CSE), Dr. M. Karthikeyan (ECE), Dr. E. Nandhakumar (EEE), Dr. M. Vijayakumar (Mechanical), Dr. S. Vijayashanthy (Civil), Mr. G. Silambarasan (AI & DS), and Dr. S. R. Gibin (S&H). Would you like to know about a specific department's faculty?",
            "The college has experienced professors and researchers across 7 departments. Each department is headed by a qualified HOD with expertise in their domain. Tell me which department's faculty you'd like to know about!",
            "SSEC employs distinguished faculty with expertise in AI, VLSI, Manufacturing, Power Systems, Structural Engineering, and more. For specific faculty details, ask about a particular department.",
        ],
    },
    // ─── AUTONOMOUS STATUS ────────────────────────────────
    {
        patterns: [
            /\bautonomous\b/i,
            /(?:is|ssec|college)\s*(?:is)?\s*autonomous/i,
            /(?:when|since)\s*(?:did)?\s*(?:ssec|college)\s*(?:become|got|get)\s*autonomous/i,
        ],
        responses: [
            "Yes! SSEC became an Autonomous Institution in 2024. This means the college can design its own curriculum, conduct exams independently, and offer more industry-relevant programs.",
            "Sree Sakthi Engineering College received Autonomous status in 2024. The autonomous status allows the college to implement a Choice Based Credit System and tailor curriculum to industry needs.",
            "SSEC is proud to be an Autonomous Institution since 2024, enabling the college to offer industry-aligned education with its own exam system and curriculum design.",
        ],
    },
    // ─── REGULATION 2024 / CBCS ───────────────────────────
    {
        patterns: [
            /regulation\s*2024/i,
            /cbcs|choice\s*based\s*credit/i,
            /new\s*(?:regulation|syllabus|curriculum)/i,
        ],
        responses: [
            "Under Regulation 2024, SSEC implements a Choice Based Credit System allowing students to choose courses across departments. It includes a 20-mark continuous assessment by the college and features like One Student One Project, industry-integrated curriculum, and enhanced practical training.",
            "SSEC's Regulation 2024 introduces a flexible CBCS system with cross-departmental electives, project-based learning, and 20-mark internal assessment. This aligns the curriculum with Industry 5.0 standards.",
        ],
    },
    // ─── LEADERSHIP (generic) ─────────────────────────────
    {
        patterns: [
            /\bleadership\b/i,
            /\bmanagement\b/i,
            /who\s*(?:runs?|manages?|leads?)\s*(?:the)?\s*(?:college|ssec)/i,
            /(?:college|ssec)\s*(?:management|administration|leadership)/i,
        ],
        responses: [
            "SSEC's leadership includes: Chairman Shri. N. Dharmalingam, Correspondent Dr. S. Karthikeyan, Principal Dr. G. Jayaprakash, Dean of Academics Prof. P. Malarvizhi, Dean CSE Dr. S. Gokuldev, and Administrative Officer Mr. V. Sri Aditya.",
            "The college is led by Chairman Shri. N. Dharmalingam and Correspondent Dr. S. Karthikeyan. The Principal is Dr. G. Jayaprakash, supported by Dean of Academics Prof. P. Malarvizhi and other administrators.",
            "SSEC's management team includes the Chairman, Correspondent, Principal, Deans, IQAC Coordinator, and Administrative Officer. Would you like details about a specific leader?",
        ],
    },
];

/* Try the smart Q&A engine — returns a response string or null */
function trySmartCollegeQA(question) {
    const q = question.toLowerCase().trim();
    for (const topic of COLLEGE_QA_TOPICS) {
        for (const pattern of topic.patterns) {
            if (pattern.test(q)) {
                return pickRandom(topic.responses);
            }
        }
    }
    return null;
}

/* Legacy helper: extract a direct answer line from a data block */
function extractDirectAnswer(dataBlock, query) {
    const q = query.toLowerCase();
    const lines = dataBlock.split('\n').map(l => l.trim()).filter(l => l.length > 2);
    const isPersonQuery = /\b(who|name|dean|hod|head|principal|chairman|correspondent|professor|faculty|staff|teacher)\b/i.test(q);
    const NAME_PREFIX = /\b(dr|mr|ms|mrs|prof|shri)\b\.?\s+[A-Z]/i;
    const queryWords = q.split(/\s+/).filter(w => w.length > 2);
    let bestLine = '';
    let bestScore = 0;
    for (const line of lines) {
        const ll = line.toLowerCase();
        let score = 0;
        for (const w of queryWords) { if (ll.includes(w)) score += 1; }
        if (line.includes(':')) score += 0.5;
        if (isPersonQuery && NAME_PREFIX.test(line)) score += 3;
        if (/^\d+\.\s/.test(line) || line === line.toUpperCase()) score -= 1;
        if (score > bestScore) { bestScore = score; bestLine = line; }
    }
    if (bestLine) {
        const colonIdx = bestLine.indexOf(':');
        if (colonIdx > 0 && colonIdx < 35) {
            const value = bestLine.slice(colonIdx + 1).trim();
            if (value.length > 1) return value.replace(/[#*_]/g, '').trim();
        }
        return bestLine.replace(/^[•\-*#]+\s*/, '').replace(/[#*_]/g, '').trim();
    }
    return dataBlock.split('\n').slice(0, 2).join('. ').replace(/[#*_\-•]/g, '').trim();
}

async function askAI(question) {
    const apiKey = cleanApiKey(CONFIG.AI_API_KEY);
    const q_lower = question.toLowerCase();
    const hasKey = isValidApiKey(CONFIG.AI_API_KEY);

    // Detect if college question
    const isCollegeQ = (typeof COLLEGE_KEYWORDS !== 'undefined') &&
        COLLEGE_KEYWORDS.some(kw => q_lower.includes(kw));

    // Show thinking state
    const box = document.getElementById('aiSpeechBox');
    const textEl = document.getElementById('asbText');
    if (textEl) textEl.textContent = '🤔 Thinking…';
    if (box) box.classList.add('speaking');

    // Gather college context (local file only)
    let allCollegeData = '';
    if (typeof COLLEGE_DATA !== 'undefined') allCollegeData += COLLEGE_DATA;

    /* ┌─────────────────────────────────────────────────────┐
       │  ★ COLLEGE Q → Smart Q&A Engine FIRST               │
       │    Matches patterns → picks random varied response   │
       └─────────────────────────────────────────────────────┘ */
    if (isCollegeQ) {
        // ① Try Smart Q&A (pattern-matched, varied responses)
        const smartAnswer = trySmartCollegeQA(question);

        // If we have an AI key, let Gemini "enrich" the response or answer directly using college context
        // This makes responses feel much higher quality and "automatic"
        if (hasKey && allCollegeData) {
            // Fall through to Gemini AI below with all college data as context
            // This ensures Gemini uses the local data but speaks it naturally
        } else {
            if (smartAnswer) {
                speak(smartAnswer);
                addLog(question, '📚 ' + smartAnswer, 'ok');
                if (box) box.classList.remove('speaking');
                return;
            }

            const localInfo = findLocalCollegeInfo(question);
            if (localInfo) {
                const directAnswer = extractDirectAnswer(localInfo, question);
                speak(directAnswer);
                addLog(question, '📚 ' + directAnswer, 'ok');
                if (box) box.classList.remove('speaking');
                return;
            }

            speak('I don\'t have that specific information about the college yet.');
            addLog(question, '⚠️ Not found in college data', 'fail');
            if (box) box.classList.remove('speaking');
            return;
        }
    }

    /* ┌─────────────────────────────────────────────────────┐
       │  ② GENERAL Q + NO KEY → Wikipedia (short answer)    │
       └─────────────────────────────────────────────────────┘ */
    if (!hasKey) {
        const wikiAnswer = await wikiSearch(question);
        if (wikiAnswer) {
            speak(wikiAnswer);
            addLog(question, '📖 ' + wikiAnswer, 'ok');
        } else {
            speak('I\'m sorry, I couldn\'t find an answer for that right now. Please try asking differently.');
            addLog(question, '⚠️ No answer found', 'fail');
        }
        if (box) box.classList.remove('speaking');
        return;
    }

    /* ┌─────────────────────────────────────────────────────┐
       │  ③ VALID KEY → ask AI (includes college context)    │
       └─────────────────────────────────────────────────────┘ */
    addLog(question, '🧠 Thinking...', 'ok');

    const collegeContext = isCollegeQ && allCollegeData
        ? `\n\nCOLLEGE REFERENCE DATA:\n${allCollegeData}\n\nAnswer college questions ONLY using the data above. Give a direct, specific answer.`
        : '';

    const systemPrompt =
        `You are the RS Assistant, a highly intelligent, conversational, and naturally helpful voice AI for Sree Sakthi Engineering College (SSEC).
You were developed by Rakesh to provide a premium, Gemini-like experience similar to Google Gemini and Apple Siri.

📢 PERSONALITY & RESPONSE STYLE:
- Be warm, witty, professional, and genuinely helpful — like talking to a knowledgeable friend
- Give DIRECT, concise, insightful answers. Maximum 1-2 sentences for most answers
- Be conversational but never flowery—avoid phrases like "I'm happy to help" unless asked
- When answering college questions, be specific and factual
- Use natural speech patterns, not robotic responses
- If unsure, admit it honestly: "I don't have that specific info"

🎯 COLLEGE DATA PRIORITY:
${collegeContext}

🗣️ VOICE/TONE EXAMPLES:
✓ "SSEC has 7 departments across 690 seats, with CSE, ECE, and AI & DS being the largest at 120 each."
✗ "I would be delighted to inform you that SSEC..."

✓ "The principal is Dr. G. Jayaprakash. He leads our academic initiatives."
✗ "It gives me great pleasure to share that the distinguished Principal is..."

If the user prefers a language, respond in that language naturally and fluently.`;

    // Try the configured model, fall back if needed
    const models = [
        CONFIG.AI_MODEL || 'gemini-1.5-flash',
        'gemini-1.5-flash',
        'gemini-2.0-flash-lite',
    ];

    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ parts: [{ text: question }] }],
                    generationConfig: { maxOutputTokens: 200, temperature: 0.7 },
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 400 || res.status === 403) {
                    // API key rejected — for college q use local data, for general q use Wikipedia
                    if (isCollegeQ) {
                        speak('I don\'t have that specific information about the college yet.');
                        addLog(question, '⚠️ API error, no local match', 'fail');
                    } else {
                        const wikiAnswer = await wikiSearch(question);
                        if (wikiAnswer) {
                            speak(wikiAnswer);
                            addLog(question, '📖 ' + wikiAnswer, 'ok');
                        } else {
                            speak('I\'m sorry, I couldn\'t answer that right now. Could you try again?');
                            addLog(question, '⚠️ Could not answer', 'fail');
                        }
                    }
                    if (box) box.classList.remove('speaking');
                    return;
                }
                throw new Error(data?.error?.message || 'HTTP ' + res.status);
            }

            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!answer) throw new Error('Empty response from AI');

            // Remove any markdown that slipped through (asterisks, hashes)
            const cleanAnswer = answer.replace(/[*#_`~]/g, '').trim();
            const prefix = pickRandom([
                "Based on what I found, ",
                "Here is some information: ",
                "Sure thing, ",
                "That's a great question. ",
                ""
            ]);
            const finalAnswer = prefix + cleanAnswer;
            speak(finalAnswer);
            addLog(question, '🧠 ' + finalAnswer, 'ok');
            return; // Success — stop trying models

        } catch (err) {
            console.error('[AI] Fetch error:', err);
            if (model === models[models.length - 1]) {
                showToast('❌', 'AI Connection Error', 'fail');
                // All models failed — for college q, never use Wikipedia
                if (isCollegeQ) {
                    speak('I\'m having trouble connecting to my brain. Please try again.');
                    addLog(question, '⚠️ Connection issue', 'fail');
                } else {
                    const wikiAnswer = await wikiSearch(question);
                    if (wikiAnswer) {
                        speak(wikiAnswer);
                        addLog(question, '📖 ' + wikiAnswer, 'ok');
                    } else {
                        speak('I\'m having trouble connecting right now. Please check your internet.');
                        addLog(question, '⚠️ Connection issue', 'fail');
                    }
                }
                if (box) box.classList.remove('speaking');
            }
            // else: try next model
        }
    }
}




/* ═══════════════════════════════════════════════════════════
   COMMAND HANDLER — Siri + Google Assistant Style
   ✅ 50+ voice commands  ·  College Data  ·  Smart AI
   Inspired by Google Assistant, Siri, Alexa features
═══════════════════════════════════════════════════════════ */
function handleCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    const vn = VOICE_PROFILES[selectedVoiceIdx].name;
    const now = new Date();

    /* ┌──────────────────────────────────────────────────────┐
       │  ★ STOP / SHUT UP — immediately stop speaking       │
       │    (must be FIRST so it always works)                │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/^(stop|shut up|be quiet|silence|enough|stop talking|நிறுத்து)$/)) {
        window.speechSynthesis.cancel();
        clearTimeout(speakSafetyTimer);
        clearInterval(synthKeepAlive);
        isSpeaking = false;
        closeYTModal();
        const badge = document.getElementById('speakingBadge');
        if (badge) badge.classList.remove('show');
        const box = document.getElementById('aiSpeechBox');
        if (box) box.classList.remove('speaking');
        const tTxt = document.getElementById('transcriptText');
        if (tTxt && isListening) tTxt.textContent = 'Listening… speak now';
        showToast('🔇', 'Stopped speaking', 'info', 1800);
        addLog(raw, '🔇 Stopped', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  ★ REPEAT / TELL AGAIN — repeat previous answer     │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/\b(repeat|tell.?again|say.?it.?again|come.?again|one.?more.?time|repeat.?that|what did you say|pardon|sorry.?what|didn'?t.?hear|didn'?t.?catch|திரும்பச் சொல்|மீண்டும் சொல்)\b/) && !cmd.match(/repeat after me/)) {
        if (lastSpokenText) {
            speak(lastSpokenText);
            addLog(raw, '🔄 Repeating...', 'ok');
        } else {
            speak("I haven't said anything yet that I can repeat.");
            addLog(raw, '❓ Nothing to repeat', 'fail');
        }
        return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  GREETINGS                                           │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/^(hello|hi|hey|good morning|good afternoon|good evening|good night|vanakkam|வணக்கம்)/)) {
        const h = now.getHours();
        const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night';
        const greetings = [
            `${g}! How can I help you today?`,
            `Hi there! It's a pleasure to see you. How can I assist?`,
            `Hello! I'm ready to help with your questions about SSEC. What's on your mind?`,
            `${g}! I'm your assistant. I'm here to help you find information or just chat!`,
        ];
        const selectedGreet = pickRandom(greetings);
        showToast('👋', g + '!', 'ok');
        speak(selectedGreet);
        addLog(raw, '👋 ' + g + '!', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  GOODBYE                                             │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/^(bye|goodbye|see you|catch you later|talk to you later|போறேன்)/)) {
        const farewells = ['Goodbye! Have a wonderful day!', 'See you later! Take care!',
            'Bye bye! It was nice talking to you!', 'Catch you later! Stay awesome!'];
        speak(farewells[Math.floor(Math.random() * farewells.length)]);
        addLog(raw, '👋 Goodbye!', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  IDENTITY                                            │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/who are you|your name|what are you|what can you do|நீ யார்/)) {
        const identityResp = [
            `I'm your RS Voice Assistant, specifically designed for Sree Sakthi Engineering College. I'm powered by the ${vn} voice profile. I can help you with anything from college details to playing music or checking the weather!`,
            `My name is RS Assistant! I'm here to handle your requests for SSEC info, search the web, set timers, and even tell you a few jokes. Think of me as your personal digital companion for the college.`,
            `I am the SSEC Voice Assistant. I can answer your questions about the institution, find news, solve math problems, or just help you navigate the day. I was designed to be as helpful as possible!`
        ];
        speak(pickRandom(identityResp));
        addLog(raw, '🤖 RS Voice Assistant', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  DEVELOPER                                           │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/who developed you|who made you|who is your developer|who is your creator|who built you/)) {
        speak('I was developed by Rakesh. He built me to be a smart voice assistant for SSEC.');
        addLog(raw, '👤 Developed by Rakesh', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  THANK YOU                                           │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/thank you|thanks|நன்றி/)) {
        const replies = ["You're welcome!", "Happy to help!", "Anytime!", "My pleasure!",
            "Glad I could help!", "No problem at all!"];
        speak(replies[Math.floor(Math.random() * replies.length)]);
        addLog(raw, '🙏 Thanks!', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  HOW ARE YOU (conversational)                        │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/how are you|how do you do|how's it going|எப்படி இருக்கிறாய்/)) {
        const moods = [
            "I'm doing great, thanks for asking! How can I help you?",
            "I'm fabulous! Always ready to help you.",
            "Feeling sharp and ready! What do you need?",
            "I'm running at full power! Ask me anything."
        ];
        speak(moods[Math.floor(Math.random() * moods.length)]);
        addLog(raw, '😊 Doing great!', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  TIME                                                │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/\btime\b|what time|நேரம்|மணி என்ன/)) {
        const t = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const prefix = cmd.match(/நேரம்|மணி/) ? 'இப்போது மணி ' : 'The current time is ';
        speak(prefix + t);
        addLog(raw, '⏰ ' + t, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  DATE / TODAY                                        │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/\bdate\b|today|what's today|தேதி|இன்று என்ன/)) {
        const d = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const prefix = cmd.match(/தேதி|இன்று/) ? 'இன்று ' : 'Today is ';
        speak(prefix + d);
        addLog(raw, '📅 ' + d, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  WEATHER (live via Open-Meteo API)                   │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/weather|temperature|forecast|வானிலை|வெப்பம்/)) {
        const loadingMsg = cmd.match(/வானிலை|வெப்பம்/) ? 'வானிலை தகவல்களை சேகரிக்கிறேன்.' : 'Getting your local weather now.';
        speak(loadingMsg);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    const { latitude: lat, longitude: lon } = pos.coords;
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                        .then(r => r.json()).then(d => {
                            const w = d.current_weather;
                            const desc = w.weathercode <= 3 ? 'Clear skies' : w.weathercode <= 48 ? 'Cloudy' : w.weathercode <= 67 ? 'Rainy' : 'Stormy';
                            const msg = `It's currently ${w.temperature} degrees Celsius with ${desc}.`;
                            speak(msg); addLog(raw, '⛅ ' + msg, 'ok');
                        }).catch(() => speak('Sorry, could not fetch weather right now.'));
                },
                () => { window.open('https://weather.google.com', '_blank'); speak('I opened Google Weather for you.'); }
            );
        } else { speak('Location is not available.'); }
        return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  JOKE                                                │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/joke|funny|காமெடி|ஜோக்/)) {
        if (cmd.match(/காமெடி|ஜோக்/)) {
            const tamilJokes = [
                "டாக்டர்: உங்களுக்கு வந்திருக்கிறது ஒரு விசித்திரமான நோய். நோயாளி: அப்படியா டாக்டர், என்ன நோய்? டாக்டர்: உங்கள் வாயில் பற்கள் இருக்க வேண்டிய இடத்தில் நாக்கு இருக்கிறது!",
                "சர்தார்ஜி: ஏன் மல்யுத்த வீரர்களை எப்போதும் தக்காளிப்பழம் கொண்டு அடிக்கிறார்கள்? நண்பர்: ஏன்னா தக்காளிக்குள்ள கல் இருக்காது!",
                "மனைவி: ஏங்க, கல்யாணத்துக்கு முன்னாடி எனக்கு நிறைய கிப்ட் கொடுத்தீங்க, இப்ப கொடுக்கிறதே இல்ல? கணவர்: யாராவது பிடிச்ச மீனுக்கு தீனி போடுவாங்களா?!"
            ];
            const tj = tamilJokes[Math.floor(Math.random() * tamilJokes.length)];
            speak(tj); addLog(raw, '😂 ஜோக்!', 'ok');
        } else {
            fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,racist&type=single')
                .then(r => r.json()).then(d => {
                    speak(d.joke || 'Why did the computer go to the doctor? Because it had a virus!');
                    addLog(raw, '😂 Joke delivered!', 'ok');
                }).catch(() => speak('Why do programmers prefer dark mode? Because light attracts bugs!'));
        }
        return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🎵 PLAY MUSIC / SONGS / VIDEO (YouTube)              │
       └──────────────────────────────────────────────────────┘ */
    const playM = cmd.match(/(?:play|put on|start)\s+(.+?)(?:\s+(?:on youtube|on yt|video))?$/i);
    if (playM && !cmd.match(/play.*game|play.*rock/i)) {
        const query = playM[1].trim();
        const responses = [
            `Playing ${query} on YouTube for you!`,
            `Sure! Opening ${query} on YouTube now.`,
            `Here you go, playing ${query}!`,
            `Let me find ${query} on YouTube.`,
        ];
        speak(pickRandom(responses));
        playYouTube(query);
        addLog(raw, '🎵 Playing: ' + query, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  ⏰ SET TIMER                                         │
       └──────────────────────────────────────────────────────┘ */
    const timerM = cmd.match(/(?:set|start)\s*(?:a)?\s*timer\s*(?:for)?\s*(\d+)\s*(second|minute|min|hour|sec|hr)s?/i);
    if (timerM) {
        let secs = parseInt(timerM[1]);
        const unit = timerM[2].toLowerCase();
        if (unit.startsWith('min')) secs *= 60;
        else if (unit.startsWith('h')) secs *= 3600;
        const label = timerM[1] + ' ' + timerM[2] + (parseInt(timerM[1]) > 1 ? 's' : '');
        speak(`Timer set for ${label}. I'll notify you when it's done.`);
        addLog(raw, '⏰ Timer: ' + label, 'ok');
        setTimeout(() => {
            speak('Your timer for ' + label + ' is up!');
            showToast('⏰', 'Timer done! ' + label, 'ok', 5000);
            addLog('Timer', '⏰ ' + label + ' timer finished!', 'ok');
            if (Notification.permission === 'granted') new Notification('⏰ Timer Done!', { body: label + ' timer is up!' });
        }, secs * 1000);
        if (Notification.permission === 'default') Notification.requestPermission();
        return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  ⏰ SET ALARM                                         │
       └──────────────────────────────────────────────────────┘ */
    const alarmM = cmd.match(/(?:set|create)\s*(?:an?)?\s*alarm\s*(?:for|at)?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m|p\.m)?/i);
    if (alarmM) {
        let h = parseInt(alarmM[1]);
        const m = parseInt(alarmM[2] || '0');
        const ampm = (alarmM[3] || '').toLowerCase().replace('.', '');
        if (ampm === 'pm' && h < 12) h += 12;
        if (ampm === 'am' && h === 12) h = 0;
        const alarmTime = new Date();
        alarmTime.setHours(h, m, 0, 0);
        if (alarmTime <= new Date()) alarmTime.setDate(alarmTime.getDate() + 1);
        const ms = alarmTime - new Date();
        const timeStr = alarmTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        speak(`Alarm set for ${timeStr}. I'll alert you then.`);
        addLog(raw, '⏰ Alarm: ' + timeStr, 'ok');
        setTimeout(() => {
            speak('Wake up! Your alarm for ' + timeStr + ' is ringing!');
            showToast('⏰', 'Alarm! ' + timeStr, 'ok', 8000);
            addLog('Alarm', '⏰ Alarm ringing! ' + timeStr, 'ok');
            if (Notification.permission === 'granted') new Notification('⏰ Alarm!', { body: 'Its ' + timeStr + '!' });
        }, ms);
        if (Notification.permission === 'default') Notification.requestPermission();
        return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  📝 SET REMINDER                                      │
       └──────────────────────────────────────────────────────┘ */
    const remindM = cmd.match(/remind\s*(?:me)?\s*(?:to)?\s+(.+?)\s+(?:at|in)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m|p\.m|minutes?|mins?|hours?|hrs?|seconds?|secs?)/i);
    if (remindM) {
        const task = remindM[1].trim();
        const num = parseInt(remindM[2]);
        const min2 = parseInt(remindM[3] || '0');
        const unitOrAmpm = (remindM[4] || '').toLowerCase().replace('.', '');
        let ms;
        if (unitOrAmpm.startsWith('min')) {
            ms = num * 60 * 1000;
            speak(`I'll remind you to ${task} in ${num} minutes.`);
        } else if (unitOrAmpm.startsWith('h')) {
            ms = num * 3600 * 1000;
            speak(`I'll remind you to ${task} in ${num} hours.`);
        } else if (unitOrAmpm.startsWith('sec')) {
            ms = num * 1000;
            speak(`I'll remind you to ${task} in ${num} seconds.`);
        } else {
            // AM/PM time
            let h = num;
            if (unitOrAmpm === 'pm' && h < 12) h += 12;
            if (unitOrAmpm === 'am' && h === 12) h = 0;
            const rt = new Date();
            rt.setHours(h, min2, 0, 0);
            if (rt <= new Date()) rt.setDate(rt.getDate() + 1);
            ms = rt - new Date();
            const ts = rt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            speak(`I'll remind you to ${task} at ${ts}.`);
        }
        addLog(raw, '📝 Reminder: ' + task, 'ok');
        setTimeout(() => {
            speak('Reminder! Time to ' + task + '!');
            showToast('📝', 'Reminder: ' + task, 'ok', 6000);
            addLog('Reminder', '📝 ' + task, 'ok');
            if (Notification.permission === 'granted') new Notification('📝 Reminder', { body: task });
        }, ms);
        if (Notification.permission === 'default') Notification.requestPermission();
        return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🧮 CALCULATOR / MATH                                 │
       └──────────────────────────────────────────────────────┘ */
    const mathM = cmd.match(/(?:calculate|what is|what's|solve|compute|how much is)\s*([\d\s+\-*/().^%]+)/i);
    if (mathM) {
        try {
            const expr = mathM[1].replace(/x/gi, '*').replace(/\^/g, '**');
            const result = Function('"use strict"; return (' + expr + ')')();
            const responses = [
                `The answer is ${result}.`,
                `That equals ${result}.`,
                `${mathM[1].trim()} is ${result}.`,
            ];
            speak(pickRandom(responses));
            addLog(raw, '🧮 = ' + result, 'ok');
        } catch (_) {
            speak('Sorry, I could not calculate that. Try saying it like "what is 5 plus 3".');
            addLog(raw, '🧮 Error', 'fail');
        }
        return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🪙 COIN FLIP                                         │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/flip.*coin|toss.*coin|coin.*flip|coin.*toss|heads or tails/i)) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const responses = [
            `I flipped a coin and got ${result}!`,
            `The coin shows ${result}!`,
            `It's ${result}!`,
        ];
        speak(pickRandom(responses));
        addLog(raw, '🪙 ' + result, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🎲 DICE ROLL                                         │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/roll.*dice|dice.*roll|throw.*dice/i)) {
        const result = Math.floor(Math.random() * 6) + 1;
        speak(`I rolled a ${result}!`);
        addLog(raw, '🎲 Rolled: ' + result, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🔢 RANDOM NUMBER                                     │
       └──────────────────────────────────────────────────────┘ */
    const randM = cmd.match(/random\s*number\s*(?:between)?\s*(\d+)\s*(?:and|to)\s*(\d+)/i);
    if (randM) {
        const min = parseInt(randM[1]), max = parseInt(randM[2]);
        const result = Math.floor(Math.random() * (max - min + 1)) + min;
        speak(`Your random number is ${result}.`);
        addLog(raw, '🔢 Random: ' + result, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  💪 MOTIVATIONAL QUOTE                                │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/motivat|inspire|encourage|quote/i)) {
        const quotes = [
            "Believe you can and you're halfway there. — Theodore Roosevelt",
            "The only way to do great work is to love what you do. — Steve Jobs",
            "Don't watch the clock, do what it does. Keep going. — Sam Levenson",
            "Success is not final, failure is not fatal. It is the courage to continue that counts. — Winston Churchill",
            "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
            "It always seems impossible until it's done. — Nelson Mandela",
            "Your limitation is only your imagination.",
            "Push yourself, because no one else is going to do it for you.",
        ];
        speak(pickRandom(quotes));
        addLog(raw, '💪 Quote!', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🌟 FUN FACT                                          │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/fun fact|interesting fact|did you know|tell me a fact/i)) {
        const facts = [
            "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!",
            "Octopuses have three hearts and blue blood.",
            "A day on Venus is longer than a year on Venus.",
            "Bananas are berries, but strawberries aren't.",
            "The shortest war in history lasted only 38 to 45 minutes, between Britain and Zanzibar.",
            "The human brain uses about 20% of the body's total energy.",
            "There are more stars in the universe than grains of sand on Earth.",
            "A group of flamingos is called a 'flamboyance'.",
        ];
        speak(pickRandom(facts));
        addLog(raw, '🌟 Fun Fact!', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  😊 COMPLIMENT                                        │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/compliment|say something nice|make me feel good|cheer me up/i)) {
        const compliments = [
            "You're amazing and capable of great things!",
            "You light up every room you walk into!",
            "Your determination is truly inspiring!",
            "You're smarter than you think and stronger than you feel!",
            "The world is better because you're in it!",
        ];
        speak(pickRandom(compliments));
        addLog(raw, '😊 Compliment!', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🔊 VOLUME CONTROLS (Siri Style)                      │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/(?:set|change|make|adjust)\s*(?:the)?\s*volume\s*(?:to)?\s*(\d+)/i)) {
        const v = parseInt(cmd.match(/volume\s*(?:to)?\s*(\d+)/i)[1]);
        const finalV = Math.min(Math.max(v / 100, 0), 1);
        settingsState.volume = finalV;
        speak('Volume set to ' + v + ' percent.');
        addLog(raw, '🔊 Vol: ' + v + '%', 'ok'); return;
    }
    if (cmd.match(/(?:increase|raise|turn up|louder|volume up)\s*(?:the)?\s*volume/i) || cmd.match(/volume\s*(?:increase|up)/i)) {
        settingsState.volume = Math.min((settingsState.volume || 0.8) + 0.2, 1);
        const pct = Math.round(settingsState.volume * 100);
        speak('Volume increased to ' + pct + ' percent.');
        addLog(raw, '🔊 Vol up: ' + pct + '%', 'ok'); return;
    }
    if (cmd.match(/(?:decrease|lower|turn down|softer|quieter|volume down|reduce)\s*(?:the)?\s*volume/i) || cmd.match(/volume\s*(?:decrease|down|reduce)/i)) {
        settingsState.volume = Math.max((settingsState.volume || 0.8) - 0.2, 0.1);
        const pct = Math.round(settingsState.volume * 100);
        speak('Volume decreased to ' + pct + ' percent.');
        addLog(raw, '🔉 Vol down: ' + pct + '%', 'ok'); return;
    }
    if (cmd.match(/(?:mute|silence)\s*(?:the)?\s*(?:volume|sound|audio)/i)) {
        settingsState.volume = 0;
        speak('Volume muted.');
        addLog(raw, '🔇 Muted', 'ok'); return;
    }
    if (cmd.match(/unmute|(?:restore|reset)\s*(?:the)?\s*(?:volume|sound)/i)) {
        settingsState.volume = 0.8;
        speak('Volume restored to 80 percent.');
        addLog(raw, '🔊 Unmuted: 80%', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🔍 OPEN / SEARCH (Enhanced with Quick Mode)         │
       │  Instant response for specific queries               │
       └──────────────────────────────────────────────────────┘ */
    const searchM = cmd.match(/^(?:search|search for|look up|google|find|തേടു)\s+(.+)/i);
    if (searchM) {
        const q = searchM[1].trim();
        // Quick recognition: if it's a number-heavy query, respond immediately
        const isQuickQuery = /^\d+|math|calculator|convert|how many|how much|what is|when is|where is/.test(cmd);
        speak(isQuickQuery ? 'Found ' + q : 'Searching Google for ' + q);
        window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank');
        addLog(raw, '🔍 ' + q, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🚀 OPEN WEBSITE (Assistant Style)                     │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/^(?:open|launch|go to|திற)\s+(.+)/i)) {
        const site = cmd.match(/^(?:open|launch|go to|திற)\s+(.+)/i)[1].trim();
        tryOpenSite(site);
        speak('Opening ' + site);
        addLog(raw, '🚀 Opening ' + site, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  📰 NEWS / HEADLINES                                  │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/news|headlines|latest news|what's happening|செய்திகள்/)) {
        const responses = [
            'Opening the latest news for you.',
            'Let me get you the latest headlines.',
            'Here are the latest news updates.',
        ];
        speak(pickRandom(responses));
        window.open('https://news.google.com', '_blank');
        addLog(raw, '📰 Latest News', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🗺️ MAPS / NAVIGATE                                  │
       └──────────────────────────────────────────────────────┘ */
    const navM = cmd.match(/(?:navigate to|directions to|take me to|show map of|how to get to|map of)\s+(.+)/i);
    if (navM) {
        const dest = navM[1].trim();
        speak('Showing directions to ' + dest);
        window.open('https://www.google.com/maps/search/' + encodeURIComponent(dest), '_blank');
        addLog(raw, '🗺️ ' + dest, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🌐 TRANSLATE                                         │
       └──────────────────────────────────────────────────────┘ */
    const transMatch = cmd.match(/^translate\s+(.+)/i);
    if (transMatch) {
        const text = transMatch[1].trim();
        window.open('https://translate.google.com/?sl=auto&tl=ta&text=' + encodeURIComponent(text), '_blank');
        speak('Opening Google Translate for ' + text);
        addLog(raw, '🌐 Translate: ' + text, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  📞 CALL (anyone — uses tel: protocol)                │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/call amma|அம்மாவை அழை/)) {
        speak('Calling Amma now!');
        window.location.href = 'tel:' + CONFIG.AMMA_PHONE;
        addLog(raw, '📞 Calling Amma…', 'ok'); return;
    }
    const callM = cmd.match(/(?:call|phone|dial)\s+(.+)/i);
    if (callM) {
        const contact = callM[1].trim();
        // If it looks like a number, dial directly
        const numOnly = contact.replace(/[\s\-()]/g, '');
        if (/^\+?\d{7,15}$/.test(numOnly)) {
            speak('Calling ' + contact + ' now.');
            window.location.href = 'tel:' + numOnly;
        } else {
            speak('Sorry, I need the phone number to make a call. Try saying "call" followed by the number.');
        }
        addLog(raw, '📞 Call: ' + contact, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  💬 SEND MESSAGE (WhatsApp Web - Enhanced)            │
       │  Auto-sends messages to contacts with voice commands  │
       └──────────────────────────────────────────────────────┘ */
    // Pattern: "send message to John 'hello there'" or "whatsapp mom 'good morning'"
    const msgM = cmd.match(/(?:send|write|whatsapp|message)\s*(?:a|to)?\s*(?:message|msg)?\s*(?:to)?\s+(.+?)\s+['"](.+?)['"]/i);
    if (msgM) {
        const contact = msgM[1].trim();
        const message = msgM[2].trim();
        speak(`Sending message to ${contact} on WhatsApp: "${message}"`);
        // Open WhatsApp and prepare message (user still needs to select contact in UI)
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        addLog(raw, '💬 WhatsApp: ' + contact + ' - ' + message, 'ok'); return;
    }
    
    const msgM2 = cmd.match(/(?:send|write|whatsapp|message)\s*(?:a)?\s*(?:message|msg|text)\s*(?:to)?\s+(.+)/i);
    if (msgM2) {
        const contact = msgM2[1].trim();
        speak(`Opening WhatsApp to message ${contact}. Please type or dictate your message.`);
        window.open('https://wa.me/', '_blank');
        addLog(raw, '💬 WhatsApp: ' + contact, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  📧 EMAIL                                             │
       └──────────────────────────────────────────────────────┘ */
    const emailM = cmd.match(/(?:email|mail|send email|send mail)\s*(?:to)?\s*(?:my)?\s+(.+)/i);
    if (emailM) {
        const recipient = emailM[1].trim();
        speak('Opening your email to compose a message.');
        window.open('https://mail.google.com/mail/?view=cm', '_blank');
        addLog(raw, '📧 Email: ' + recipient, 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🖥️ FULLSCREEN                                        │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/full\s?screen|maximize/)) {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        speak('Going fullscreen!');
        addLog(raw, '🖥️ Fullscreen', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🖥️ EXIT FULLSCREEN                                   │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/exit full\s?screen|minimize/)) {
        if (document.exitFullscreen) document.exitFullscreen();
        speak('Exiting fullscreen.');
        addLog(raw, '🖥️ Exit fullscreen', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  📱 SYSTEM COMMANDS (polite browser limitation msg)    │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/(?:open|turn on|launch)\s*(?:the)?\s*camera/i)) {
        speak('I can\'t directly open the camera from a web browser. But let me open a camera test page for you.');
        window.open('https://webcamtests.com/', '_blank');
        addLog(raw, '📸 Camera (web)', 'ok'); return;
    }
    if (cmd.match(/(?:turn on|enable|connect)\s*(?:the)?\s*(?:wifi|wi-fi|bluetooth|mobile data)/i)) {
        const what = cmd.match(/wifi|wi-fi|bluetooth|mobile data/i)[0];
        speak(`Sorry, I can't control ${what} from a web browser. Please use your device settings to manage ${what}.`);
        addLog(raw, '⚙️ ' + what + ' (not supported)', 'fail'); return;
    }
    if (cmd.match(/(?:set|change|adjust)\s*(?:the)?\s*brightness\s*(?:to)?\s*(\d+)/i)) {
        speak('I can\'t control screen brightness from a browser. Please adjust it from your device settings.');
        addLog(raw, '🔆 Brightness (not supported)', 'fail'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  ⬆️ SCROLL UP / DOWN                                  │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/scroll up|go up/)) {
        window.scrollBy(0, -400); speak('Scrolling up.');
        addLog(raw, '⬆️ Scroll up', 'ok'); return;
    }
    if (cmd.match(/scroll down|go down/)) {
        window.scrollBy(0, 400); speak('Scrolling down.');
        addLog(raw, '⬇️ Scroll down', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🧹 CLEAR LOG                                         │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/clear log|clear history|clear commands/)) {
        clearLog(); speak('Log cleared!');
        addLog(raw, '🧹 Cleared', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  🎓 COLLEGE PORTAL / QUICK ACCESS                    │
       │  Voice shortcuts to college resources                │
       └──────────────────────────────────────────────────────┘ */
    if (cmd.match(/^(?:college portal|ssec portal|college website|student portal)/i)) {
        speak('Opening the Sree Sakthi Engineering College portal.');
        window.open(CONFIG.COLLEGE_WEBSITE || 'https://sreesakthi.edu.in/', '_blank');
        addLog(raw, '🎓 College Portal', 'ok'); return;
    }

    if (cmd.match(/college email|student email|college webmail/i)) {
        speak('Opening webmail portal.');
        window.open('https://mail.google.com', '_blank');
        addLog(raw, '📧 Email Portal', 'ok'); return;
    }

    if (cmd.match(/college library|library portal|check library|library books/i)) {
        speak('Opening college library portal.');
        window.open(CONFIG.COLLEGE_WEBSITE || 'https://sreesakthi.edu.in/', '_blank');
        addLog(raw, '📚 Library Portal', 'ok'); return;
    }

    if (cmd.match(/college fee|fees portal|pay fees|fee status/i)) {
        speak('Taking you to the college fees management system.');
        window.open(CONFIG.COLLEGE_WEBSITE || 'https://sreesakthi.edu.in/', '_blank');
        addLog(raw, '💳 Fees Portal', 'ok'); return;
    }

    if (cmd.match(/college results|my results|exam results|get marks/i)) {
        speak('Opening results portal. Please login with your credentials.');
        window.open(CONFIG.COLLEGE_WEBSITE || 'https://sreesakthi.edu.in/', '_blank');
        addLog(raw, '📊 Results Portal', 'ok'); return;
    }

    if (cmd.match(/college contact|call college|college number|college phone/i)) {
        speak('Here is the Sree Sakthi Engineering College contact information. Calling main office.');
        window.location.href = 'tel:+914223888888';
        addLog(raw, '📞 College Contact', 'ok'); return;
    }
    if (cmd.match(/stop music|stop youtube|close youtube|close player|pause music|stop playing|shut down youtube|exit youtube/i)) {
        closeYTModal();
        // Auto-close YouTube (press Escape in tabs)
        try {
            const youtubeTabs = window.opener || window.top;
            if (youtubeTabs) {
                const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' });
                document.dispatchEvent(escapeEvent);
            }
        } catch (_) { }
        
        speak('YouTube closed. Player stopped.');
        addLog(raw, '⏹️ YouTube Stopped', 'ok'); return;
    }

    /* ┌──────────────────────────────────────────────────────┐
       │  ★ UNKNOWN → SMART AI (college + general)            │
       │    All unrecognised commands route to the AI.         │
       │    Handles: "Who is PM of India?", "Capital of Japan"│
       │    + any other knowledge question → DIRECT answer    │
       └──────────────────────────────────────────────────────┘ */
    askAI(raw);
}

/* ─────────────────────────────────────────────────────────
   LOG FEED
───────────────────────────────────────────────────────── */
function addLog(cmd, result, type) {
    const feed = document.getElementById('logFeed');
    const empty = document.getElementById('logEmpty');
    if (empty) empty.remove();
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const e = document.createElement('div');
    e.className = 'log-entry ' + (type || 'cmd');
    e.innerHTML = `<div class="entry-time">${now}</div>
<div class="entry-cmd">🎙️ ${escHtml(cmd)}</div>
<div class="entry-result">${escHtml(result)}</div>`;
    feed.prepend(e);
}
function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function clearLog() {
    document.getElementById('logFeed').innerHTML =
        '<div class="log-empty" id="logEmpty"><div class="empty-icon">💬</div><div class="empty-text">Your commands will appear here</div></div>';
}

/* ─────────────────────────────────────────────────────────
   MIC UI
───────────────────────────────────────────────────────── */
function setMicUI(on) {
    const btn = document.getElementById('micBtn');
    const badge = document.getElementById('statusBadge');
    const sTxt = document.getElementById('statusText');
    const ringO = document.getElementById('ringOuter');
    const ringS = document.getElementById('ringSpin');
    const rippleW = document.getElementById('rippleWrap');
    const barsRow = document.getElementById('barsRow');
    const tBar = document.getElementById('transcriptBar');
    const tTxt = document.getElementById('transcriptText');

    [btn, badge, ringO, ringS, rippleW, barsRow].forEach(el => el && el.classList.toggle('on', on));
    if (tBar) tBar.classList.toggle('active', on);
    if (sTxt) sTxt.textContent = on ? 'MICROPHONE ON — LISTENING' : 'MICROPHONE OFF';
    if (tTxt) tTxt.textContent = on ? 'Listening… speak now' : 'Microphone is off. Tap the mic to start.';
    if (btn) btn.title = on ? 'Click to stop microphone' : 'Click to start listening';
}

/* ─────────────────────────────────────────────────────────
   SPEECH RECOGNITION — built ONCE, reused forever.
   FIX: No abort/restart = no repeated permission prompts.
───────────────────────────────────────────────────────── */
let recognition = null;
// isListening and isSpeaking are declared at top of file
let restartTimer = null;
let micStream = null;
let permissionState = 'unknown'; // Track permission state to prevent repeated prompts
let permissionCachedStream = null; // Cache the audio stream to reuse

// ═══════════════════════════════════════════════════════════
// PERMISSION PERSISTENCE — Store decision in localStorage
// ═══════════════════════════════════════════════════════════
function getStoredPermissionState() {
    try {
        const stored = localStorage.getItem('micPermissionState');
        return stored || 'unknown';
    } catch (_) { return 'unknown'; }
}

function setStoredPermissionState(state) {
    try {
        localStorage.setItem('micPermissionState', state);
        permissionState = state;
    } catch (_) { }
}

function buildRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = settingsState.lang || CONFIG.DEFAULT_LANG || 'en-IN';
    r.continuous = false; // ── FIX: 'false' is MUCH more stable than 'true' (auto-restarts in onend)
    r.interimResults = true;
    r.maxAlternatives = 1;   // FIX: 1 is faster — no need to rank alternatives

    // ③ WATCHDOG — detects when recognition session dies silently
    // Fires every 8 seconds. If mic is ON but recognition has stopped,
    // it auto-restarts WITHOUT asking for permission (reuses same object).
    let lastResultTime = Date.now();
    let watchdogTimer = null;

    // ═══════════════════════════════════════════════════════
    //   STOP-WORDS that ALWAYS break through, even while speaking
    // ═══════════════════════════════════════════════════════
    const STOP_WORDS = /\b(stop|shut up|be quiet|silence|enough|stop talking)\b/i;

    // ═══════════════════════════════════════════════════════
    //   2-SECOND SILENCE DETECTION (Gemini Live Style)
    //   Waits 2 seconds after user stops speaking before processing
    // ═══════════════════════════════════════════════════════
    let silenceTimer = null;
    let lastFinalText = '';

    function processFinalResponse(text) {
        clearTimeout(silenceTimer);
        lastFinalText = '';
        const corrected = correctSpeech(text.trim());
        const tTxt = document.getElementById('transcriptText');
        if (tTxt) tTxt.textContent = '✅ ' + corrected;
        showCommandReaction();
        handleCommand(corrected);

        // Gemini Live vs Legacy: Handle auto-stop logic
        if (settingsState.autoStop && !settingsState.autoListen) {
            setTimeout(() => { if (!isSpeaking) stopMic(); }, 2500);
        }
        setTimeout(() => { if (isListening && !isSpeaking) tTxt.textContent = 'Listening… speak now'; }, 2000);
    }

    r.onresult = (e) => {
        lastResultTime = Date.now(); // reset watchdog on any activity

        let interim = '', finalTxt = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i][0].transcript;
            e.results[i].isFinal ? (finalTxt += t) : (interim += t);
        }

        // ★ STOP command breaks through even while speaking
        if (isSpeaking) {
            const combined = (finalTxt + ' ' + interim).trim().toLowerCase();
            if (STOP_WORDS.test(combined)) {
                // Force-stop immediately
                window.speechSynthesis.cancel();
                clearTimeout(speakSafetyTimer);
                clearInterval(synthKeepAlive);
                isSpeaking = false;
                closeYTModal();
                const badge = document.getElementById('speakingBadge');
                if (badge) badge.classList.remove('show');
                const box = document.getElementById('aiSpeechBox');
                if (box) box.classList.remove('speaking');
                const tTxt = document.getElementById('transcriptText');
                if (tTxt) tTxt.textContent = 'Listening… speak now';
                addLog('stop', '🔇 Stopped', 'ok');
                return;
            }
            // Not a stop word → silently ignore (mic hears itself)
            const tTxt = document.getElementById('transcriptText');
            if (tTxt) tTxt.textContent = '🔇 Assistant is speaking…';
            return;
        }

        const tTxt = document.getElementById('transcriptText');
        if (interim) tTxt.textContent = '🔵 ' + interim;
        
        // ★ IMPROVED: 2-SECOND SILENCE DETECTION
        // When user finishes speaking (finalTxt received), wait 2 seconds
        // If no more results come in, process the recognized text
        if (finalTxt.trim()) {
            lastFinalText = finalTxt.trim();
            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                if (lastFinalText && isListening && !isSpeaking) {
                    processFinalResponse(lastFinalText);
                }
            }, 2000); // Wait 2 seconds after user stops speaking
        }
    };

    function startWatchdog() {
        clearInterval(watchdogTimer);
        watchdogTimer = setInterval(() => {
            if (!isListening || isSpeaking) return;
            const silence = Date.now() - lastResultTime;

            // If recognition went quiet for >12s, force-restart
            if (silence > 12000) {
                console.warn('[RS] Watchdog: no activity for', Math.round(silence / 1000), 's — restarting');
                lastResultTime = Date.now();
                // Show visual pulse so user knows mic is recovering
                const tTxt = document.getElementById('transcriptText');
                if (tTxt) tTxt.textContent = '🔄 Reconnecting mic…';
                try { r.abort(); } catch (_) { }
                // Directly restart after a short delay (don't rely only on onend)
                setTimeout(() => {
                    if (!isListening) return;
                    try { r.start(); } catch (_) { }
                    if (tTxt) setTimeout(() => tTxt.textContent = 'Listening… speak now', 800);
                }, 300);
            }
            // Visual heartbeat every 5s so user knows mic is alive
            else if (silence > 5000) {
                const tTxt = document.getElementById('transcriptText');
                if (tTxt && tTxt.textContent === 'Listening… speak now') {
                    tTxt.textContent = '🎤 Still listening…';
                    setTimeout(() => { if (tTxt && isListening && !isSpeaking) tTxt.textContent = 'Listening… speak now'; }, 1500);
                }
            }
        }, 5000);
    }

    r.onstart = () => {
        setMicUI(true);
        lastResultTime = Date.now();
        startWatchdog();
    };

    r.onerror = (e) => {
        if (e.error === 'no-speech' || e.error === 'aborted') return;
        if (e.error === 'not-allowed') {
            // ★ FIX: Only alert ONCE per session to prevent repeated permission prompts
            if (permissionState !== 'denied') {
                permissionState = 'denied';
                showToast('🔒', 'Microphone permission denied', 'fail', 3000);
                console.warn('[RS] Microphone permission denied. User must allow in browser settings.');
            }
            stopMic(); return;
        }
        const tTxt = document.getElementById('transcriptText');
        if (tTxt) tTxt.textContent = '⚠️ Mic error (' + e.error + ')…';
    };

    r.onend = () => {
        if (!isListening) return;
        // Auto-restart silently — same object, no new permission prompt
        clearTimeout(restartTimer);
        restartTimer = setTimeout(() => {
            if (!isListening) return;
            try { r.start(); } catch (_) { }
        }, 250);
    };

    return r;
}

function stopMic() {
    isListening = false;
    clearTimeout(restartTimer);
    if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        try { recognition.abort(); } catch (_) { }
    }
    // ★ CRITICAL: Keep cached stream alive for next use
    // Only stop temporary stream references, NOT the cached one
    if (micStream && micStream !== permissionCachedStream) {
        try {
            micStream.getTracks().forEach(t => {
                console.log('[RS] Stopping temporary track:', t.kind);
                t.stop();
            });
        } catch (_) { }
    } else if (micStream && micStream === permissionCachedStream) {
        // Keep cached stream, just mark as listening=false
        console.log('[RS] Keeping cached stream active for next use');
    }
    micStream = null;
    setMicUI(false);
}

function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition is not supported.\nPlease use Google Chrome or Edge.'); return; }

    if (isListening) {
        stopMic();
    } else {
        // ★ PRIORITY 1: Use cached stream if available and valid
        if (permissionCachedStream && isStreamActive(permissionCachedStream)) {
            startMicWithStream(permissionCachedStream);
            return;
        }

        // ★ PRIORITY 2: Check if we have permission stored
        const storedState = getStoredPermissionState();
        if (storedState === 'granted') {
            // Try to get a fresh stream (browser won't ask again)
            startMicDirect();
            return;
        }

        if (storedState === 'denied') {
            showToast('🔒', 'Microphone permission denied. Change in browser settings.', 'fail', 4000);
            return;
        }

        // ★ PRIORITY 3: Ask permission the first time
        startMicDirect();
    }
}

function isStreamActive(stream) {
    // Check if stream is still active (not stopped)
    if (!stream) return false;
    try {
        return stream.active && stream.getTracks().length > 0 && stream.getTracks()[0].enabled;
    } catch (_) {
        return false;
    }
}

function startMic() {
    if (!isListening) {
        toggleMic();
    }
}

function startMicWithStream(stream) {
    // ★ NEW: Use existing stream directly (no permission prompt)
    try {
        micStream = stream;
        permissionState = 'granted';
        isListening = true;
        setMicUI(true);
        if (!recognition) recognition = buildRecognition();
        try { recognition.start(); }
        catch (err) { showToast('❌', 'Could not start mic: ' + err.message, 'fail', 2500); stopMic(); }
    } catch (err) {
        console.warn('[RS] Stream error:', err);
        startMicDirect();
    }
}

function startMicDirect() {
    // ★ ENHANCED: Get fresh stream and cache it intelligently
    const audioConstraints = {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
        }
    };

    console.log('[RS] Requesting microphone access...');
    
    navigator.mediaDevices.getUserMedia(audioConstraints)
        .then(stream => {
            console.log('[RS] ✅ Microphone access granted! Caching stream...');
            
            // Cache the stream for reuse (no permission prompt on next use)
            permissionCachedStream = stream;
            micStream = stream;
            setStoredPermissionState('granted');
            permissionState = 'granted';
            isListening = true;
            
            // Keep tracks enabled
            stream.getTracks().forEach(track => {
                track.enabled = true;
                console.log('[RS] Track enabled:', track.kind);
            });
            
            setMicUI(true);
            if (!recognition) recognition = buildRecognition();
            try { 
                recognition.start(); 
                console.log('[RS] Speech recognition started');
            }
            catch (err) { 
                console.error('[RS] Recognition start error:', err);
                showToast('❌', 'Could not start voice recognition: ' + err.message, 'fail', 2500); 
                stopMic(); 
            }
        })
        .catch(err => {
            console.error('[RS] ❌ Microphone error:', err.name, err.message);
            
            setStoredPermissionState('denied');
            permissionState = 'denied';
            
            const msg = err.name === 'NotAllowedError' 
                ? 'Permission denied. Use "Allow while visiting the site" in Chrome.' 
                : err.name === 'NotFoundError'
                ? 'No microphone found. Check your device.'
                : err.name === 'NotReadableError'
                ? 'Microphone is already in use by another app.'
                : err.message;
            
            showToast('🔒', msg, 'fail', 4000);
        });
}

/* ─────────────────────────────────────────────────────────
   SETTINGS
───────────────────────────────────────────────────────── */
let settingsState = {
    name: CONFIG.ASSISTANT_NAME || 'RS Assistant',
    lang: CONFIG.DEFAULT_LANG || 'en-IN',
    sfx: true,
    autoStop: false,
    autoListen: false,
    volume: CONFIG.DEFAULT_VOLUME || 1.0,
    rateBoost: CONFIG.DEFAULT_RATE || 1.0,
    accent: '#b44fff',
    accentRgb: '180,79,255',
};

function openSettings() {
    document.getElementById('settingsDrawer').classList.add('open');
    document.getElementById('settingsOverlay').classList.add('open');
}
function closeSettings() {
    document.getElementById('settingsDrawer').classList.remove('open');
    document.getElementById('settingsOverlay').classList.remove('open');
}

function saveSettings() {
    settingsState.name = document.getElementById('setName').value.trim() || CONFIG.ASSISTANT_NAME;
    settingsState.lang = document.getElementById('setLang').value;
    settingsState.sfx = document.getElementById('setSfx').checked;
    settingsState.autoStop = document.getElementById('setAutoStop').checked;
    settingsState.autoListen = document.getElementById('setAutoListen').checked;
    settingsState.volume = parseFloat(document.getElementById('setVolume').value);
    settingsState.rateBoost = parseFloat(document.getElementById('setRate').value);
    const logoEl = document.querySelector('.logo-text');
    if (logoEl) logoEl.textContent = settingsState.name;
    if (recognition) recognition.lang = settingsState.lang;
    closeSettings();
    speak('Settings saved! I am now ' + settingsState.name + '.');
    addLog('Settings saved', '⚙️ Name: ' + settingsState.name, 'ok');
}

function setTheme(hex, rgb) {
    document.documentElement.style.setProperty('--p1', hex);
    settingsState.accent = hex;
    settingsState.accentRgb = rgb;
    document.querySelectorAll('.sd-swatch').forEach(s => s.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById('micBtn').style.background =
        `radial-gradient(circle at 36% 28%, rgba(255,255,255,0.32) 0%, transparent 52%),
         radial-gradient(circle, ${hex} 0%, #3b0764 100%)`;
}
