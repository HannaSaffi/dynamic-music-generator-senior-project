# 🎵 Dynamic Music Generator
### *Your conversation, transformed into music*

> A full-stack web application that detects emotions from real-time speech and plays contextually appropriate music — automatically, intelligently, in real time.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb)
![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=flat&logo=python)
![PyTorch](https://img.shields.io/badge/PyTorch-2.1-EE4C2C?style=flat&logo=pytorch)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Context Modes](#context-modes)
- [Quick Start](#quick-start)
- [Key Metrics](#key-metrics)
- [Team](#team)

---

## 🎯 Overview

Dynamic Music Generator is a senior capstone project built at Trinity College. It listens to your speech in real time, analyzes the emotional tone of your words using a custom NLP engine, and plays music that matches your mood — all without any user input beyond talking.

The system supports five distinct **context modes**, each with its own color theme, music library, and emotional response profile — from casual conversation to full D&D adventure sessions.

---

## ✨ Features

### 🎤 Real-Time Speech Capture
- Browser-native transcription via the **Web Speech API** — no external API calls
- Continuous transcription as the user speaks
- Zero setup required for the end user

### 🧠 Emotion Detection
- Custom **keyword-based NLP engine** built from scratch
- Emotion lexicons with negation handling (e.g. *"not happy"* → not joy)
- Confidence scoring across **6 emotion categories**: Joy, Sadness, Anger, Fear, Surprise, Disgust
- Dominant emotion calculated from accumulated speech history — not just the latest snippet

### 🎵 Adaptive Music Playback
- Music changes automatically based on detected emotion and active context mode
- Smooth fade out/fade in between tracks
- Intro song plays when switching modes
- Music waits for speech before starting, staying in sync with the conversation

### 📊 Live Emotion Visualizer
- Real-time Recharts bar chart showing emotional distribution as you speak
- Updates continuously as new speech is detected

### 🤖 AI Music Generation
- Integrated **Meta's MusicGen** model via AudioCraft
- Runs on Trinity's remote GPU server (NVIDIA RTX 4090)
- Generates music dynamically based on emotion + context mode as input prompts
- Flask API bridges the React frontend to the MusicGen backend

### 🎭 5 Context Modes
Each mode has a unique color theme, music library, and emotional profile. See [Context Modes](#context-modes) below.

---

## ⚙️ How It Works

```
User speaks → Web Speech API → Emotion Engine → Music Selection/Generation
   🎤              📝                🧠                    🎵
```

| Step | Component | Description |
|------|-----------|-------------|
| 1 | Web Speech API | Browser-native voice-to-text, continuous transcription |
| 2 | Keyword NLP Engine | Detects emotion from transcribed text with confidence scoring |
| 3 | AudioCraft / MusicGen | AI-generated music based on emotion + mode (GPU server) |
| 4 | Library Selection | Emotion-matched pre-saved tracks as complement to AI generation |

---

## 🏗️ Architecture

```
React Frontend
      │
      ├── Web Speech API (real-time transcription)
      ├── Keyword NLP Engine (emotion detection)
      ├── Recharts (live emotion visualizer)
      └── HTML5 Audio (music playback)
      │
      ↓ REST API (JWT Auth)
Node.js / Express Backend
      │
      ├── MongoDB Atlas (users, sessions, songs)
      └── Flask API → MusicGen / AudioCraft
                        (maple.cs.trincoll.edu — RTX 4090)
```

### Frontend
- Component-based React architecture separating speech, emotion, audio, and visualization logic
- Dynamic re-rendering on emotion changes
- Mode-based theming that recolors the entire UI on context switch
- Audio organized in a mode+emotion folder hierarchy: `public/audio/{mode}/{emotion}/`

### Backend
- Node.js/Express REST API with JWT authentication
- MongoDB Atlas for user management, song storage, and D&D session tracking
- Emotion-based song matching at the API level

### AI Layer
- Python 3.11 conda environment (`musicgen311`) on maple.cs.trincoll.edu
- PyTorch 2.1.0 with CUDA 12.1
- Flask server bridges the React frontend to MusicGen inference
- Jupyter-based model interface for development and testing

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | Component-based UI, real-time state management |
| Web Speech API | Browser-native speech transcription |
| Recharts | Live emotion distribution chart |
| HTML5 Audio | Adaptive music playback |
| Custom NLP Engine | Keyword-based emotion detection |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| MongoDB Atlas | Database (users, songs, sessions) |
| JWT | Authentication |
| Flask (Python) | Bridge to MusicGen AI model |

### AI / Music Generation
| Technology | Purpose |
|-----------|---------|
| Meta MusicGen | AI music generation model |
| AudioCraft | MusicGen framework |
| PyTorch 2.1 + CUDA 12.1 | GPU inference |
| NVIDIA RTX 4090 | Hardware (maple.cs.trincoll.edu) |

---

## 🎭 Context Modes

| Mode | Theme Color | Use Case |
|------|------------|----------|
| 🗣️ Casual Conversation | Purple | Everyday use, default mode |
| 🧘 Meditation | Blue | Calm, focused sessions |
| 💬 Therapy | Soft Purple | Emotional support contexts |
| 🎲 Board Games | Orange/Red | Fun, competitive energy |
| ⚔️ D&D Adventure | Deep Red | Tabletop RPG sessions |

Each mode has its own:
- Color-themed UI
- Music library organized by emotion
- Intro song on mode selection
- Emotional response profile

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Python 3.11 (for AI generation)
- SSH access to maple.cs.trincoll.edu (Trinity students only)

### Frontend + Backend
```bash
git clone https://github.com/your-repo/dynamic-music-generator-senior-project.git
cd dynamic-music-generator-senior-project

# Install dependencies
cd client && npm install
cd ../server && npm install

# Set up environment variables
cp .env.example .env
# Add your MongoDB URI and JWT secret

# Run both
npm run dev
```

### AI Music Generation (maple server)
```bash
# SSH into maple
ssh username@maple.cs.trincoll.edu

# Activate conda environment
conda activate musicgen311

# Start Flask server
cd ~/dynamic-music-generator/audioCraft
python app.py
```

---

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| Emotion categories | 6 (Joy, Sadness, Anger, Fear, Surprise, Disgust) |
| Context modes | 5 |
| NLP approach | Custom keyword engine (no external ML dependencies) |
| Audio folder structure | `{mode}/{emotion}/` hierarchy |
| GPU used for AI generation | NVIDIA RTX 4090 |
| API endpoints | REST (JWT-authenticated) |
| Database | MongoDB Atlas |

---

## 👥 Team

**Hanna Saffi** — Frontend, Emotion Detection, Flask/AI Integration, Full-Stack Implementation

**Aleem Shazif** — UI/UX Design, Music Track Sourcing, AI Music Generation Research

---

## 📚 Course Information

- **Course:** Senior Capstone Project
- **Institution:** Trinity College, Hartford CT
- **Stack:** React · Node.js · MongoDB · Python · Flask · MusicGen · AudioCraft

---

*Built with 🎵 and a lot of debugging at Trinity College*
