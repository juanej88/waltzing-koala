'use client';

import { useEffect, useState } from 'react';
import Player from '@/app/ui/Player';
import Microphone from '@/app/ui/Microphone';
import { cinzel_decorative } from './ui/fonts';

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
        const expirationTime = Date.now() + (Number(data.expires_in) * 1000);

        // Store tokens and expiration date
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
        localStorage.setItem('spotify_expiration_time', expirationTime.toString());

        window.history.replaceState({}, document.title, "/"); // Clean URL
      } else {
        console.error("Failed to retrieve access token", data);
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const expirationTimestamp = localStorage.getItem('spotify_expiration_time');
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    if (!expirationTimestamp || !refreshToken) return;

    const expiresInMs = Number(expirationTimestamp) - Date.now();
    // Refresh 5 min before expiration
    const firstRefreshDelay = expiresInMs - 5 * 60 * 1000;
    // Refresh every 55 minutes
    const refreshInterval = 55 * 60 * 1000;

    // Clear localStorage if the token is expired
    if (firstRefreshDelay < 0) {
      localStorage.clear();
      console.log('The access token is expired. Log in again with Spotify');
      return;
    }

    setAccessToken(localStorage.getItem('spotify_access_token'));

    console.log(`First token refesh scheduled in ${Math.floor(firstRefreshDelay / 1000 / 60)} minutes`);

    const refreshAccessToken = async () => {
      console.log('Refreshing Spotify token...');

      const response = await fetch('/api/spotify/refresh', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (data.access_token) {
        const expirationTime = Date.now() + (Number(data.expires_in) * 1000);
        
        localStorage.setItem('spotify_access_token', data.access_token);
        localStorage.setItem('spotify_expiration_time', expirationTime.toString());
        setAccessToken(localStorage.getItem('spotify_access_token'));

        console.log('Token refreshed successfully');
      } else {
        console.error('Failed to refresh token', data);
      }
    };

    const firstTimeout = setTimeout(() => {
      refreshAccessToken();
      const interval = setInterval(refreshAccessToken, refreshInterval);
      return () => clearTimeout(interval);
    }, firstRefreshDelay);

    return () => clearTimeout(firstTimeout);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);
  
  return (
    <>
      <h1 className={`${cinzel_decorative.className} antialiased`}>Waltzing Koala</h1>
      <button onClick={spotifyLogin}>Spotify Login</button>
      {accessToken && <Player accessToken={accessToken} />}
      {accessToken && <Microphone accessToken={accessToken} />}
    </>
  );
}
