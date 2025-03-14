'use client';

import { useEffect, useState } from 'react';
import spotifyPlayer from '@/app/api/spotify/player/routes';
import Image from 'next/image';

interface CurrentTrack {
  id: string,
  image_url: string,
  artist: string,
  song: string,
  length_ms: number,
  progress_ms: number,
}

const Player = ({ accessToken }: { accessToken: string }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [refreshState, setRefreshState] = useState(true);

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
    if (response.ok) setRefreshState(true);
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
    if (!refreshState) return;

    const checkSpotifyState = async () => {
      try {
        const spotifyState = await getSpotifyState();
        if (!spotifyState) {
          console.warn('There is no Spotify player active. Play Spotify in your prefered device');
          return;
        }

        setIsPlaying(spotifyState.is_playing);

        const newTrack = {
          id: spotifyState.item.id,
          image_url: spotifyState.item.album.images[1].url,
          artist: spotifyState.item.artists[0].name,
          song: spotifyState.item.name,
          length_ms: spotifyState.item.duration_ms,
          progress_ms: spotifyState.progress_ms,
        };

        setCurrentTrack(newTrack);

        // This avoids the calling of checkSpotifyState after the spotifyState is updated
        setRefreshState(false);

        const remainingTime = newTrack.length_ms - newTrack.progress_ms - 11000;
        console.log(`Next update in: ${remainingTime}ms`);

        const timeoutId = setTimeout(() => {
          setRefreshState(true);
        }, remainingTime);

        return () => clearTimeout(timeoutId);

      } catch (error) {
        console.error(`Error updating playback state: ${error}`);
      }
    };

    checkSpotifyState();

  }, [refreshState]);

  return (
    <>
      <section className='flex items-center gap-8'>
        {currentTrack && 
          <article className='flex items-center gap-2'>
              <Image src={currentTrack.image_url} height={64} width={64} className='w-auto h-auto' alt={`Album Image for the song ${currentTrack.song}`} />
            <div>
              <h3 className='max-w-[192px] overflow-hidden text-ellipsis whitespace-nowrap'>{currentTrack.song}</h3>
              <p>{currentTrack.artist}</p>
            </div>
          </article>
        }
        <article>
          <button onClick={() => skipSong('previous')}>&lt;&lt;</button>
          <button onClick={togglePlay}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => skipSong('next')}>&gt;&gt;</button>
        </article>
      </section>
      
      <div>
        <button onClick={() => adjustVolume(90)}>LowerVolume</button>
        <button onClick={() => adjustVolume(100)}>HigherVolume</button>
      </div>
      <audio src='/audio/Nova_tts-1_1x_2025-03-14T03_12_09-597Z.mp3' controls></audio>
    </>
  );
};

export default Player;