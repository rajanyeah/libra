"use client";

import { useState, useEffect } from "react";
import styles from "./Onboarding.module.css";

interface OnboardingProps {
  onDone: () => void;
}

function useTyping(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => setDone(true), 400);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

function Scales() {
  return (
    <svg viewBox="0 0 200 200" width="200" height="200" fill="none">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <style>{`
        .whole {
          transform-origin: 100px 70px;
          animation: tilt 5s ease-in-out infinite;
        }
        @keyframes tilt {
          0%, 100% { transform: rotate(4deg); }
          50% { transform: rotate(-4deg); }
        }
      `}</style>
      <line x1="100" y1="70" x2="100" y2="170" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
      <line x1="82" y1="170" x2="118" y2="170" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round"/>
      <g className="whole" filter="url(#glow)">
        <circle cx="100" cy="70" r="2.5" fill="rgba(255,255,255,0.7)"/>
        <line x1="40" y1="70" x2="160" y2="70" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="40" y1="70" x2="28" y2="130" stroke="rgba(255,255,255,0.25)"/>
        <line x1="40" y1="70" x2="52" y2="130" stroke="rgba(255,255,255,0.25)"/>
        <path d="M22 132 Q40 140 58 132" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" fill="rgba(255,255,255,0.05)" strokeLinecap="round"/>
        <line x1="160" y1="70" x2="148" y2="130" stroke="rgba(255,255,255,0.25)"/>
        <line x1="160" y1="70" x2="172" y2="130" stroke="rgba(255,255,255,0.25)"/>
        <path d="M142 132 Q160 140 178 132" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" fill="rgba(255,255,255,0.05)" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function Screen1({ onAdvance }: { onAdvance: () => void }) {
  const { displayed, done } = useTyping("the universe exists in a state of equilibrium", 40);
  return (
    <div className={styles.screen} onClick={onAdvance}>
      <Scales />
      <p className={`${styles.quote1} ${done ? styles.glowing : ""}`}>
        {displayed}
        {!done && <span className={styles.cursor}>|</span>}
      </p>
      <p className={`${styles.tap} ${done ? styles.tapVisible : ""}`}>tap to continue</p>
    </div>
  );
}

function Screen2({ onAdvance }: { onAdvance: () => void }) {
  const { displayed, done } = useTyping("and the night is darkest before the dawn", 45);
  return (
    <div className={styles.screen} onClick={onAdvance}>
      <p className={`${styles.quote2} ${done ? styles.glowing : ""}`}>
        {displayed}
        {!done && <span className={styles.cursor}>|</span>}
      </p>
      <p className={`${styles.tap} ${done ? styles.tapVisible : ""}`}>tap to continue</p>
    </div>
  );
}

export default function Onboarding({ onDone }: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const [fading, setFading] = useState(false);

  const advance = () => {
    if (fading) return;
    if (screen === 0) {
      setFading(true);
      setTimeout(() => { setScreen(1); setFading(false); }, 500);
    } else {
      setFading(true);
      setTimeout(() => onDone(), 500);
    }
  };

  return (
    <div className={`${styles.wrap} ${fading ? styles.fading : ""}`}>
      {screen === 0
        ? <Screen1 onAdvance={advance} />
        : <Screen2 onAdvance={advance} />
      }
    </div>
  );
}