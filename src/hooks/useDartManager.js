import { useState } from "react";

export function useDartManager(maxDarts = 3) {
  const [darts, setDarts] = useState([]);
  const [turns, setTurns] = useState([]);

  function addDart(dart) {
    setDarts(prev => {
      const updated = [...prev, dart];
      if (updated.length === maxDarts) {
        setTurns(t => [...t, updated]);
        return [];
      }
      return updated;
    });
  }

  function resetTurn() {
    setDarts([]);
  }

  return { darts, turns, addDart, resetTurn };
}
