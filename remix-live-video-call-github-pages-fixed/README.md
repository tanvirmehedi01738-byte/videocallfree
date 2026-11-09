# Live Video Call Website

## GitHub Pages deployment

This project uses Vite + React and includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

1. Create a GitHub repository and upload/push all files in this folder to the repository root.
2. In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. Do NOT select “Deploy from a branch” or `/root`; this is a React + Vite app and its TSX source must be built first.
3. Open the **Actions** tab. The `Deploy to GitHub Pages` workflow will build and publish the site after a push to `main` (or `master`).
4. When the workflow finishes successfully (green check), open **Settings → Pages** to find the published URL. If it fails, open **Actions → Deploy to GitHub Pages → Build project** and read the first red error.

The Vite `base: './'` setting is intentional so assets work from a GitHub Pages project subpath.

## Firebase setup required for the live site

The frontend Firebase config in `firebase-applet-config.json` identifies the Firebase project; Firebase web config values are not server secrets. Do not put private service-account keys or admin credentials in frontend files.

1. In Firebase Console → Authentication → Sign-in method, enable **Google**.
2. In Authentication → Settings → Authorized domains, add the GitHub Pages hostname, e.g. `YOUR_GITHUB_USERNAME.github.io` (hostname only; no `https://` and no repository path).
3. In Firestore Database → Rules, publish the rules from `firestore.rules`.
4. The rules allow public reads of the call configuration, but only verified Google accounts with one of the two explicitly listed admin email addresses can create or update it. Change those two addresses in BOTH `firestore.rules` and `src/components/AdminPanel.tsx` if different administrators should be allowed.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Build locally with:

```bash
npm run build
```

The generated static site is in `dist/`.
