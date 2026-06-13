# Static Patchi

Static HTML/JS Panchapatchi version for shared hosting.

## Files

- `index.html`
- `style.css`
- `app.js`

Upload these files to Hostinger `public_html` or a subfolder.

## Notes

- No Python/FastAPI server needed.
- Uses a CDN JS astronomy library tag and built-in JS fallback formulas.
- Sunrise/sunset is calculated in browser with NOAA-style approximation.
- Place lookup/geocode backend is removed; enter place name manually or use the `Here` button for browser geolocation.

## Run locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8088
```

Then open `http://127.0.0.1:8088/staticpatchi/` from `/home/sami`.
