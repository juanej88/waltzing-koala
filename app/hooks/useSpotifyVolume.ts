import spotifyPlayer from '@/app/api/spotify/player/routes';

const useSpotifyVolume = (accessToken: string) => {
  const fadeSpotifyVolume = async (startVolume: number, endVolume: number, duration: number) => {
    const steps = duration === 4000 ? 10 : 5;
    const stepDuration = duration / steps;
    let newVolume = startVolume;

    for (let i = 0; i < steps; i++) {
      startVolume > endVolume ? newVolume -= 10 : newVolume += 10;
      await spotifyPlayer.volume(accessToken, newVolume);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    return true;
  };

  return { fadeSpotifyVolume };
};

export default useSpotifyVolume;