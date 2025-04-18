# Waltzing Koala

Waltzing Koala is a personal wedding project turned tech showcase. It’s an announcement and music management app designed to blend special moments into Spotify playlists without needing a DJ or MC. Whether it’s a heartfelt toast, a fun story, or a schedule update, announcements play smoothly alongside music using pre-recorded audio, ChatGPT's text-to-speech, or live mic input. The app integrates with the Spotify Web API for playback control and elegant volume fading.

## Features

- **Pre-recorded Announcements**: Users can play pre-recorded messages that fade out the music volume to a background level for a smooth listening experience.
- **Live Announcements**: Allows live microphone announcements with adjustable volume fading (quick or long fade options).
- **ChatGPT TTS Announcements**: Generate announcements using ChatGPT's text-to-speech and play them seamlessly.
- **Spotify Integration**: Control Spotify playback, including basic commands (play, pause, next, previous), and fetch song metadata.
- **Automatic Playlist Resumption**: Announcements play over the currently playing song, and once completed, the next song in the playlist resumes naturally.
- **Custom Storytelling Mode**: Ability to synchronise a pre-recorded story with a matching song duration for special moments (e.g., weddings, speeches).

## Technologies Used

### Frontend
- **Next.js** (React framework)
- **TypeScript** (for type safety)
- **Tailwind CSS** (for styling)
- **Spotify Web API** (for music playback and controls)

### Backend (Future Implementation)
- **Django REST Framework** (for API endpoints)
- **MySQL** (for storing audio files and Spotify metadata)
- **ChatGPT API** (for TTS-generated announcements)

## Project Status
This project was created for my wedding in March 2025, where I wanted a custom solution for music and announcements without relying on a DJ or MC. The frontend is fully functional, and the backend is currently hardcoded but will be refactored with Django REST Framework and MySQL. Future updates will include:

- Full backend implementation with Django
- User authentication and settings for personalised announcements
- Improved UI/UX design with styled components
- Cloud storage integration for storing audio files
- Advanced scheduling and automation of announcements

## How It Works
1. Connect your Spotify account.
2. Choose between a pre-recorded announcement, a ChatGPT TTS-generated announcement, or a live microphone announcement.
3. When an announcement plays:
  - Music fades out (quick fade for short announcements, long fade for extended messages).
  - For pre-recorded messages, background music remains at a lower volume.
  - Once the announcement ends, the playlist resumes from the next track.
4. Enjoy seamless music and announcements without needing a DJ or MC.

## Why "Waltzing Koala"?
Waltzing Koala was created for my own wedding, during a time when my wife and I were on a tight budget, but I didn’t want to lose the heart and soul that a DJ or MC brings to a celebration. I needed a creative, meaningful solution to handle announcements, storytelling, and music transitions with both elegance and personality. The name reflects that spirit: something charming, unexpected, and uniquely delightful, just like a koala waltzing.

## Installation & Setup (Coming Soon)

Since the backend is not yet implemented, the frontend can be run locally with:

```sh
npm install
npm run dev
```

Stay tuned for backend implementation and further refinements!

---

### Author
[Juan Espinosa Jorrin](https://juanespinosa.net)
