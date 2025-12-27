import { useGame } from "../context/GameContext";
import HeatmapOverlay from "./HeatmapOverlay";

export default function HeatmapBoard() {
  const { heatmap, heatmapSize } = useGame();

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 480,
        aspectRatio: "1 / 1",
        marginTop: 12
      }}
    >
      <img
        src="/reference_board.jpg"
        alt="board"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          borderRadius: "var(--dc-radius)"
        }}
      />
      <HeatmapOverlay heatmap={heatmap} size={heatmapSize} opacity={0.5} />
    </div>
  );
}
