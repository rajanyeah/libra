"use client";

import { useState, useEffect, useCallback } from "react";
import {
  auth,
  signInWithGoogle,
  subscribeToAuth,
  getUserProfile,
  setUserProfile,
  addEntry,
  deleteEntry,
  subscribeToEntries,
  type Entry,
} from "@/lib/firebase";
import LibraChart, { moodColor } from "@/components/LibraChart";
import { format, startOfWeek } from "date-fns";
import type { User } from "firebase/auth";
import styles from "./page.module.css";
import Onboarding from "@/components/Onboarding";

function fmt(v: number): string {
  return (v > 0 ? "+" : "") + v;
}

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("libra_onboarded");
  });
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sliderVal, setSliderVal] = useState(0);
  const [note, setNote] = useState("");
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);
  const [lifeView, setLifeView] = useState(false);

  // listen to auth state
  useEffect(() => {
    const unsub = subscribeToAuth(async (u) => {
      setUser(u);
      if (u) {
        const profile = await getUserProfile(u.uid);
        setUserName(profile?.name ?? null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // listen to entries once logged in
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToEntries(user.uid, setEntries);
    return unsub;
  }, [user]);

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSetName = async () => {
    if (!user || !nameInput.trim()) return;
    const profile = { name: nameInput.trim(), email: user.email ?? "" };
    await setUserProfile(user.uid, profile);
    setUserName(nameInput.trim());
  };

  const handleLog = useCallback(async () => {
    if (!user || logging) return;
    setLogging(true);
    try {
      await addEntry(user.uid, sliderVal, note.trim());
      setNote("");
      setSliderVal(0);
      setLogged(true);
      setTimeout(() => setLogged(false), 1500);
    } finally {
      setLogging(false);
    }
  }, [user, sliderVal, note, logging]);

  const handleDelete = useCallback(async (id: string) => {
    if (!user) return;
    await deleteEntry(user.uid, id);
  }, [user]);

  const sorted = [...entries].sort((a, b) => a.ts - b.ts);
  const last = sorted[sorted.length - 1];
  const weekStart = startOfWeek(new Date()).getTime();
  const weekEntries = entries.filter((e) => e.ts >= weekStart);
  const avg = weekEntries.length > 0
    ? Math.round((weekEntries.reduce((s, e) => s + e.value, 0) / weekEntries.length) * 10) / 10
    : null;
  const peak = weekEntries.length > 0
    ? weekEntries.reduce((m, e) => Math.abs(e.value) > Math.abs(m.value) ? e : m, weekEntries[0])
    : null;
  const chartEntries = lifeView ? sorted : sorted.filter((e) => e.ts >= weekStart);

  // loading
  if (authLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.centered}>
          <span className={styles.loadingText}>loading...</span>
        </div>
      </main>
    );
  }

  if (showOnboarding) {
    return <Onboarding onDone={() => {
      localStorage.setItem("libra_onboarded", "1");
      setShowOnboarding(false);
    }} />;
  }

  // sign in screen
  if (!user) {
    return (
      <main className={styles.main}>
        <div className={styles.centered}>
          <h1 className={styles.title} style={{ marginBottom: "0.5rem" }}>libra</h1>
          <p className={styles.subtitle} style={{ marginBottom: "2rem" }}>your life, plotted</p>
          <button className={styles.googleBtn} onClick={handleSignIn}>
            sign in with google
          </button>
        </div>
      </main>
    );
  }

  // name prompt screen
  if (!userName) {
    return (
      <main className={styles.main}>
        <div className={styles.centered}>
          <h1 className={styles.title} style={{ marginBottom: "0.5rem" }}>libra</h1>
          <p className={styles.subtitle} style={{ marginBottom: "2rem" }}>what should i call you?</p>
          <input
            className={styles.nameInput}
            placeholder="your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetName()}
            autoFocus
          />
          <button className={styles.logBtn} onClick={handleSetName}>
            continue
          </button>
        </div>
      </main>
    );
  }

  // main app
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>libra</h1>
        <span className={styles.subtitle}>{userName.toLowerCase()}&apos;s life log</span>
      </header>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>now</div>
          <div className={styles.statVal} style={{ color: last ? moodColor(last.value) : "var(--text-tertiary)" }}>
            {last ? fmt(last.value) : "—"}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>avg this week</div>
          <div className={styles.statVal} style={{ color: avg !== null ? moodColor(avg) : "var(--text-tertiary)" }}>
            {avg !== null ? fmt(avg) : "—"}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>peak this week</div>
          <div className={styles.statVal} style={{ color: peak ? moodColor(peak.value) : "var(--text-tertiary)" }}>
            {peak ? fmt(peak.value) : "—"}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>entries</div>
          <div className={styles.statVal}>{entries.length}</div>
        </div>
      </div>

      <section className={styles.chartSection}>
        <div className={styles.chartHeader}>
          <span className={styles.sectionLabel}>{lifeView ? "life graph" : "this week"}</span>
          <button className={styles.viewToggle} onClick={() => setLifeView((v) => !v)}>
            {lifeView ? "this week" : "life graph"}
          </button>
        </div>
        <LibraChart entries={chartEntries} lifeView={lifeView} allEntries={sorted} />
      </section>

      <section className={styles.entryPanel}>
        <div className={styles.sliderRow}>
          <span className={styles.sliderEdge}>−10</span>
          <input
            type="range" min={-10} max={10} step={1} value={sliderVal}
            onChange={(e) => setSliderVal(parseInt(e.target.value))}
          />
          <span className={styles.sliderEdge}>+10</span>
          <span className={styles.sliderValue} style={{ color: moodColor(sliderVal) }}>
            {fmt(sliderVal)}
          </span>
        </div>
        <textarea
          className={styles.noteInput}
          placeholder="what's going on?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
        <button className={styles.logBtn} onClick={handleLog} disabled={logging}>
          {logged ? "logged ✓" : logging ? "logging..." : "log it twin"}
        </button>
      </section>

      <section className={styles.logSection}>
        <div className={styles.sectionLabel}>log</div>
        {entries.length === 0 ? (
          <div className={styles.emptyState}>nothing yet — how&apos;s your day going?</div>
        ) : (
          <ul className={styles.entryList}>
            {[...entries].sort((a, b) => b.ts - a.ts).map((e) => (
              <li key={e.id} className={styles.entryItem}>
                <span className={styles.entryTime}>{format(new Date(e.ts), "MMM d, h:mma")}</span>
                <span className={styles.entryVal} style={{ color: moodColor(e.value) }}>{fmt(e.value)}</span>
                <span className={styles.entryNote}>{e.note}</span>
                <button className={styles.deleteBtn} onClick={() => handleDelete(e.id)} aria-label="delete">×</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}