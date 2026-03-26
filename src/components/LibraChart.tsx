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

export function moodColor(v: number): string {
  if (v >= 7) return "#1D9E75";
  if (v >= 3) return "#639922";
  if (v >= 0) return "#BA7517";
  if (v >= -3) return "#D85A30";
  if (v >= -7) return "#D4537E";
  return "#A32D2D";
}

const glowPlugin = {
  id: "glowDots",
  afterDatasetsDraw(chart: Chart) {
    const ctx = chart.ctx;
    const dataset = chart.data.datasets[0] as any;
    const meta = chart.getDatasetMeta(0);
    const values = dataset.data as number[];

    meta.data.forEach((point, i) => {
      const color = moodColor(values[i]);
      const { x, y } = point.getProps(["x", "y"], true);
      const isLast = i === values.length - 1;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, isLast ? 10 : 7, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, isLast ? 10 : 7);
      grad.addColorStop(0, color + "55");
      grad.addColorStop(1, color + "00");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, isLast ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isLast ? 12 : 6;
      ctx.fill();
      ctx.restore();
    });
  },
};

Chart.register(glowPlugin);

interface LibraChartProps {
  entries: Entry[];
  lifeView: boolean;
}

export default function LibraChart({ entries, lifeView }: LibraChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    const sorted = [...entries].sort((a, b) => a.ts - b.ts);
    const labels = sorted.map((e) => format(new Date(e.ts), "MMM d, h:mma"));
    const values = sorted.map((e) => e.value);

    const minWidth = wrapperRef.current.clientWidth;
    const scrollWidth = Math.max(minWidth, sorted.length * 60);
    canvasRef.current.style.width = scrollWidth + "px";
    canvasRef.current.width = scrollWidth;

    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = values;
      chartRef.current.resize(scrollWidth, 280);
      chartRef.current.update();
      wrapperRef.current.scrollLeft = wrapperRef.current.scrollWidth;
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "rgba(136,135,128,0.25)",
            borderWidth: 1,
            pointBackgroundColor: "transparent",
            pointBorderColor: "transparent",
            pointRadius: 0,
            pointHoverRadius: 0,
            tension: 0.42,
            fill: {
              target: { value: 0 },
              above: "rgba(29,158,117,0.06)",
              below: "rgba(212,83,126,0.06)",
            },
          } as any,
        ],
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => labels[items[0].dataIndex],
              label: (item) => {
                const e = sorted[item.dataIndex];
                const v = e.value;
                const prefix = v > 0 ? "+" : "";
                return e.note ? `${prefix}${v}  ·  ${e.note}` : `${prefix}${v}`;
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
                  ? "rgba(136,135,128,0.3)"
                  : "rgba(136,135,128,0.07)",
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
            grid: { color: "rgba(136,135,128,0.04)" },
            ticks: {
              color: "#4a4a47",
              font: { family: "'DM Mono', monospace", size: 10 },
              maxRotation: 30,
              autoSkip: true,
              maxTicksLimit: lifeView ? 12 : 8,
            },
            border: { display: false },
          },
        },
      },
    });

    wrapperRef.current.scrollLeft = wrapperRef.current.scrollWidth;

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [entries, lifeView]);

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
        border: "0.5px dashed rgba(255,255,255,0.07)",
        borderRadius: "14px",
      }}>
        your graph will appear here
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: 280,
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(136,135,128,0.2) transparent",
        borderRadius: "14px",
      }}
    >
      <canvas ref={canvasRef} height={280} />
    </div>
  );
}