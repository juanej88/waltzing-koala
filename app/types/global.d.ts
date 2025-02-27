export {};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
  }

  interface SpotifyPlayer {
    connect: () => Promise<boolean>;
    disconnect: () => void;
    addListener: (event: string, callback: (data: any) => void) => void;
    previousTrack: () => Promise<void>;
    nextTrack: () => Promise<void>;
    togglePlay: () => Promise<void>;
    getCurrentState: () => Promise<{ 
      track_window: { 
        current_track: {
          name: string;
          artists: { name: string }[];
          album: { images: { url: string }[] };
        };
      };
      paused: boolean;
    } | null>;
  }
}