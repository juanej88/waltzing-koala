# Waltzing Koala

Waltzing Koala is an announcement and music management app designed to seamlessly blend announcements into a Spotify playlist. Users can pre-record announcements, generate them using ChatGPT's text-to-speech (TTS) capabilities, or make live announcements using a microphone. The app ensures a smooth transition between announcements and music by integrating with the Spotify Web API to control playback and volume fading.

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
This project was initially built for a wedding event, focusing on core functionality rather than styling. The backend is currently hardcoded but will be refactored using Django REST Framework and MySQL for scalability. Future updates will include:

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
This project was built for a wedding where no DJ or MC was present, ensuring smooth announcements without interrupting the event's flow. The name "Waltzing Koala" reflects the elegant and unexpected charm it brings—just like a koala waltzing!

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