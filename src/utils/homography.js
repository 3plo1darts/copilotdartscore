export function computeHomography(cv, kpFrame, kpRef, matches) {
  // Need at least 4 points for homography
  if (!matches || matches.size() < 4) {
    return null;
  }

  const src = [];
  const dst = [];

  for (let i = 0; i < matches.size(); i++) {
    const m = matches.get(i);
    const p1 = kpFrame.get(m.queryIdx).pt;
    const p2 = kpRef.get(m.trainIdx).pt;
    src.push(p1.x, p1.y);
    dst.push(p2.x, p2.y);
  }

  const srcMat = cv.matFromArray(matches.size(), 1, cv.CV_32FC2, src);
  const dstMat = cv.matFromArray(matches.size(), 1, cv.CV_32FC2, dst);
  const mask = new cv.Mat();

  const H = cv.findHomography(srcMat, dstMat, cv.RANSAC, 5, mask);

  srcMat.delete();
  dstMat.delete();
  mask.delete();

  return H && H.rows > 0 ? H : null;
}

export function transformPoint(cv, H, pt) {
  const src = cv.matFromArray(1, 1, cv.CV_32FC2, [pt.x, pt.y]);
  const dst = new cv.Mat();
  cv.perspectiveTransform(src, dst, H);
  const res = { x: dst.data32F[0], y: dst.data32F[1] };
  src.delete();
  dst.delete();
  return res;
}
