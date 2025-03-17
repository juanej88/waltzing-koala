'use client';

import { useEffect, useRef, useState } from 'react';
import spotifyPlayer from '@/app/api/spotify/player/routes';
import useSpotifyVolume from '@/app/hooks/useSpotifyVolume';
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
  const { fadeSpotifyVolume } = useSpotifyVolume(accessToken);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [refreshState, setRefreshState] = useState<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announcements = [
    {
      id: '3QHMxEOAGD51PDlbFPHLyJ',
      audio: '/audio/DJI_05_20250314_230518.WAV',
      played: false,
    },
    {
      id: '1iHDQ530nvzDVCjWVftfdQ',
      audio: '/audio/Slovak_Sokoly.mp3',
      played: false,
    },
  ]

  const togglePlay = async () => {
    if (isPlaying) {
      const response = await spotifyPlayer.pause(accessToken);
      if (response.ok) {
        setIsPlaying(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    } else {
      const response = await spotifyPlayer.play(accessToken);
      if (response.ok) {
        setIsPlaying(true);
        setRefreshState(true);
      }
    }
  };

  const skipSong = async (action: string) => {
    const response = action === 'previous' ?
    await spotifyPlayer.previous(accessToken) :
    await spotifyPlayer.next(accessToken);

    if (response.ok) {
      if (!isPlaying) setIsPlaying(true);
      setRefreshState(true);
    }
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

        const newTrack = {
          id: spotifyState.item.id,
          image_url: spotifyState.item.album.images[1].url,
          artist: spotifyState.item.artists[0].name,
          song: spotifyState.item.name,
          length_ms: spotifyState.item.duration_ms,
          progress_ms: spotifyState.progress_ms,
        };

        console.log(spotifyState.item.id);

        const matchingAnnouncement = announcements.find(ann => ann.id == newTrack.id);
        if (matchingAnnouncement) {
          await spotifyPlayer.volume(accessToken, 40);
          await spotifyPlayer.pause(accessToken);
          const audio = new Audio(matchingAnnouncement.audio);
          audio.volume = 1.0;
          audio.play()
          .then(() => {
              audio.addEventListener('ended', async () => {
                await spotifyPlayer.play(accessToken);
                await fadeSpotifyVolume(40, 100, 1000);
              })
            })
            .catch(err => console.error('Error playing announcement:', err));
        }

        if (spotifyState) {
          setIsPlaying(spotifyState.is_playing);
          setCurrentTrack(newTrack);
          setRefreshState(false);
        }

      } catch (error) {
        console.error(`Error updating playback state: ${error}`);
      }
    };

    checkSpotifyState();

  }, [refreshState]);

  useEffect(() => {
    if (!currentTrack) return;

    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    console.log(`Setting new timeout for track ${currentTrack.song}`);

    // Set new timeout with 10s of crossfade
    const remainingTime = currentTrack.length_ms - currentTrack.progress_ms - 10000;
    console.log(`Next update in: ${Math.floor(remainingTime / 1000)}s`);
    timeoutRef.current = setTimeout(() => {
      console.log('Refreshing Spotify state due to timeout');
      setRefreshState(true);
    }, Math.max(remainingTime, 1000));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [currentTrack]);
  

  return (
    <>
      <section className='flex items-center gap-8'>
        {currentTrack && 
          <article className='flex items-center gap-2'>
              <Image src={currentTrack.image_url} height={64} width={64} className='w-auto h-auto' alt={`Album Image for the song ${currentTrack.song}`} />
            <div>
              <h3 className='max-w-[192px] overflow-hidden text-ellipsis whitespace-nowrap'>{currentTrack.song}</h3>
              <p className='max-w-[192px] overflow-hidden text-ellipsis whitespace-nowrap'>{currentTrack.artist}</p>
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
        <button onClick={() => adjustVolume(40)}>LowerVolume</button>
        <button onClick={() => adjustVolume(100)}>HigherVolume</button>
      </div>
    </>
  );
};

export default Player;