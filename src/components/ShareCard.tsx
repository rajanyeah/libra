"use client";

import { useEffect, useRef } from "react";
import LibraChart, { moodColor } from "./LibraChart";
import type { Entry } from "@/lib/firebase";
import styles from "./ShareCard.module.css";

function fmt(v: number): string {
  return (v > 0 ? "+" : "") + v;
}

interface ShareCardProps {
  onClose: () => void;
  entries: Entry[];
  lifeView: boolean;
  allEntries: Entry[];
  userName: string;
  avg: number | null;
  peak: Entry | null;
}

export default function ShareCard({
  onClose,
  entries,
  lifeView,
  allEntries,
  userName,
  avg,
  peak,
}: ShareCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className={styles.overlay}>
      <div className={styles.card} ref={ref}>
        <div className={styles.header}>
          <span className={styles.title}>libra</span>
          <span className={styles.name}>{userName.toLowerCase()}&apos;s life log</span>
        </div>

        <div className={styles.graph}>
          <LibraChart entries={entries} lifeView={lifeView} allEntries={allEntries} />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>avg this week</div>
            <div className={styles.statVal} style={{ color: avg !== null ? moodColor(avg) : "var(--text-tertiary)" }}>
              {avg !== null ? fmt(avg) : "—"}
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>peak this week</div>
            <div className={styles.statVal} style={{ color: peak ? moodColor(peak.value) : "var(--text-tertiary)" }}>
              {peak ? fmt(peak.value) : "—"}
            </div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>entries</div>
            <div className={styles.statVal}>{allEntries.length}</div>
          </div>
        </div>

        <div className={styles.footer}>libralog.vercel.app</div>

        <button className={styles.close} onClick={onClose}>close</button>
      </div>
    </div>
  );
}