import { useState } from "react";

export function useHeatmap(size = 1000) {
  const [heatmap, setHeatmap] = useState(
    () => new Float32Array(size * size).fill(0)
  );

  function addHit(x, y) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= size || iy >= size) return;

    const index = iy * size + ix;

    setHeatmap(prev => {
      const copy = new Float32Array(prev);
      copy[index] += 1;
      return copy;
    });
  }

  return { heatmap, addHit, size };
}
