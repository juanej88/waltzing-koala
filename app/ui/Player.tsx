'use client';

import { useEffect, useRef, useState } from 'react';
import spotifyPlayer from '@/app/api/spotify/player/routes';
import useSpotifyVolume from '@/app/hooks/useSpotifyVolume';
import announcements from '@/app/utils/announcements';
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
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const timeoutStateRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutAnnouncementRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = async () => {
    if (isPlaying) {
      const response = await spotifyPlayer.pause(accessToken);
      if (response.ok) {
        setIsPlaying(false);
        if (timeoutStateRef.current) clearTimeout(timeoutStateRef.current);
        if (timeoutAnnouncementRef.current) clearTimeout(timeoutAnnouncementRef.current);
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
  
  const getSpotifyQueue = async () => {
    try {
      const response = await spotifyPlayer.getQueue(accessToken);

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
        const spotifyQueue = await getSpotifyQueue();
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

        const nextTrack = {
          id: spotifyQueue.queue[0].id,
          artist: spotifyQueue.queue[0].artists[0].name,
          song: spotifyQueue.queue[0].name,
          length_ms: spotifyQueue.queue[0].duration_ms,
        }

        console.log(spotifyState.item.id);
        console.log(nextTrack);

        const matchingAnnouncement = announcements.find(ann => ann.id == nextTrack.id);
        if (matchingAnnouncement) {
          setAnnouncement(matchingAnnouncement.audio);
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
    if (timeoutStateRef.current) clearTimeout(timeoutStateRef.current);
    if (timeoutAnnouncementRef.current) clearTimeout(timeoutAnnouncementRef.current);
    
    console.log(`Setting new timeout for track ${currentTrack.song}`);

    // Set new timeout with 10s of crossfade
    const remainingTime = currentTrack.length_ms - currentTrack.progress_ms - 10000;
    console.log(`Next update in: ${Math.floor(remainingTime / 1000)}s`);
    timeoutStateRef.current = setTimeout(() => {
      console.log('Refreshing Spotify state due to timeout');
      setRefreshState(true);
    }, Math.max(remainingTime, 1000));

    return () => {
      if (timeoutStateRef.current) clearTimeout(timeoutStateRef.current);
      if (timeoutAnnouncementRef.current) clearTimeout(timeoutAnnouncementRef.current);
    }
  }, [currentTrack]);

  const getAudioDuration = (audioSrc: string): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioSrc);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
      });


      audio.addEventListener('error', error => {
        reject(`Error loading audio: ${error}`);
      });
    });
  };
  
  useEffect(() => {
    if (!announcement || !currentTrack) return;

    const setAnnouncementTimeout = async () => {
      // Clear any existing timeout
      if (timeoutAnnouncementRef.current) clearTimeout(timeoutAnnouncementRef.current);
      
      console.log(`Setting new timeout for announcement ${announcement}`);
      
      const audioLength = await getAudioDuration(announcement) * 1000;
      
      const announcement_ms = currentTrack.length_ms - currentTrack.progress_ms - 10000 - 4000 - audioLength;
      
      console.log(`Next announcement in: ${Math.floor(announcement_ms / 1000)}s`);

      const playAnnouncement = async () => {
        console.log('Playing announcement');

        try {
          // await spotifyPlayer.volume(accessToken, 50);
          await fadeSpotifyVolume(100, 50, 1000);
          // await spotifyPlayer.pause(accessToken);

          const audio = new Audio(announcement);
          audio.volume = 1.0;
          await audio.play();

          audio.addEventListener('ended', async () => {
            console.log('Announcement ended');
            // await spotifyPlayer.play(accessToken);
            await fadeSpotifyVolume(50, 100, 1000);
          });
        } catch (error) {
          console.error('Error playing announcement:', error);
        }
      };

      // Set new timeout
      timeoutAnnouncementRef.current = setTimeout(() => {
        playAnnouncement();
        setAnnouncement(null);
      }, Math.max(announcement_ms, 1000));
    }

    setAnnouncementTimeout();

    return () => {
      if (timeoutAnnouncementRef.current) clearTimeout(timeoutAnnouncementRef.current);
    };
  }, [announcement, currentTrack]);
  

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