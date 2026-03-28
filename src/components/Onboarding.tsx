"use client";

import { useState } from "react";
import styles from "./Onboarding.module.css";

interface OnboardingProps {
  onDone: () => void;
}

function Scales() {
  return (
    <svg viewBox="0 0 200 180" width="180" height="180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        .arm { transform-origin: 100px 60px; animation: tilt 4s ease-in-out infinite; }
        .left-pan { animation: panLeft 4s ease-in-out infinite; transform-origin: 55px 120px; }
        .right-pan { animation: panRight 4s ease-in-out infinite; transform-origin: 145px 110px; }
        @keyframes tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-6deg); }
        }
        @keyframes panLeft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes panRight {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(10px); }
        }
      `}</style>

      {/* base */}
      <rect x="93" y="155" width="14" height="3" rx="1.5" fill="#EFD060" opacity="0.6"/>
      {/* pole */}
      <line x1="100" y1="55" x2="100" y2="155" stroke="#EFD060" strokeWidth="1.5" opacity="0.7"/>
      {/* pivot dot */}
      <circle cx="100" cy="57" r="3" fill="#EFD060"/>

      {/* arm */}
      <g className="arm">
        <line x1="45" y1="60" x2="155" y2="60" stroke="#EFD060" strokeWidth="1.5" opacity="0.9"/>
        <circle cx="45" cy="60" r="2.5" fill="#EFD060" opacity="0.8"/>
        <circle cx="155" cy="60" r="2.5" fill="#EFD060" opacity="0.8"/>
      </g>

      {/* left pan strings + pan */}
      <g className="left-pan">
        <line x1="45" y1="60" x2="35" y2="118" stroke="#EFD060" strokeWidth="1" opacity="0.6"/>
        <line x1="45" y1="60" x2="55" y2="118" stroke="#EFD060" strokeWidth="1" opacity="0.6"/>
        <ellipse cx="45" cy="120" rx="18" ry="4" fill="#EFD060" opacity="0.25" stroke="#EFD060" strokeWidth="1" />
      </g>

      {/* right pan strings + pan */}
      <g className="right-pan">
        <line x1="155" y1="60" x2="145" y2="108" stroke="#EFD060" strokeWidth="1" opacity="0.6"/>
        <line x1="155" y1="60" x2="165" y2="108" stroke="#EFD060" strokeWidth="1" opacity="0.6"/>
        <ellipse cx="155" cy="110" rx="18" ry="4" fill="#EFD060" opacity="0.25" stroke="#EFD060" strokeWidth="1" />
      </g>
    </svg>
  );
}

export default function Onboarding({ onDone }: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const [fading, setFading] = useState(false);

  const advance = () => {
    if (fading) return;
    if (screen === 0) {
      setFading(true);
      setTimeout(() => { setScreen(1); setFading(false); }, 400);
    } else {
      setFading(true);
      setTimeout(() => onDone(), 400);
    }
  };

  return (
    <div className={`${styles.wrap} ${fading ? styles.fading : ""}`} onClick={advance}>
      {screen === 0 ? (
        <div className={styles.screen}>
          <Scales />
          <p className={styles.quote1}>the universe exists in a state of equilibrium</p>
          <p className={styles.tap}>tap to continue</p>
        </div>
      ) : (
        <div className={styles.screen}>
          <p className={styles.quote2}>
            and the night is darkest before the dawn
          </p>
          <p className={styles.tap}>tap to continue</p>
        </div>
      )}
    </div>
  );
}