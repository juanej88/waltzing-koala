import querystring from 'querystring';

export async function GET(req: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state streaming';

  if (!clientId || !clientSecret || !redirectUri) {
    return new Response(JSON.stringify({ error: 'Missing environment variables' }), { status: 500 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  // Redirect User to Spotify Authorization URL
  if (!code) {
    const state = Math.random().toString(36).substring(7);
    const authUrl = 'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
      });
  
    return new Response(JSON.stringify({ authUrl }), { status: 200});
  }

  // Exchange Code for Access Token
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + 
        Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: redirectUri
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to get access token', details: tokenData }), { status: 400 });
  }

  return new Response(JSON.stringify(tokenData), { status: 200 });
};