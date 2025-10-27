# 🎤 Dynamic Music Generator - Senior Project

A voice-controlled music generation system for D&D gameplay that uses real-time speech recognition to detect keywords and generate appropriate background music.

## 📊 Project Status

**Current Phase:** 1 of 8 - Voice Transcription ✅  
**Progress:** ~12%  
**Last Updated:** October 2025

## 👥 Team

- **Hanna Saffi** - Voice Recognition & Logic
- **Aleem** - UI/UX & Styling

## 🚀 Quick Start
```bash
# Clone the repository
git clone git@github.com:HannaSaffi/Dynamic-Music-Generator---Senior-Project.git

# Navigate to project
cd Dynamic-Music-Generator---Senior-Project

# Install dependencies
npm install

# Start development server
npm start
```

Open http://localhost:3000 and click "Start Recording"

## ✨ Phase 1 Features

- ✅ Real-time voice transcription
- ✅ Visual recording indicator
- ✅ Interim and final results display
- ✅ Browser compatibility checking
- ✅ Privacy-focused (local processing only)
- ✅ Responsive design for all devices

## 🛠️ Tech Stack

- React 18
- Web Speech API
- CSS3 Animations
- React Hooks (Custom hooks for transcription)

## 📋 Project Phases

1. ✅ **Voice Transcription** - Real-time speech-to-text
2. 🔜 **Keyword Detection** - Extract D&D scene keywords
3. ⏳ **Music API Integration** - Connect to music generation service
4. ⏳ **Audio Mixing** - Smooth transitions and layering
5. ⏳ **Backend & WebSockets** - Real-time multiplayer support
6. ⏳ **UI/UX Enhancement** - Full interface design
7. ⏳ **Testing & Optimization** - Performance tuning
8. ⏳ **Deployment** - Production release

## 🎯 Goals

Create an immersive D&D experience where:
- DM's speech is transcribed in real-time
- Keywords trigger appropriate music (combat, tavern, dungeon, etc.)
- Music adapts dynamically to gameplay
- Multiple players can connect simultaneously

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full Support |
| Edge    | ✅ Full Support |
| Safari  | ✅ Full Support |
| Firefox | ⚠️ Limited Support |

## 📁 Project Structure
```
Dynamic-Music-Generator---Senior-Project/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── VoiceTranscriber.js    # Voice recognition hook
│   ├── App.js                      # Main component
│   ├── App.css                     # Styles
│   └── index.js                    # Entry point
├── package.json
└── README.md
```

## 🤝 Contributing

### For Team Members:

1. Always work on your own branch
2. Pull latest changes before starting work
3. Commit frequently with clear messages
4. Test before pushing
```bash
# Create your branch
git checkout -b your-name-feature

# Make changes, then:
git add .
git commit -m "Clear description of what you did"
git push -u origin your-name-feature
```

## 📝 License

Educational project for senior thesis.

## 👤 Authors

- Hanna Saffi
- Aleem

## 🙏 Acknowledgments

- Adviser: [Your Adviser's Name]
- Course: [Course Name/Number]
- Institution: [Your University]