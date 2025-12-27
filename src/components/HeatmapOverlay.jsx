import { useEffect, useRef } from "react";

export default function HeatmapOverlay({ heatmap, size, opacity = 0.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!heatmap) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = ctx.createImageData(size, size);

    let max = 0;
    for (let i = 0; i < heatmap.length; i++) {
      if (heatmap[i] > max) max = heatmap[i];
    }
    if (max === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    for (let i = 0; i < heatmap.length; i++) {
      const v = heatmap[i] / max;
      const idx = i * 4;

      const r = Math.floor(255 * v);
      const g = 0;
      const b = Math.floor(255 * (1 - v));

      img.data[idx] = r;
      img.data[idx + 1] = g;
      img.data[idx + 2] = b;
      img.data[idx + 3] = Math.floor(255 * opacity);
    }

    ctx.putImageData(img, 0, 0);
  }, [heatmap, size, opacity]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none"
      }}
    />
  );
}
