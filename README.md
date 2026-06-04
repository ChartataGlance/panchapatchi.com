# Panchapatchi.com

Static, mobile-first GitHub Pages project.

## Deploy to GitHub Pages

1. Create a GitHub repository named `panchapatchi.com`.
2. Upload all files in this folder to the repository root.
3. Go to **Settings → Pages**.
4. Source: **Deploy from branch**.
5. Branch: **main** and folder: **/root**.
6. Add custom domain: `panchapatchi.com`.
7. Enable HTTPS after DNS is ready.

## No-cache while building

This project includes no-cache meta tags and version query strings while in development:

```html
assets/css/style.css?v=dev-1
assets/js/app.js?v=dev-1
```

When you change CSS/JS, increase the version, for example `v=dev-2`.

`robots.txt` is currently blocking search engines until the site is fully ready.
When ready, change:

```txt
Disallow: /
```

to:

```txt
Allow: /
```

Also change the homepage robots meta from `noindex,nofollow` to `index,follow`.

## Moon calculation

- Moon cycle: 29.530588853 days.
- Full circle: 360°.
- One section: 12°.
- Total sections: 360 ÷ 12 = 30.
- One side: 180 ÷ 12 = 15 sections.
- Rising side: 0° to 180°.
- Falling side: 180° to 360°.

Formula:

```js
moonAge = daysSinceKnownNewMoon % 29.530588853
phaseAngle = moonAge / 29.530588853 * 360
section = Math.floor(phaseAngle / 12)
```
