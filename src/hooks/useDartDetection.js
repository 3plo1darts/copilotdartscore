export function useDartDetection() {
  function findDartTip(cv, frame, backgroundFrame, canvas) {
    if (!backgroundFrame) return null;

    let grayCur = new cv.Mat();
    let grayBg = new cv.Mat();
    cv.cvtColor(frame, grayCur, cv.COLOR_RGBA2GRAY);
    cv.cvtColor(backgroundFrame, grayBg, cv.COLOR_RGBA2GRAY);

    let diff = new cv.Mat();
    cv.absdiff(grayCur, grayBg, diff);

    let thresh = new cv.Mat();
    cv.threshold(diff, thresh, 25, 255, cv.THRESH_BINARY);

    let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.morphologyEx(thresh, thresh, cv.MORPH_OPEN, kernel);
    cv.morphologyEx(thresh, thresh, cv.MORPH_DILATE, kernel);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    let bestTip = null;

    if (contours.size() > 0) {
      let maxArea = 0;
      let maxIdx = -1;
      for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt);
        if (area > maxArea) {
          maxArea = area;
          maxIdx = i;
        }
      }

      if (maxIdx >= 0) {
        const cnt = contours.get(maxIdx);

        let rotatedRect = cv.minAreaRect(cnt);
        let rectPoints = [];
        for (let i = 0; i < 4; i++) {
          rectPoints.push(rotatedRect.points(i));
        }

        let maxDist = 0;
        let pA = rectPoints[0],
          pB = rectPoints[1];
        for (let i = 0; i < 4; i++) {
          for (let j = i + 1; j < 4; j++) {
            let dx = rectPoints[i].x - rectPoints[j].x;
            let dy = rectPoints[i].y - rectPoints[j].y;
            let d2 = dx * dx + dy * dy;
            if (d2 > maxDist) {
              maxDist = d2;
              pA = rectPoints[i];
              pB = rectPoints[j];
            }
          }
        }

        const centerApprox = { x: canvas.width / 2, y: canvas.height / 2 };
        let dA = Math.hypot(pA.x - centerApprox.x, pA.y - centerApprox.y);
        let dB = Math.hypot(pB.x - centerApprox.x, pB.y - centerApprox.y);
        let tipApprox = dA < dB ? pA : pB;
        let tailApprox = dA < dB ? pB : pA;

        let dirX = tipApprox.x - tailApprox.x;
        let dirY = tipApprox.y - tailApprox.y;
        let dirLen = Math.hypot(dirX, dirY);
        if (dirLen > 0) {
          dirX /= dirLen;
          dirY /= dirLen;
        }

        let bestProj = -Infinity;
        let tip = { x: tipApprox.x, y: tipApprox.y };

        for (let i = 0; i < cnt.data32S.length; i += 2) {
          const x = cnt.data32S[i];
          const y = cnt.data32S[i + 1];

          let vx = x - tailApprox.x;
          let vy = y - tailApprox.y;

          let proj = vx * dirX + vy * dirY;

          if (proj > 0 && proj > bestProj) {
            bestProj = proj;
            tip = { x, y };
          }
        }

        bestTip = tip;
      }
    }

    grayCur.delete();
    grayBg.delete();
    diff.delete();
    thresh.delete();
    kernel.delete();
    contours.delete();
    hierarchy.delete();

    return bestTip;
  }

  return { findDartTip };
}
