import { useState } from "react";
import DartboardTracker from "./DartboardTracker";
import Scoreboard from "./Scoreboard";
import HeatmapBoard from "./HeatmapBoard";
import GameSetupPanel from "./GameSetupPanel";
import { useGame } from "../context/GameContext";

export default function GameLayout() {
  const { startNewGame } = useGame();
  const [configured, setConfigured] = useState(false);

  function handleStart(config) {
    startNewGame(config);
    setConfigured(true);
  }

  function goFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }

  return (
    <div
      className="dc-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1.3fr",
        height: "100vh",
        background: "var(--dc-bg)",
        position: "relative"
      }}
    >
      <button
        onClick={goFullscreen}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          padding: "8px 12px",
          background: "var(--dc-accent)",
          color: "#000",
          borderRadius: "var(--dc-radius)",
          fontWeight: 700,
          border: "none",
          zIndex: 10
        }}
      >
        ⛶
      </button>

      <div
        className="dc-column"
        style={{
          padding: 16,
          borderRight: "1px solid #222",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxSizing: "border-box"
        }}
      >
        <h2 style={{ color: "var(--dc-accent)", margin: 0 }}>Dartboard Vision</h2>
        <DartboardTracker />
        <HeatmapBoard />
      </div>

      <div
        className="dc-column"
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box"
        }}
      >
        <Scoreboard />
      </div>

      {!configured && <GameSetupPanel onStart={handleStart} />}
    </div>
  );
}
