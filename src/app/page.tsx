"use client";

import { useState, useEffect, useCallback } from "react";
import { addEntry, deleteEntry, subscribeToEntries, type Entry } from "@/lib/firebase";
import LibraChart from "@/components/LibraChart";
import { format } from "date-fns";
import styles from "./page.module.css";

function moodColor(v: number): string {
  if (v >= 7) return "#1D9E75";
  if (v >= 3) return "#639922";
  if (v >= 0) return "#BA7517";
  if (v >= -3) return "#D85A30";
  if (v >= -7) return "#D4537E";
  return "#A32D2D";
}

function fmt(v: number): string {
  return (v > 0 ? "+" : "") + v;
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sliderVal, setSliderVal] = useState(0);
  const [note, setNote] = useState("");
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const unsub = subscribeToEntries(setEntries);
    return unsub;
  }, []);

  const handleLog = useCallback(async () => {
    if (logging) return;
    setLogging(true);
    try {
      await addEntry(sliderVal, note.trim());
      setNote("");
      setSliderVal(0);
      setLogged(true);
      setTimeout(() => setLogged(false), 1500);
    } finally {
      setLogging(false);
    }
  }, [sliderVal, note, logging]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteEntry(id);
  }, []);

  const sorted = [...entries].sort((a, b) => a.ts - b.ts);
  const last = sorted[sorted.length - 1];

  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekEntries = entries.filter(e => e.ts >= startOfWeek.getTime());

  const avg =
    weekEntries.length > 0
      ? Math.round((weekEntries.reduce((s, e) => s + e.value, 0) / weekEntries.length) * 10) / 10
      : null;
  const peak =
    weekEntries.length > 0
      ? weekEntries.reduce((m, e) => Math.abs(e.value) > Math.abs(m.value) ? e : m, weekEntries[0])
      : null;

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>libra</h1>
        <span className={styles.subtitle}>rajanya's life log</span>
      </header>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>now</div>
          <div
            className={styles.statVal}
            style={{ color: last ? moodColor(last.value) : "var(--text-tertiary)" }}
          >
            {last ? fmt(last.value) : "—"}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>avg</div>
          <div
            className={styles.statVal}
            style={{ color: avg !== null ? moodColor(avg) : "var(--text-tertiary)" }}
          >
            {avg !== null ? fmt(avg) : "—"}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>peak</div>
          <div
            className={styles.statVal}
            style={{ color: peak ? moodColor(peak.value) : "var(--text-tertiary)" }}
          >
            {peak ? fmt(peak.value) : "—"}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>entries</div>
          <div className={styles.statVal}>{entries.length}</div>
        </div>
      </div>

      {/* Chart */}
      <section className={styles.chartSection}>
        <LibraChart entries={sorted} />
      </section>

      {/* Entry panel */}
      <section className={styles.entryPanel}>
        <div className={styles.sliderRow}>
          <span className={styles.sliderEdge}>−10</span>
          <input
            type="range"
            min={-10}
            max={10}
            step={1}
            value={sliderVal}
            onChange={(e) => setSliderVal(parseInt(e.target.value))}
          />
          <span className={styles.sliderEdge}>+10</span>
          <span
            className={styles.sliderValue}
            style={{ color: moodColor(sliderVal) }}
          >
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

        <button
          className={styles.logBtn}
          onClick={handleLog}
          disabled={logging}
        >
          {logged ? "logged ✓" : logging ? "logging..." : "log it twin"}
        </button>
      </section>

      {/* Entry list */}
      <section className={styles.logSection}>
        <div className={styles.sectionLabel}>log</div>
        {entries.length === 0 ? (
          <div className={styles.emptyState}>
            nothing yet — how&apos;s your day going?
          </div>
        ) : (
          <ul className={styles.entryList}>
            {[...entries]
              .sort((a, b) => b.ts - a.ts)
              .map((e) => (
                <li key={e.id} className={styles.entryItem}>
                  <span className={styles.entryTime}>
                    {format(new Date(e.ts), "MMM d, h:mma")}
                  </span>
                  <span
                    className={styles.entryVal}
                    style={{ color: moodColor(e.value) }}
                  >
                    {fmt(e.value)}
                  </span>
                  <span className={styles.entryNote}>{e.note}</span>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(e.id)}
                    aria-label="delete"
                  >
                    ×
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  );
}
