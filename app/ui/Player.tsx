'use client';

const Player = ({ accessToken }: { accessToken: string }) => {
  const previous = async () => {
    await fetch("https://api.spotify.com/v1/me/player/previous", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  const play = async () => {
    await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }
  
  const pause = async () => {
    await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  const next = async () => {
    await fetch("https://api.spotify.com/v1/me/player/next", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }
  
  return (
    <div>
      <button onClick={previous}>&lt;&lt;</button>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={next}>&gt;&gt;</button>
    </div>
  );
};

export default Player;