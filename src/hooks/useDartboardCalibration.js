import { useEffect, useState } from "react";

export function useDartboardCalibration(cvReady) {
  const [refData, setRefData] = useState(null);

  useEffect(() => {
    if (!cvReady) return;

    const img = new Image();
    img.src = "/reference_board.jpg";
    img.onload = () => {
      const cv = window.cv;
      const refMat = cv.imread(img);

      const orb = new cv.ORB();
      const kp = new cv.KeyPointVector();
      const desc = new cv.Mat();
      orb.detectAndCompute(refMat, new cv.Mat(), kp, desc);

      setRefData({ refMat, kp, desc });
    };
  }, [cvReady]);

  return refData;
}
