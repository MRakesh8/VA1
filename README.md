# RS Voice Assistant - Setup & Documentation

## 📋 Project Overview

**RS Voice Assistant** is a Google Gemini & Siri-inspired voice AI specifically designed for **Sree Sakthi Engineering College (SSEC)**. It responds to voice commands and automatically:
- Answers college-related questions
- Controls screen (fullscreen, scroll, YouTube close)
- Sends WhatsApp messages
- Opens college portals
- Provides general information (weather, news, etc.)
- Responds after 2-second silence (like Gemini Live)

---

## 🚀 QUICK START

### 1. **Get a Free Gemini API Key**
- Go to: https://aistudio.google.com/apikey
- Click "Create API Key"
- Copy the key

### 2. **Update `config.js`**
```javascript
AI_API_KEY: '[Paste_Your_API_Key_Here]'
```

### 3. **Open in Browser**
- Double-click `index.html` or drag to Chrome
- **Allow microphone permission** when asked
- Click the mic button to start

### 4. **Try a Command**
Say: **"Who is the principal?"**

---

## 📁 File Structure

```
college-data.js    ← College information (edit this to add your data)
config.js         ← Settings & API key (edit this)
index.html        ← Main interface (don't edit unless you know HTML)
script.js         ← All logic (don't edit unless you know JavaScript)
style.css         ← Styling (you can edit colors/fonts)
FEATURES_GUIDE.md ← Complete features documentation (READ THIS!)
README.md         ← This file
```

---

## ⚙️ CONFIGURATION

### Update College Information
Edit `college-data.js` and inside the COLLEGE_DATA backticks, add:
```
NEW SECTION NAME:
Your information here.
More details.

ANOTHER SECTION:
Additional info.
```

### Update College Keywords
In `college-data.js`, update `COLLEGE_KEYWORDS` array if you add new sections.

### Change Settings
Edit `config.js`:
```javascript
AI_API_KEY: '[Your_Key]'                    // Gemini API key
ASSISTANT_NAME: 'Your Name'                 // Assistant's name
COLLEGE_NAME: 'Your Institution'            // College abbreviation
COLLEGE_FULL: 'Full College Name'           // Full name
COLLEGE_WEBSITE: 'https://your-site.com'   // College website
DEFAULT_VOLUME: 1.0                         // Voice volume (0.1-1.0)
DEFAULT_RATE: 1.0                          // Speech speed (0.5-2.0)
DEFAULT_LANG: 'en-IN'                      // Language (en-IN, en-US, ta-IN)
```

---

## 🎙️ KEY FEATURES

### ✅ Fixed Issues
- ✓ **No repeated permission prompts** - Permission only asked once
- ✓ **2-second silence detection** - Waits for complete sentences
- ✓ **Natural responses** - Gemini-like conversational style
- ✓ **Auto-close YouTube** - "Close YouTube" command works
- ✓ **Send WhatsApp messages** - "Send message to [name] '[text]'"

### 🎯 Smart Capabilities
- **College Q&A**: 100+ pre-configured answers about SSEC
- **AI Learning**: Unknown questions sent to Gemini AI
- **Screen Control**: Fullscreen, scroll, YouTube close
- **Automation**: Portal access, fee checks, results
- **Timing**: 2-second wait ensures natural conversation

### 🗣️ Voice Commands (50+)
```
College: "Who is the principal?" "Departments?" "Placement info?"
Automation: "Close YouTube" "Send WhatsApp to mom 'Hello'"
Search: "Google Python tutorial"
Entertainment: "Play music" "Tell a joke" "Weather?"
Utilities: "Set timer" "Remind me" "Calculate 5+3"
```

---

## 🔊 VOICE PROFILES

Choose from 4 AI voices:
1. **ARIA** - Calm, feminine (Default)
2. **ZEUS** - Deep, masculine
3. **NEO** - Fast, energetic
4. **NOVA** - Bright, friendly

Change in settings panel (gear icon)

---

## 🌐 BROWSER SUPPORT

| Browser | Status |
|---------|--------|
| Chrome  | ✅ Recommended |
| Edge    | ✅ Works |
| Firefox | ⚠️ Limited |
| Safari  | ⚠️ Limited |

**Important**: Google Chrome provides the best experience with SpeechRecognition API.

---

## 🔐 PERMISSIONS

The assistant asks for:

1. **Microphone** (Required)
   - Click "Allow" to enable voice input
   - Check browser settings if denied

2. **Location** (Optional, for weather)
   - Click "Allow" to get local weather
   - Not required for other features

3. **Notifications** (Optional, for alarms/reminders)
   - Helps receive popup notifications

---

## 🛠️ TROUBLESHOOTING

### "Microphone not found"
- Check if mic is connected/working
- Refresh browser page
- Try different browser (Chrome preferred)
- Check browser permissions:
  - Chrome → Settings → Privacy →Site Settings → Microphone

