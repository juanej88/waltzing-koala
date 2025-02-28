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
};

const Player = ({ accessToken }: { accessToken: string }) => {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => cb(accessToken),
        volume: 1.0,
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        console.log('Ready with Device ID', device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
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

      player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        }
      })
    }
  }, []);

  const playSong = async () => {
    if (!accessToken || !deviceId) {
      console.error("No access token or device ID");
      return;
    }

    try {
      // Transfer playback to the Web Player
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ device_ids: [deviceId] }),
      });

      console.log(response);

      // Play the track
      const playRes = await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context_uri: 'spotify:playlist:75rj8lj3rclba5kLjjHiWq' }),
      });

      console.log(playRes);

      console.log("Playback started");
    } catch (error) {
      console.error("Error starting playback:", error);
    }
  };
  
  return (
    <div>
      <button onClick={playSong}>Play Playlist</button>
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
          <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" height={50} width={50} />
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
    </div>
  );
};

export default Player;