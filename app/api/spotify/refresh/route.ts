export async function POST(req: Request) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId) {
    return new Response(JSON.stringify({ error: 'Missing environment variables' }), { status: 500 });
  }

  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return new Response(
        JSON.stringify({ error: 'Missing refresh token' }),
        { status: 400 }
      );
    }

    // Exchange Refresh Token for Access Token
    const url = 'https://accounts.spotify.com/api/token';
  
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization:
        'Basic ' + 
        Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        // client_id: clientId,
      }),
    };
  
    const tokenResponse = await fetch(url, payload);
    const tokenData = await tokenResponse.json();
  
    if (!tokenResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to get access token with refresh token', details: tokenData }), { status: 400 });
    }
    
    return new Response(JSON.stringify(tokenData), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Server error', details: error }),
      { status: 500 }
    );
  }
};