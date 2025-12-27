export function useDartScoring() {
  const geometry = {
    center: { x: 496, y: 496 },
    radii: {
      bullInner: 12,
      bullOuter: 24,
      tripleInner: 170,
      tripleOuter: 200,
      doubleInner: 310,
      doubleOuter: 340
    }
  };

  function angleToSector(angleRad) {
    const sectors = [6,13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10];
    const sectorAngle = (2 * Math.PI) / 20;
    return sectors[Math.floor((angleRad + sectorAngle / 2) / sectorAngle) % 20];
  }

  function computeHitInfo(pt) {
    const { center, radii } = geometry;
    const dx = pt.x - center.x;
    const dy = pt.y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;

    if (dist > radii.doubleOuter) {
      return { score: 0, sector: 0, multiplier: 0 };
    }

    if (dist < radii.bullInner) {
      return { score: 50, sector: 25, multiplier: 2 };
    }
    if (dist < radii.bullOuter) {
      return { score: 25, sector: 25, multiplier: 1 };
    }

    const sector = angleToSector(angle);
    let multiplier = 1;
    if (dist > radii.tripleInner && dist < radii.tripleOuter) {
      multiplier = 3;
    } else if (dist > radii.doubleInner && dist < radii.doubleOuter) {
      multiplier = 2;
    }

    const score = sector * multiplier;
    return { score, sector, multiplier };
  }

  return { geometry, computeHitInfo };
}
