interface RequestParams {
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT',
  endpoint: string,
}

const path = 'https://api.spotify.com/v1/me/player';

const getHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

const request = async ({endpoint, method, accessToken}: RequestParams) => {
  return await fetch(`${path}${endpoint}`, {
    method,
    headers: getHeaders(accessToken),
  });
};

const spotifyPlayer = {
  getState: (accessToken: string) => (
    request({endpoint: '', method: 'GET', accessToken})
  ),
  play: (accessToken: string) => (
    request({endpoint: '/play', method: 'PUT', accessToken})
  ),
  pause: (accessToken: string) => (
    request({endpoint: '/pause', method: 'PUT', accessToken})
  ),
  previous: (accessToken: string) => (
    request({endpoint: '/previous', method: 'POST', accessToken})
  ),
  next: (accessToken: string) => (
    request({endpoint: '/next', method: 'POST', accessToken})
  ),
};

export default spotifyPlayer;