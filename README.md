# Salesforce Work Portfolio — Aditya Kopalli

A minimal, zero-build static site cataloguing my Salesforce engineering work across
**Scoring**, **MuleSoft integration**, **Agentforce**, **IAM**, and **POCs**. Every item
opens to its low-level design, test plan, and setup steps.

## Run locally

No build step. Just serve the folder:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Edit content

All content lives in [`assets/js/data.js`](assets/js/data.js) — add an item to the
relevant area's `items[]` array. Stats live in the `STATS` array at the top.

## Host on GitHub Pages

1. Create a repo and push this folder.
2. Settings → Pages → Source: `main` branch, `/root`.
3. Site publishes at `https://<user>.github.io/<repo>/`.

## Structure

```
index.html            # shell + tabs + detail drawer
assets/css/style.css   # dark/light theme, cards, drawer
assets/js/data.js      # ← all portfolio content lives here
assets/js/app.js       # tabs, rendering, drawer, routing
```
