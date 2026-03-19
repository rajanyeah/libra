"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";
import type { Entry } from "@/lib/firebase";
import { format } from "date-fns";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

function moodColor(v: number): string {
  if (v >= 7) return "#1D9E75";
  if (v >= 3) return "#639922";
  if (v >= 0) return "#BA7517";
  if (v >= -3) return "#D85A30";
  if (v >= -7) return "#D4537E";
  return "#A32D2D";
}

export default function LibraChart({ entries }: { entries: Entry[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const sorted = [...entries].sort((a, b) => a.ts - b.ts);
    const labels = sorted.map((e) => format(new Date(e.ts), "MMM d, h:mma"));
    const values = sorted.map((e) => e.value);
    const colors = values.map(moodColor);

    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = values;
      (chartRef.current.data.datasets[0] as any).pointBackgroundColor = colors;
      (chartRef.current.data.datasets[0] as any).pointBorderColor = colors;
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "rgba(136,135,128,0.4)",
            borderWidth: 1.5,
            pointBackgroundColor: colors,
            pointBorderColor: colors,
            pointRadius: 7,
            pointHoverRadius: 10,
            tension: 0.38,
            fill: {
              target: { value: 0 },
              above: "rgba(29,158,117,0.07)",
              below: "rgba(212,83,126,0.07)",
            },
          } as any,
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => labels[items[0].dataIndex],
              label: (item) => {
                const e = sorted[item.dataIndex];
                const v = e.value;
                const prefix = v > 0 ? "+" : "";
                return e.note
                  ? `${prefix}${v}  ·  ${e.note}`
                  : `${prefix}${v}`;
              },
            },
            backgroundColor: "#1c1c19",
            titleColor: "#888780",
            bodyColor: "#e8e6df",
            borderColor: "rgba(255,255,255,0.08)",
            borderWidth: 0.5,
            padding: 12,
            titleFont: { family: "'DM Mono', monospace", size: 11 },
            bodyFont: { family: "'DM Mono', monospace", size: 12, weight: 500 },
          },
        },
        scales: {
          y: {
            min: -11,
            max: 11,
            grid: {
              color: (ctx) =>
                ctx.tick.value === 0
                  ? "rgba(136,135,128,0.35)"
                  : "rgba(136,135,128,0.08)",
              lineWidth: (ctx) => (ctx.tick.value === 0 ? 1 : 0.5),
            },
            ticks: {
              stepSize: 5,
              color: "#4a4a47",
              font: { family: "'DM Mono', monospace", size: 10 },
              callback: (v) => (Number(v) > 0 ? "+" + v : String(v)),
            },
            border: { display: false },
          },
          x: {
            grid: { color: "rgba(136,135,128,0.05)" },
            ticks: {
              color: "#4a4a47",
              font: { family: "'DM Mono', monospace", size: 10 },
              maxRotation: 30,
              autoSkip: true,
              maxTicksLimit: 8,
            },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div style={{
        height: 280,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-tertiary)",
        fontStyle: "italic",
        fontSize: 13,
        border: "0.5px dashed var(--border)",
        borderRadius: "var(--radius-lg)",
      }}>
        your graph will appear here
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: 280 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