### "Assistant not responding"
- Check internet connection
- Verify API key in `config.js`
- Try simpler command first
- Clear browser cache (Ctrl+Shift+Del)

### "Weird or wrong answers"
- Speak clearly without background noise
- Use specific words ("CSE" not "Computer Science")
- Try again - it learns from repetition
- Report to developer for improvement

### "Permission keeps asking"
- ✅ **FIXED in v1.5** - Now only asks once per session
- If still happening, try incognito/private mode

---

## 📊 PERFORMANCE TIPS

### For Better Voice Recognition
- 🎙️ Use **good quality microphone**
- 🔇 Minimize **background noise**
- 🗣️ Speak **clearly and naturally**
- ⏱️ Wait for **2-second silence** after speaking
- 📍 Use **specific words** (e.g., "SSEC" not "the college")

### For Better AI Responses
- ✍️ Ask **specific questions** not vague ones
- 🎯 Use **college terminology** for relevant context
- 📚 Ensure API **key is valid** for Gemini
- 🌐 Check **internet connection** is stable

---

## 🔄 WHAT'S NEW (v1.5)

✨ **Major Updates**:
- ✅ Fixed repeated permission prompts
- ✅ 2-second silence detection (Gemini Live style)
- ✅ Auto-close YouTube functionality
- ✅ Enhanced WhatsApp messaging
- ✅ College portal shortcuts
- ✅ Better Gemini-like responses
- ✅ Improved system prompts

---

## 📚 COLLEGE DATA MANAGEMENT

### Adding New Information

**In `college-data.js`**, inside the COLLEGE_DATA section:

```javascript
const COLLEGE_DATA = `
EXISTING DATA...

NEW SECTION TITLE:
First detail about it.
Second detail here.
More information.

ANOTHER NEW SECTION:
Your content here.
`;
```

### Adding New Keywords

In `COLLEGE_KEYWORDS` array:
```javascript
const COLLEGE_KEYWORDS = [
    'existing', 'keywords', 'your', 'new', 'keywords', 'here'
];
```

---

## 🎨 CUSTOMIZATION

### Change Colors
Edit `style.css`:
```css
--p1: #b44fff;        /* Primary accent color */
--p1-rgb: 180,79,255; /* RGB version */
```

### Change Fonts
Edit `style.css` or modify Google Fonts import in `index.html`.

### Change UI Text
Edit strings in `script.js` (search for `speak()` calls).

---

## 📱 MOBILE OPTIMIZATION

The assistant works on mobile but:
- 📵 Voice recognition works better on **Chrome Mobile**
- 🔊 Ensure **speakers are on**
- 🎙️ Grant **microphone permission**
- 📡 Use **strong WiFi** for AI responses

---

## 🔗 API DOCUMENTATION

### Gemini API
- **Free Tier**: 60 requests/minute
- **Pricing**: free-tier included, paid plan available
- **Get Key**: https://aistudio.google.com/apikey
- **Docs**: https://ai.google.dev/

### Open-Meteo Weather API
- **Free**: No authentication needed
- **Docs**: https://open-meteo.com/
- Used for weather information

### Wikipedia API
- **Free**: No key needed
- Used for general knowledge fallback

---

## 👨‍💻 DEVELOPER INFO

**Created by**: Rakesh  
**For**: Sree Sakthi Engineering College (SSEC)  
**Version**: 1.5  
**Last Updated**: February 2026  

### Technologies Used
- HTML5
- Vanilla JavaScript (ES6+)
- Web Speech API
- Google Gemini API
- CSS3 with animations

---

## 💡 ADVANCED USAGE

### For Developers

Enable debug mode in browser console:
```javascript
console.log('[RS] Debug mode enabled');
// All actions will be logged to console
```

### For Educators
- Use in classroom for tech demonstrations
- Show how AI is integrated with voice
- Demonstrate voice recognition accuracy
- Teach about college information systems

### For Admissions

Pre-populate with FAQs:
```
"What's the admission process?"
"How do I apply?"
"What documents are needed?"
"What's the fee structure?"
```

---

## 📞 SUPPORT

**Issue? Try this**:
1. Check FEATURES_GUIDE.md for command syntax
2. Verify API key is correct
3. Try in Chrome browser
4. Clear cache and reload
5. Check console for errors (F12)
6. Contact developer: Rakesh

---

## 📄 LICENSE

This project is created for Sree Sakthi Engineering College. 
Usage restricted to authorized personnel and students.

---

## 🙏 ACKNOWLEDGMENTS

- Google Gemini API for AI responses
- Web Speech API for voice recognition
- Sree Sakthi Group for support

---

**Ready to talk?** 🎙️ Click the microphone button and start asking!
