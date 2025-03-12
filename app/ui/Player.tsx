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
    const response = await spotifyPlayer.getState(accessToken);
    return await response.json();
  };

  useEffect(() => {
    const setUpSpotifyState = async () => {
      const spotifyState = await getSpotifyState();
      setIsPlaying(spotifyState.is_playing);
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