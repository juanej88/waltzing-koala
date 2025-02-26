'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  const spotifyLogin = async () => {
    try {
      const res = await fetch('/api/spotify/login');
      const data = await res.json();

      if (data.authUrl) {
        window.location.href = data.authUrl; // Redirect user to Spofify login
      } else {
        console.error('Error generating Spotify auth URL');
      }
    } catch (error) {
      console.error('Failed to fetch Spotify auth URL:', error);
    }
  };

  const exchangeCodeForToken = async (code: string) => {
    try {
      const res = await fetch(`/api/spotify/login?code=${code}`);
      const data = await res.json();

      if (data.access_token) {
        console.log(data);
        setAccessToken(data.access_token);
        localStorage.setItem('spotify_token', data.access_token); // Store token for later use
        window.history.replaceState({}, document.title, "/"); // Clean URL
      } else {
        console.error("Failed to retrieve access token", data);
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);
  
  return (
    <>
      <h1>Waltzing Koala</h1>
      <button onClick={spotifyLogin}>Spotify Login</button>
    </>
  );
}
