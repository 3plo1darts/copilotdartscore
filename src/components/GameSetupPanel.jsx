import { useState } from "react";
import { useGame } from "../context/GameContext";

export default function GameSetupPanel({ onStart }) {
  const { GAME_MODES } = useGame();
  const [mode, setMode] = useState("501");
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState(["PLAYER 1", "PLAYER 2", "PLAYER 3", "PLAYER 4"]);

  function handleStart() {
    const playersConfig = names.slice(0, numPlayers).map(name => ({ name }));
    onStart({ mode, playersConfig });
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2 style={styles.title}>Nuova Partita</h2>

        <div style={styles.section}>
          <div style={styles.label}>Modalità</div>
          <div style={styles.row}>
            {Object.keys(GAME_MODES).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  ...styles.modeButton,
                  background: mode === m ? "var(--dc-accent)" : "var(--dc-panel-light)",
                  color: mode === m ? "#000" : "var(--dc-text)"
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Giocatori</div>
          <div style={styles.row}>
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setNumPlayers(n)}
                style={{
                  ...styles.modeButton,
                  background: numPlayers === n ? "var(--dc-accent)" : "var(--dc-panel-light)",
                  color: numPlayers === n ? "#000" : "var(--dc-text)"
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Nomi giocatori</div>
          {Array.from({ length: numPlayers }).map((_, i) => (
            <input
              key={i}
              value={names[i]}
              onChange={e => {
                const v = e.target.value;
                setNames(prev => {
                  const copy = [...prev];
                  copy[i] = v;
                  return copy;
                });
              }}
              style={styles.input}
            />
          ))}
        </div>

        <button onClick={handleStart} style={styles.startButton}>
          Inizia Partita
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999
  },
  card: {
    width: "92%",
    maxWidth: 420,
    background: "var(--dc-panel)",
    padding: 20,
    borderRadius: "var(--dc-radius)",
    boxShadow: "var(--dc-shadow)",
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  title: {
    margin: 0,
    fontSize: 22,
    color: "var(--dc-accent)"
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  label: {
    fontSize: 14,
    color: "var(--dc-muted)"
  },
  row: {
    display: "flex",
    gap: 8
  },
  modeButton: {
    flex: 1,
    padding: "10px 0",
    borderRadius: "var(--dc-radius)",
    fontSize: 15,
    border: "none",
    cursor: "pointer"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--dc-radius)",
    border: "1px solid #333",
    background: "#111",
    color: "var(--dc-text)",
    fontSize: 15
  },
  startButton: {
    width: "100%",
    padding: "12px 0",
    background: "var(--dc-accent-green)",
    color: "#000",
    fontWeight: 700,
    fontSize: 17,
    borderRadius: "var(--dc-radius)",
    border: "none",
    cursor: "pointer"
  }
};
