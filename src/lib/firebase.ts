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
  setDoc,
  getDoc,
  type Unsubscribe,
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
export const auth = getAuth(app);

export type Entry = {
  id: string;
  value: number;
  note: string;
  ts: number;
};

export type UserProfile = {
  name: string;
  email: string;
};

// auth
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await setDoc(doc(db, "users", uid), profile);
}

// entries — now scoped per user
export async function addEntry(uid: string, value: number, note: string): Promise<void> {
  await addDoc(collection(db, "users", uid, "entries"), {
    value,
    note,
    ts: Timestamp.now().toMillis(),
  });
}

export async function deleteEntry(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "entries", id));
}

export function subscribeToEntries(
  uid: string,
  callback: (entries: Entry[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "users", uid, "entries"),
    orderBy("ts", "asc")
  );
  return onSnapshot(q, (snap) => {
    const entries: Entry[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Entry, "id">),
    }));
    callback(entries);
  });
}