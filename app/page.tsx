'use client';

import { useEffect, useState } from 'react';

const track = {
  name: "",
  album: {
    images: [
      { url: undefined }
    ]
  },
  artists: [
    { name: "" }
  ]
}

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAccessToken(localStorage.getItem('spotify_token'));
    }
  }, []);
  
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

  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      document.body.appendChild(script);

      window.onSpotifyWebPlaybackSDKReady = () => {
        const player = new window.Spotify.Player({
          name: 'Web Playback SDK',
          getOAuthToken: cb => { cb(accessToken); },
          volume: 0.5
        });

        setPlayer(player);

        player.addListener('ready', ({ device_id }) => {
          setDeviceId(device_id);
          console.log('Ready with Device ID', device_id);
        });

        player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
        });

        player.addListener('initialization_error', ({ message }) => {
          console.error(message);
        });
      
        player.addListener('authentication_error', ({ message }) => {
          console.error(message);
        });
      
        player.addListener('account_error', ({ message }) => {
          console.error(message);
        });

        player.addListener('player_state_changed', (state => {
          if (!state) {
            return;
          }

          setTrack(state.track_window.current_track);
          setPaused(state.paused);
          player.getCurrentState().then( state => {
            (!state)? setActive(false) : setActive(true)
          });
        }));

        player.connect();
      }
    }
  }, [accessToken]);
  
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);

  const playSong = async () => {
    if (!accessToken || !deviceId) {
      console.error("No access token or device ID");
      return;
    }

    try {
      // Transfer playback to the Web Player
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_ids: [deviceId], play: true }),
      });

      // Play the track
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Playback started");
    } catch (error) {
      console.error("Error starting playback:", error);
    }
  };
  
  return (
    <>
      <h1>Waltzing Koala</h1>
      <button onClick={spotifyLogin}>Spotify Login</button>
      <button onClick={playSong}>Play Song</button>

      <button className="btn-spotify" onClick={() => { player?.previousTrack() }} >
        &lt;&lt;
      </button>
      <button className="btn-spotify" onClick={() => { player?.togglePlay() }} >
        { is_paused ? "PLAY" : "PAUSE" }
      </button>
      <button className="btn-spotify" onClick={() => { player?.nextTrack() }} >
        &gt;&gt;
      </button>

      <div className="container">
        <div className="main-wrapper">
          {/* {track?.album?.images?.[0]?.url && ( */}
          <img src={current_track.album.images[0].url} 
            className="now-playing__cover" alt="" />
          {/* )} */}
          <div className="now-playing__side">
              <div className="now-playing__name">
                {current_track.name}
              </div>
              <div className="now-playing__artist">
                {current_track.artists[0].name}
              </div>
          </div>
        </div>
      </div>
    </>
  );
}
