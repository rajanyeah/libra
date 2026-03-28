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

interface LibraChartProps {
  entries: Entry[];
  lifeView: boolean;
  allEntries: Entry[];
}

export default function LibraChart({ entries, lifeView, allEntries }: LibraChartProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const animRef = useRef<number>(0);
  const pulseRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current || !wrapperRef.current) return;

    const data = lifeView
      ? [...allEntries].sort((a, b) => a.ts - b.ts)
      : [...entries].sort((a, b) => a.ts - b.ts);

    const labels = data.map((e) => format(new Date(e.ts), "MMM d, h:mma"));
    const values = data.map((e) => e.value);

    const containerWidth = wrapperRef.current.clientWidth;
    const scrollWidth = lifeView ? containerWidth : Math.max(containerWidth, data.length * 64);
    canvasRef.current.style.width = scrollWidth + "px";
    canvasRef.current.width = scrollWidth;

    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = values;
      chartRef.current.resize(scrollWidth, 280);
      chartRef.current.update("none");
      setTimeout(() => {
        wrapperRef.current!.scrollLeft = wrapperRef.current!.scrollWidth;
      }, 50);
      return;
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: "rgba(136,135,128,0.3)",
            borderWidth: 1.5,
            pointBackgroundColor: values.map(moodColor),
            pointBorderColor: values.map((_, i) => i === values.length - 1 ? "transparent" : "transparent"),
            pointRadius: values.map((_, i) => lifeView ? 0 : (i === values.length - 1 ? 5 : 5)),
            pointHoverRadius: lifeView ? 0 : 7,
            tension: 0.42,
            fill: {
              target: { value: 0 },
              above: "rgba(29,158,117,0.07)",
              below: "rgba(212,83,126,0.07)",
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
                const e = data[item.dataIndex];
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
            min: -10,
            max: 10,
            grid: {
              color: (ctx) =>
                ctx.tick.value === 0
                  ? "rgba(136,135,128,0.3)"
                  : "rgba(136,135,128,0.07)",
              lineWidth: (ctx) => (ctx.tick.value === 0 ? 1 : 0.5),
            },
            ticks: {
              count: 5,
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
              maxRotation: 45,
              autoSkip: true,
              maxTicksLimit: 5,
              display: false,
            },
            border: { display: false },
          },
        },
      },
    });

    setTimeout(() => {
      wrapperRef.current!.scrollLeft = wrapperRef.current!.scrollWidth;
    }, 50);

    // pulse ring animation on latest dot
    const animate = () => {
      pulseRef.current = (pulseRef.current + 0.03) % 1;
      const chart = chartRef.current;
      if (!chart || !canvasRef.current) return;

      const meta = chart.getDatasetMeta(0);
      const lastPoint = meta.data[meta.data.length - 1];
      if (!lastPoint) { animRef.current = requestAnimationFrame(animate); return; }

      const { x, y } = lastPoint.getProps(["x", "y"], true);
      const lastVal = (chart.data.datasets[0].data as number[])[meta.data.length - 1];
      const color = moodColor(lastVal);

      chart.draw();

      const ctx = chart.ctx;
      const radius = 6 + pulseRef.current * 14;
      const alpha = (1 - pulseRef.current) * 0.6;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [entries, allEntries, lifeView]);

  if (allEntries.length === 0) {
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