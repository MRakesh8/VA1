/* ═══════════════════════════════════════════════════════
   RS VOICE ASSISTANT — CONFIG FILE
   ✏️  Edit ONLY this file to customise your assistant.
   No other file needs to be touched for basic changes.
═══════════════════════════════════════════════════════ */

const CONFIG = {

   /* ── 1. AI ASSISTANT ─────────────────────────────────────
      Get a FREE key at: https://aistudio.google.com/apikey
      Steps:
        1. Go to the link above and sign in with Google
        2. Click "Create API Key" → Copy the key
        3. Paste it below between the quotes             */
   AI_API_KEY: '[AIzaSyACEFM9QRur47LA-OaNCCOCQZvsani3NnM]',

   /* AI model to use. Options:
      'gemini-1.5-flash'       → fast, reliable  ✅ (recommended)
      'gemini-2.0-flash-lite'  → newer, faster   ✅              */
   AI_MODEL: 'gemini-1.5-flash',

   /* ── 2. ASSISTANT IDENTITY ────────────────────────────*/
   ASSISTANT_NAME: 'RS Assistant',
   COLLEGE_NAME: 'SSEC',          // Shows in topbar logo
   COLLEGE_FULL: 'Sree Sakthi Engineering College',

   /* ── 3. PHONE NUMBERS ────────────────────────────────*/
   AMMA_PHONE: '00000',         // "call amma" command

   /* ── 4. DEFAULT VOICE SETTINGS ───────────────────────*/
   DEFAULT_VOLUME: 1.0,             // 0.1 – 1.0
   DEFAULT_RATE: 1.0,             // 0.5 – 2.0  (speech speed)
   DEFAULT_LANG: 'en-IN',         // Speech recognition language

   /* ── 5. COLLEGE WEBSITE ────────────────────────────────
      Paste your college website URL below.
      The assistant will automatically fetch and read
      information from this website to answer questions.
      Leave blank ('') if you don't want this.           */
   COLLEGE_WEBSITE: 'https://sreesakthi.edu.in/',

   /* ── 6. BEHAVIOUR ────────────────────────────────────*/
   MIC_RESUME_DELAY_MS: 400,        // ms to wait after speaking before mic resumes
};
