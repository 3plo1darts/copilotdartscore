import { createContext, useContext, useState } from "react";
import { useDartManager } from "../hooks/useDartManager";
import { useHeatmap } from "../hooks/useHeatmap";

const GameContext = createContext(null);

export const GAME_MODES = {
  "301": { startScore: 301, type: "X01" },
  "501": { startScore: 501, type: "X01" },
  "CRICKET": { type: "CRICKET" }
};

export const CRICKET_NUMBERS = [20, 19, 18, 17, 16, 15, 25];

export function GameProvider({ children }) {
  const [gameMode, setGameMode] = useState("501");

  const [players, setPlayers] = useState([
    { id: 1, name: "PLAYER 1" },
    { id: 2, name: "PLAYER 2" }
  ]);

  const [x01State, setX01State] = useState(() =>
    initX01State(players, GAME_MODES["501"].startScore)
  );
  const [cricketState, setCricketState] = useState(() =>
    initCricketState(players)
  );

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [currentSet, setCurrentSet] = useState(1);
  const [currentLeg, setCurrentLeg] = useState(1);
  const [legsToWinSet, setLegsToWinSet] = useState(3);
  const [setsToWinMatch, setSetsToWinMatch] = useState(1);

  const [setWins, setSetWins] = useState(() =>
    players.map(p => ({ playerId: p.id, sets: 0 }))
  );
  const [legWins, setLegWins] = useState(() =>
    players.map(p => ({ playerId: p.id, legs: 0 }))
  );

  const { darts, addDart, resetTurn } = useDartManager(3);
  const { heatmap, addHit, size: heatmapSize } = useHeatmap(1000);

  function initX01State(playerList, startScore) {
    return playerList.map(p => ({
      playerId: p.id,
      score: startScore,
      dartsThrown: 0,
      throws: []
    }));
  }

  function initCricketState(playerList) {
    return playerList.map(p => ({
      playerId: p.id,
      hits: CRICKET_NUMBERS.reduce((acc, n) => {
        acc[n] = 0;
        return acc;
      }, {}),
      score: 0,
      throws: []
    }));
  }

  function startNewGame({ mode, playersConfig }) {
    const modeCfg = GAME_MODES[mode];
    setGameMode(mode);

    const normalizedPlayers = playersConfig.map((p, idx) => ({
      id: idx + 1,
      name: p.name.trim() || `PLAYER ${idx + 1}`
    }));
    setPlayers(normalizedPlayers);

    if (modeCfg.type === "X01") {
      setX01State(initX01State(normalizedPlayers, modeCfg.startScore));
      setCricketState(initCricketState(normalizedPlayers));
    } else {
      setCricketState(initCricketState(normalizedPlayers));
      setX01State(initX01State(normalizedPlayers, GAME_MODES["501"].startScore));
    }

    setCurrentPlayerIndex(0);
    setCurrentSet(1);
    setCurrentLeg(1);
    setSetWins(normalizedPlayers.map(p => ({ playerId: p.id, sets: 0 })));
    setLegWins(normalizedPlayers.map(p => ({ playerId: p.id, legs: 0 })));
    resetTurn();
  }

  function startNewLeg() {
    const modeCfg = GAME_MODES[gameMode];
    if (modeCfg.type === "X01") {
      setX01State(initX01State(players, modeCfg.startScore));
    } else {
      setCricketState(initCricketState(players));
    }
    setCurrentLeg(prev => prev + 1);
    setCurrentPlayerIndex(0);
    resetTurn();
  }

  function checkLegWin() {
    const modeCfg = GAME_MODES[gameMode];
    if (modeCfg.type === "X01") {
      const winner = x01State.find(p => p.score === 0);
      if (!winner) return;

      setLegWins(prev =>
        prev.map(l =>
          l.playerId === winner.playerId ? { ...l, legs: l.legs + 1 } : l
        )
      );

      const newLegCount =
        (legWins.find(l => l.playerId === winner.playerId)?.legs || 0) + 1;

      if (newLegCount >= legsToWinSet) {
        setSetWins(prev =>
          prev.map(s =>
            s.playerId === winner.playerId ? { ...s, sets: s.sets + 1 } : s
          )
        );

        setLegWins(players.map(p => ({ playerId: p.id, legs: 0 })));
        setCurrentSet(prev => prev + 1);
      }

      startNewLeg();
    } else {
      // Per Cricket: qui potresti aggiungere logica per determinare il vincitore del leg
    }
  }

  function registerDart({ score, sector, multiplier, tipRef, tipCamera }) {
    const currentPlayerId = players[currentPlayerIndex].id;

    addDart({ score, tipRef, tipCamera });
    addHit(tipRef.x, tipRef.y);

    const modeCfg = GAME_MODES[gameMode];

    if (modeCfg.type === "X01") {
      updateX01(currentPlayerId, score, modeCfg.startScore);
    } else {
      updateCricket(currentPlayerId, sector, multiplier, score);
    }

    if (modeCfg.type === "X01") {
      const winner = x01State.find(p => p.playerId === currentPlayerId && p.score === 0);
      if (winner) {
        checkLegWin();
        return;
      }
    }

    if (darts.length + 1 === 3) {
      setCurrentPlayerIndex(prev => (prev + 1) % players.length);
      resetTurn();
    }
  }

  function updateX01(playerId, score, startScore) {
    setX01State(prev =>
      prev.map(p => {
        if (p.playerId !== playerId) return p;
        const newScore = Math.max(0, p.score - score);
        return {
          ...p,
          score: newScore,
          dartsThrown: p.dartsThrown + 1,
          throws: [{ value: score, ts: Date.now() }, ...p.throws].slice(0, 10)
        };
      })
    );
  }

  function updateCricket(playerId, sector, multiplier, score) {
    if (!CRICKET_NUMBERS.includes(sector)) return;

    setCricketState(prev => {
      const copy = prev.map(p => ({ ...p, hits: { ...p.hits } }));
      const me = copy.find(p => p.playerId === playerId);
      if (!me) return prev;

      let hitsToAdd = multiplier;
      const currentHits = me.hits[sector];
      const newHits = Math.min(3, currentHits + hitsToAdd);
      const overflow = Math.max(0, currentHits + hitsToAdd - 3);

      me.hits[sector] = newHits;

      const othersNotClosed = copy.some(
        p => p.playerId !== playerId && p.hits[sector] < 3
      );

      if (overflow > 0 && othersNotClosed) {
        me.score += overflow * (sector === 25 ? 25 : sector);
      }

      me.throws = [
        { value: score, sector, multiplier, ts: Date.now() },
        ...me.throws
      ].slice(0, 10);

      return copy;
    });
  }

  return (
    <GameContext.Provider
      value={{
        gameMode,
        GAME_MODES,
        CRICKET_NUMBERS,
        players,
        currentPlayerIndex,
        x01State,
        cricketState,
        heatmap,
        heatmapSize,
        currentSet,
        currentLeg,
        setWins,
        legWins,
        legsToWinSet,
        setsToWinMatch,
        startNewGame,
        registerDart
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
