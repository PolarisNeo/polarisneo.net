/*
 * Refreshes the video grid from YouTube at page load.
 *
 * The grid in index.html is already populated with real markup, so the page works
 * with no JavaScript and search engines see the videos. This script just replaces
 * that list with the live one so new uploads appear without editing the HTML.
 *
 * Set API_KEY to a browser API key restricted to the polarisneo.net referrer.
 * Leave it empty and the static list in index.html is simply left alone.
 * See README.md for the setup steps.
 */

const CHANNEL_ID = 'UCIfY2Xtu_v87M4v0VjZMXyw';
const API_KEY = '';
const MAX_VIDEOS = 12;

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/* A channel's uploads playlist is its channel ID with the UC prefix swapped for UU */
const uploadsPlaylistId = () => 'UU' + CHANNEL_ID.slice(2);

async function fetchVideos() {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.search = new URLSearchParams({
        part: 'snippet',
        playlistId: uploadsPlaylistId(),
        maxResults: MAX_VIDEOS,
        key: API_KEY
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error(`YouTube API returned ${response.status}`);

    const { items = [] } = await response.json();

    return items
        .filter(item => item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video')
        .map(item => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            published: item.snippet.publishedAt
        }));
}

function buildCard({ id, title, published }, index) {
    const item = document.createElement('li');
    item.className = 'video';

    const link = document.createElement('a');
    link.href = `https://www.youtube.com/watch?v=${id}`;
    link.rel = 'noopener';

    const thumb = document.createElement('img');
    thumb.className = 'video-thumb';
    thumb.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    thumb.srcset = `https://i.ytimg.com/vi/${id}/mqdefault.jpg 320w, https://i.ytimg.com/vi/${id}/hq720.jpg 1280w`;
    thumb.sizes = '320px';
    thumb.alt = title;
    thumb.width = 320;
    thumb.height = 180;
    /* The first row is likely on screen already, so only defer the rest */
    if (index > 2) thumb.loading = 'lazy';

    const heading = document.createElement('h3');
    heading.className = 'video-title';
    heading.textContent = title;

    const meta = document.createElement('p');
    meta.className = 'video-meta';
    const time = document.createElement('time');
    time.dateTime = published.slice(0, 10);
    time.textContent = dateFormat.format(new Date(published));
    meta.append(time);

    link.append(thumb, heading, meta);
    item.append(link);
    return item;
}

async function render() {
    const grid = document.getElementById('video-grid');
    if (!grid || !API_KEY) return;

    try {
        const videos = await fetchVideos();
        if (!videos.length) return;

        grid.replaceChildren(...videos.map(buildCard));
    } catch (error) {
        /* Leave the markup that shipped with the page in place */
        console.warn('Could not refresh videos from YouTube:', error.message);
    }
}

render();
