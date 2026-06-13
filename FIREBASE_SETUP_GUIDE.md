# Firebase Setup Guide

This walks you through everything needed to make `admin.html` work and
have your site pull in extra Projects, Certifications, and Tools.

Total time: ~15–20 minutes. All free (Spark plan) — no card needed.

---

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"**
3. Name it anything (e.g. `abisola-portfolio`)
4. You can disable Google Analytics — not needed for this
5. Click **Create project** and wait for it to finish

---

## 2. Register a Web App

1. On the project dashboard, click the **`</>`** (web) icon
2. Nickname it anything (e.g. `portfolio-web`)
3. **Don't** check "Firebase Hosting" — you're hosting elsewhere
4. Click **Register app**
5. You'll see a `firebaseConfig` object like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "abisola-portfolio.firebaseapp.com",
  projectId: "abisola-portfolio",
  storageBucket: "abisola-portfolio.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. **Copy this entire object** — you'll need it in step 6.

---

## 3. Enable Firestore (the database)

1. In the left sidebar, click **Build > Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (more secure — we'll set rules manually)
4. Pick any location close to you (e.g. `eur3` or `nam5`) — can't be changed later, but doesn't matter much for this use case
5. Click **Enable**

### Set security rules

1. In Firestore, click the **Rules** tab
2. Replace everything with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read (so your portfolio site can display the data)
    // Only logged-in users (you) can write (so only you can edit via admin.html)
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

This means: your portfolio visitors can *see* the data, but only someone
logged into `admin.html` (i.e. you) can add/edit/delete it.

---

## 4. Enable Authentication (so you can log into admin.html)

1. In the left sidebar, click **Build > Authentication**
2. Click **Get started**
3. Click **Email/Password** under "Native providers", toggle it **On**, click **Save**
4. Go to the **Users** tab
5. Click **Add user**
6. Enter the email + password you want to use to log into `admin.html`
   (this can be anything — doesn't need to be a real inbox, but use
   something you'll remember)
7. Click **Add user**

This email/password is now your admin login.

---

## 5. (Optional but recommended) Enable Storage — for uploading images in admin

1. In the left sidebar, click **Build > Storage**
2. Click **Get started**
3. Choose **Start in production mode**, same location as Firestore
4. Click **Done**

### Set Storage rules

1. Click the **Rules** tab
2. Replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

If you skip this step, the image **upload** field in admin.html won't
work — but you can still paste image URLs (e.g. from Imgur, or anywhere
you host images) instead.

---

## 6. Paste your config into `firebase-config.js`

Open `firebase-config.js` and replace the placeholder values with the
real `firebaseConfig` object you copied in step 2:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",                          // <- your real values
  authDomain: "abisola-portfolio.firebaseapp.com",
  projectId: "abisola-portfolio",
  storageBucket: "abisola-portfolio.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Save the file. That's it — no other code needs to change.

---

## 7. Upload all 4 files together

Make sure these 4 files sit in the **same folder** when you upload to
your host (Vercel, Netlify, GitHub Pages, etc.):

- `index-v1.html` (your portfolio — rename to `index.html` when ready to go live)
- `firebase-config.js`
- `site-data.js`
- `admin.html`

---

## 8. Log in and try it out

1. Visit `yoursite.com/admin.html`
2. Log in with the email/password from step 4
3. Try adding a project, a certification, and a tool
4. Go back to your portfolio site and refresh:
   - New **projects** show up after clicking **"View More Work"**
     (they appear as extra pages in the carousel — 6 per page, with
     arrows if there's more than one page)
   - New **certifications** appear after your existing 2
   - New **tools** appear after your existing 6

---

## How it all fits together

| File | What it does |
|---|---|
| `index-v1.html` | Your portfolio. Loads Firebase + the two files below. Works fine even before you set up Firebase. |
| `firebase-config.js` | Your project's connection details. One-time setup. |
| `site-data.js` | Fetches extra projects/certs/tools from Firestore and renders them on the page. Fails silently if Firebase isn't set up or a collection is empty. |
| `admin.html` | Your private editing dashboard. Log in, add/edit/delete entries. Keep the URL to yourself — anyone who finds it just sees a login screen, but it's not linked from your site anywhere. |

---

## Notes & things to know

- **Your existing 6 projects, 2 certifications, and 6 tools are NOT in
  Firebase** — they're hardcoded in `index-v1.html` exactly as before.
  Firebase only adds *new* entries on top of those. To edit the
  existing ones, edit the HTML directly (or ask me).
- **Images**: for new entries, either upload a file in admin (needs
  step 5) or paste an image URL. Don't paste huge base64 strings —
  Firestore has a 1MB-per-document limit.
- **Order field**: controls sort order — lower numbers show first.
  Use any numbers you like (e.g. 10, 20, 30) so you can slot things
  in between later without renumbering everything.
- **Security**: keep your admin email/password private. The rules
  above mean only logged-in users can write data — but Firestore
  rules don't hide the *data itself* from being read by anyone with
  your project's public config (that's normal and fine — it's the
  same data your site already shows publicly).
