import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

// ─── PASTE YOUR FIREBASE CONFIG HERE ───────────────────────────────────────
// Go to: Firebase Console → Project Settings → Your apps → SDK setup
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
// ───────────────────────────────────────────────────────────────────────────

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export type Entry = {
  id: string;
  value: number;
  note: string;
  ts: number; // unix ms
};

export async function addEntry(value: number, note: string): Promise<void> {
  await addDoc(collection(db, "entries"), {
    value,
    note,
    ts: Timestamp.now().toMillis(),
  });
}

export async function deleteEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, "entries", id));
}

export function subscribeToEntries(
  callback: (entries: Entry[]) => void
): () => void {
  const q = query(collection(db, "entries"), orderBy("ts", "asc"));
  const unsub = onSnapshot(q, (snap) => {
    const entries: Entry[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Entry, "id">),
    }));
    callback(entries);
  });
  return unsub;
}
