import { useGame } from "../context/GameContext";

export default function Scoreboard() {
  const {
    gameMode,
    GAME_MODES,
    players,
    currentPlayerIndex,
    x01State,
    cricketState,
    CRICKET_NUMBERS,
    currentSet,
    currentLeg
  } = useGame();

  const isX01 = GAME_MODES[gameMode].type === "X01";
  const startScore = isX01 ? GAME_MODES[gameMode].startScore : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span>Set {currentSet} · Leg {currentLeg}</span>
        <span>{gameMode}</span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {players.map((p, idx) => (
          <PlayerPanel
            key={p.id}
            player={p}
            active={idx === currentPlayerIndex}
            isX01={isX01}
            x01State={x01State.find(s => s.playerId === p.id)}
            cricketState={cricketState.find(s => s.playerId === p.id)}
            startScore={startScore}
          />
        ))}
      </div>

      {!isX01 && (
        <CricketGrid
          players={players}
          cricketState={cricketState}
          numbers={CRICKET_NUMBERS}
        />
      )}
    </div>
  );
}

function PlayerPanel({ player, active, isX01, x01State, cricketState, startScore }) {
  const mainScore = isX01 ? x01State?.score ?? 0 : cricketState?.score ?? 0;
  const lastThrow = (isX01 ? x01State : cricketState)?.throws[0];

  let threeDartAvg = null;
  if (isX01 && x01State && x01State.dartsThrown > 0) {
    const scored = startScore - x01State.score;
    const perDart = scored / x01State.dartsThrown;
    threeDartAvg = (perDart * 3).toFixed(1);
  }

  return (
    <div
      style={{
        flex: 1,
        background: "var(--dc-panel)",
        borderRadius: "var(--dc-radius)",
        padding: 12,
        border: active ? "2px solid var(--dc-accent)" : "2px solid #222",
        boxShadow: active ? "0 0 10px rgba(248,196,0,0.5)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 4
      }}
    >
      <div
        style={{
          fontSize: 14,
          letterSpacing: 1,
          color: active ? "var(--dc-accent)" : "var(--dc-muted)"
        }}
      >
        {player.name}
      </div>

      <div
        className="score-big"
        style={{
          fontSize: 56,
          fontWeight: 700,
          lineHeight: 1,
          color: isX01 && mainScore <= 170
            ? "var(--dc-accent-red)"
            : "var(--dc-text)"
        }}
      >
        {mainScore}
      </div>

      <div style={{ fontSize: 12, color: "var(--dc-muted)" }}>
        Last:{" "}
        {lastThrow
          ? isX01
            ? lastThrow.value
            : `${lastThrow.value} (${lastThrow.multiplier}x${lastThrow.sector})`
          : "-"}
      </div>

      {isX01 && (
        <div style={{ fontSize: 12, color: "var(--dc-accent)" }}>
          3DA: {threeDartAvg ?? "-"}
        </div>
      )}
    </div>
  );
}

function CricketGrid({ players, cricketState, numbers }) {
  return (
    <div
      style={{
        background: "var(--dc-panel)",
        borderRadius: "var(--dc-radius)",
        padding: 8,
        fontSize: 13,
        marginTop: 8
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "4px" }}>#</th>
            {players.map(p => (
              <th key={p.id} style={{ textAlign: "center", padding: "4px" }}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {numbers.map(n => (
            <tr key={n}>
              <td style={{ padding: "4px" }}>{n === 25 ? "BULL" : n}</td>
              {players.map(p => {
                const state = cricketState.find(s => s.playerId === p.id);
                const hits = state?.hits[n] ?? 0;
                const marks = "✕".repeat(hits).padEnd(3, "·");
                return (
                  <td
                    key={p.id}
                    style={{
                      textAlign: "center",
                      padding: "4px",
                      color: hits >= 3 ? "var(--dc-accent-green)" : "var(--dc-text)"
                    }}
                  >
                    {marks}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

