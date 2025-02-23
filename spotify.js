//https://developer.spotify.com/documentation/web-api/concepts/authorization
const token = 'BQCgSRH4GMhbHW_f99R5VwGRszJqsKr7jBiInnX3D0cudYNQ92bnZ6yF8EOHrdDDNdVfvS169rFmw56Q844VfxWrm5YQo4cLqdzwEmYbnOgRI3P0b3Tb3gKmbGZrDAhujAlDEY-mPUX5s7l-7mAxvaFkS10rvJyajzLOXWF1GslmsuUtWMqihTAGktqOnNyehSbF7IbrbELlsJLLrWl7EQ4-Y5YjqObNzSEfLj-CpmLro3Z5UmDc33SVWD5kgi0CLwFTgKduqDtWDIV887jLFQ-S9OT60ZZjfuulDVL4Tiag0gEn8_0E';
//get the token from the link, this is temporary


async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method,
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    console.error('API request failed:', res.status, res.statusText);
    return null;
  }

  return await res.json();
}

async function topTracks() {
  const data = await fetchWebApi('v1/me/top/tracks?time_range=medium_term&limit=15', 'GET');
  if (data) {
    console.log('Fetched tracks:', data.items);
    return data.items;
  } else {
    console.error('Failed to fetch top tracks');
    return [];
  }
}

async function createPlaylist(tracksUri) {
  const { id: user_id } = await fetchWebApi('v1/me', 'GET');

  const playlist = await fetchWebApi(
    `v1/users/${user_id}/playlists`, 'POST', {
      "name": "My Top Tracks Playlist",
      "description": "Playlist created from top tracks",
      "public": false
    }
  );

  if (playlist) {
    await fetchWebApi(
      `v1/playlists/${playlist.id}/tracks?uris=${tracksUri.join(',')}`,
      'POST'
    );
    return playlist;
  } else {
    console.error('Failed to create playlist');
    return null;
  }
}

async function Process() {
  const tracks = await topTracks();

  if (tracks.length === 0) {
    console.warn('No tracks found');
    return;
  }

  const trackList = document.getElementById('tracks');
  const playlistPreview = document.getElementById('playlist-preview');
  const trackUris = [];

  tracks.forEach(track => {
    const artistNames = track.artists.map(artist => artist.name).join(', ');
    const albumImage = track.album.images[0]?.url || '';

    const listItem = document.createElement('li');
    listItem.className = 'track-item';

    listItem.innerHTML = `
      <img src="${albumImage}" alt="${track.name} album cover">
      <div class="track-info">
        <div class="track-name">${track.name}</div>
        <div class="artist-name">${artistNames}</div>
      </div>
    `;
    trackList.appendChild(listItem);

    // Add to playlist preview
    const previewItem = document.createElement('li');
    previewItem.className = 'track-item';
    previewItem.innerHTML = listItem.innerHTML;
    playlistPreview.appendChild(previewItem);

    // Collect track URIs
    trackUris.push(track.uri);
  });

  document.getElementById('create-playlist').addEventListener('click', async () => {
    const playlist = await createPlaylist(trackUris);
    if (playlist) {
      alert(`Playlist "${playlist.name}" created successfully!`);
    }
  });
}

Process().catch(console.error);