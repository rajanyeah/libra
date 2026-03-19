# libra — a life log

A personal mood/phase tracker. Drop entries whenever you want — once a day, five times in an afternoon. See your life plotted as a wave.

---

## Setup (takes ~10 minutes)

### 1. Install dependencies

```bash
cd libra-app
npm install
```

---

### 2. Create a Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it (e.g. `libra`) → Continue
3. Disable Google Analytics if you want (optional) → **Create project**

---

### 3. Create a Firestore database

1. In your Firebase project, go to **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you can lock it down later)
4. Pick a region close to you → **Enable**

---

### 4. Get your Firebase config

1. In Firebase Console → **Project Settings** (gear icon, top left)
2. Scroll to **Your apps** → click **</>** (Web) → register app (any nickname)
3. Copy the `firebaseConfig` object — you'll see something like:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "libra-xxxx.firebaseapp.com",
  projectId: "libra-xxxx",
  storageBucket: "libra-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc"
};
```

---

### 5. Add your config as environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste each value from the config above:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=libra-xxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=libra-xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=libra-xxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

---

### 6. Run it locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live!

---

## Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. Go to [https://vercel.com](https://vercel.com) → **New Project** → import your repo
3. In **Environment Variables**, add all 6 `NEXT_PUBLIC_FIREBASE_*` variables
4. Click **Deploy** — done. Your app is on the web.

---

## Firestore security (optional but recommended)

When you're ready to lock down your database so only you can write:

1. Firebase Console → Firestore → **Rules**
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entry} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Then add Firebase Auth (Google sign-in) to the app. Let me know if you want that added.

---

## Stack

- **Next.js 14** — React framework
- **Firebase Firestore** — real-time cloud database
- **Chart.js** — the graph
- **date-fns** — date formatting
- **Vercel** — hosting
