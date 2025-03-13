'use client';

import { useEffect, useState } from 'react';
import spotifyPlayer from '@/app/api/spotify/player/routes';

const Player = ({ accessToken }: { accessToken: string }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const togglePlay = async () => {
    if (isPlaying) {
      const response = await spotifyPlayer.pause(accessToken);
      if (response.ok) setIsPlaying(false);
    } else {
      const response = await spotifyPlayer.play(accessToken);
      if (response.ok) setIsPlaying(true);
    }
  };

  const skipSong = async (action: string) => {
    const response = action === 'previous' ?
    await spotifyPlayer.previous(accessToken) :
    await spotifyPlayer.next(accessToken);
    if (response.ok && !isPlaying) setIsPlaying(true);
  };

  const adjustVolume = async (volume: number) => {
    await spotifyPlayer.volume(accessToken, volume);
  };

  const getSpotifyState = async () => {
    try {
      const response = await spotifyPlayer.getState(accessToken);

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json().catch(() => null);
      if (!data) {
        console.warn('Empty response received.');
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching Spotify state: ${error}`);
    }
  };

  useEffect(() => {
    const setUpSpotifyState = async () => {
      try {
        const spotifyState = await getSpotifyState();

        if (!spotifyState) {
          console.warn('There is no Spotify player active. Play Spotify in your prefered device');
          return;
        }

        setIsPlaying(spotifyState.is_playing);
      } catch (error) {
        console.error(`Error at setting isPlaying: ${error}`);
      }
    };

    setUpSpotifyState();
  }, []);

  return (
    <div>
      <button onClick={() => skipSong('previous')}>&lt;&lt;</button>
      <button onClick={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={() => skipSong('next')}>&gt;&gt;</button>
      <button onClick={() => adjustVolume(90)}>LowerVolume</button>
      <button onClick={() => adjustVolume(100)}>HigherVolume</button>
    </div>
  );
};

export default Player;