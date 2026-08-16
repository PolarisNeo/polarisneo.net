# polarisneo.net

Static site for the [polarisneo](https://www.youtube.com/@polarisneo) YouTube channel.
Plain HTML, CSS and JS — no build step, no dependencies. Deploy by serving the folder.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The page. Also holds the video list as real markup and the schema.org structured data. |
| `styles.css` | All styling (~2KB). |
| `videos.js` | Optionally refreshes the video grid from the YouTube API at load. |
| `sitemap.xml` | Listed in `robots.txt`, includes video sitemap data. |
| `og-image.png` | 1200×630 social share image, generated from `logo.png`. |

## Turning on automatic video updates

The video grid in `index.html` is hardcoded so the page works without JavaScript and so
search engines can index the videos. `videos.js` replaces that list at runtime with the
live one from YouTube, but only once you give it an API key.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/), create a project.
2. Under **APIs & Services → Library**, enable **YouTube Data API v3**.
3. Under **Credentials**, create an **API key**.
4. Edit the key and restrict it:
   - **Application restrictions** → *Websites*, add `polarisneo.net/*` and `www.polarisneo.net/*`
   - **API restrictions** → *Restrict key* → YouTube Data API v3
5. Paste it into `API_KEY` at the top of `videos.js`.

The referrer restriction is what makes it safe to have the key sitting in a public JS file —
it only works when the request comes from your own domain. Listing videos costs 1 quota unit
per page load against a daily allowance of 10,000.

If the key is missing or the request fails, the page quietly keeps the list already in the HTML.

### Why not just read the RSS feed?

`https://www.youtube.com/feeds/videos.xml?channel_id=UCIfY2Xtu_v87M4v0VjZMXyw` has everything
needed and no key, but YouTube serves it without CORS headers so a browser cannot read it.
That leaves a third-party CORS proxy in the middle of every page load, which is slower and
breaks when the proxy does.

## After uploading a new video

`videos.js` picks it up automatically. Google, however, indexes the HTML, so for the SEO side
also update in `index.html`:

- a new `<li class="video">` card in `#video-grid` (copy an existing one, swap the video ID,
  title and date)
- a matching `VideoObject` entry in the JSON-LD `@graph`

and add a `<video:video>` block to `sitemap.xml`. Regenerate the share image only if the logo
changes.
