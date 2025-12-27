import { useRef, useEffect, useState } from "react";
import WebcamFeed from "./WebcamFeed";
import DartboardCanvas from "./DartboardCanvas";

import { useOpenCV } from "../hooks/useOpenCV";
import { useDartboardCalibration } from "../hooks/useDartboardCalibration";
import { useDartDetection } from "../hooks/useDartDetection";
import { useDartScoring } from "../hooks/useDartScoring";
import { computeHomography, transformPoint } from "../utils/homography";
import { useGame } from "../context/GameContext";

export default function DartboardTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const cvReady = useOpenCV();
  const refData = useDartboardCalibration(cvReady);
  const { findDartTip } = useDartDetection();
  const { computeHitInfo } = useDartScoring();
  const { registerDart } = useGame();

  const [backgroundFrame, setBackgroundFrame] = useState(null);

  useEffect(() => {
    if (!cvReady) return;
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  }, [cvReady]);

  const captureBackground = () => {
    const cv = window.cv;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const bg = cv.imread(canvas);
    setBackgroundFrame(bg);
  };

  useEffect(() => {
    if (!cvReady || !refData) return;

    const cv = window.cv;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const process = () => {
      if (!videoRef.current) {
        requestAnimationFrame(process);
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const frame = cv.imread(canvas);

      try {
        const orb = new cv.ORB();
        const kp = new cv.KeyPointVector();
        const desc = new cv.Mat();
        orb.detectAndCompute(frame, new cv.Mat(), kp, desc);

        if (desc.rows > 0 && refData.desc.rows > 0) {
          const bf = new cv.BFMatcher(cv.NORM_HAMMING, true);
          const matches = new cv.DMatchVector();
          bf.match(desc, refData.desc, matches);

          if (matches.size() > 10) {
            const H = computeHomography(cv, kp, refData.kp, matches);

            if (H && backgroundFrame) {
              const tip = findDartTip(cv, frame, backgroundFrame, canvas);

              if (tip) {
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(tip.x, tip.y, 5, 0, 2 * Math.PI);
                ctx.fill();

                const mapped = transformPoint(cv, H, tip);
                const hit = computeHitInfo(mapped);

                if (hit.multiplier > 0) {
                  registerDart({
                    score: hit.score,
                    sector: hit.sector,
                    multiplier: hit.multiplier,
                    tipRef: mapped,
                    tipCamera: tip
                  });
                }
              }

              H.delete();
            }

            matches.delete();
          }
        }

        desc.delete();
        kp.delete();
      } catch (err) {
        console.error(err);
      } finally {
        frame.delete();
        requestAnimationFrame(process);
      }
    };

    requestAnimationFrame(process);
  }, [cvReady, refData, backgroundFrame, findDartTip, computeHitInfo, registerDart]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        onClick={captureBackground}
        style={{
          alignSelf: "flex-start",
          padding: "8px 12px",
          background: "#222",
          color: "var(--dc-text)",
          borderRadius: "var(--dc-radius)"
        }}
      >
        Cattura background
      </button>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <WebcamFeed videoRef={videoRef} />
        <DartboardCanvas canvasRef={canvasRef} />
      </div>
    </div>
  );
}
