"use client";

import { useState } from "react";
import styles from "./Onboarding.module.css";

interface OnboardingProps {
  onDone: () => void;
}

export default function Onboarding({ onDone }: OnboardingProps) {
  const [screen, setScreen] = useState(0);
  const [fading, setFading] = useState(false);

  const advance = () => {
    if (fading) return;
    if (screen === 0) {
      setFading(true);
      setTimeout(() => {
        setScreen(1);
        setFading(false);
      }, 400);
    } else {
      setFading(true);
      setTimeout(() => {
        onDone();
      }, 400);
    }
  };

  return (
    <div
      className={`${styles.wrap} ${fading ? styles.fading : ""}`}
      onClick={advance}
    >
      {screen === 0 ? (
        <div className={styles.screen1}>
          <img
            src="/it_doesn_t_matter.png"
            alt="scales"
            className={styles.image}
          />
          <div className={styles.overlay}>
            <p className={styles.quote1}>
              the universe exists in a state of equilibrium
            </p>
            <p className={styles.tap}>tap to continue</p>
          </div>
        </div>
      ) : (
        <div className={styles.screen2}>
          <p className={styles.quote2}>
            after every sadness you&apos;re going to get happiness that stems
            from the things you learnt during bad times
          </p>
          <p className={styles.tap}>tap to continue</p>
        </div>
      )}
    </div>
  );
}