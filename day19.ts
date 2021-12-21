import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day19.txt';

type Point = {
  x: number,
  y: number,
  z: number
};

const orientations: ((p: Point) => Point)[] = [
  (p: Point) => ({x: p.x, y: p.y, z: p.z}),
  (p: Point) => ({x: p.y, y: p.x, z: p.z}),
  (p: Point) => ({x: p.x, y: p.z, z: p.y}),
  (p: Point) => ({x: p.z, y: p.y, z: p.x}),
  (p: Point) => ({x: p.z, y: p.x, z: p.y}),
  (p: Point) => ({x: p.y, y: p.z, z: p.x}),
];

const rotations: ((p: Point) => Point)[] = [
  (p: Point) => ({x: p.x, y: p.y, z: p.z}),
  (p: Point) => ({x: -p.x, y: p.y, z: p.z}),
  (p: Point) => ({x: p.x, y: -p.y, z: p.z}),
  (p: Point) => ({x: p.x, y: p.y, z: -p.z}),
  (p: Point) => ({x: -p.x, y: -p.y, z: p.z}),
  (p: Point) => ({x: p.x, y: -p.y, z: -p.z}),
  (p: Point) => ({x: -p.x, y: p.y, z: -p.z}),
  (p: Point) => ({x: -p.x, y: -p.y, z: -p.z}),
]

const adjustPoints = (
  scanner: Point[],
  base: Point[]
) => {
  for (const rotation of rotations) {
    for (const orientation of orientations) {
      const commonX = {} as {[key: string]: number};
      const commonY = {} as {[key: string]: number};
      const commonZ = {} as {[key: string]: number};
      const permutation = scanner.map(p => rotation(orientation(p)));
      for (const point of permutation) {
        for (const other of base) {
          const xKey = (point.x - other.x).toString();
          commonX[xKey] = (commonX[xKey] ?? 0) + 1;
          const yKey = (point.y - other.y).toString();
          commonY[yKey] = (commonY[yKey] ?? 0) + 1;
          const zKey = (point.z - other.z).toString();
          commonZ[zKey] = (commonZ[zKey] ?? 0) + 1;
        }
      }
      const diffX = Object.entries(commonX).filter(([_, c]) => +c >= 12);
      const diffY = Object.entries(commonY).filter(([_, c]) => +c >= 12);
      const diffZ = Object.entries(commonZ).filter(([_, c]) => +c >= 12);
      if (diffX.length > 0 && diffY.length > 0 && diffZ.length > 0) {
        const offset = {
          x: -diffX[0]!![0],
          y: -diffY[0]!![0],
          z: -diffZ[0]!![0],
        };
        return {
          points: permutation.map(p => ({
            x: p.x - +diffX[0]!![0],
            y: p.y - +diffY[0]!![0],
            z: p.z - +diffZ[0]!![0],
          })),
          offset
        };
      }
    }
  }
  return {
    points: [],
    offset: {x: 0, y: 0, z: 0}
  };
}

(async () => {
  const scanners = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n\n')
    .map((para, scannerIndex) => ({
      points: para.split('\n').filter((_, i) => (i !== 0)).map(line => {
        const [x, y, z] = line.split(',').map(s => +s);
        return {x, y, z} as Point;
      }),
      relativeTo: undefined as number | undefined,
      position: {x: 0, y: 0, z: 0},
      index: scannerIndex
    }))

  scanners[0]!!.position = {x: 0, y: 0, z: 0};
  scanners[0]!!.relativeTo = 0;

  let numSolved = 1;

  while (numSolved < scanners.length) {
    for (const scanner of scanners.slice(1)) {
      if (scanner.relativeTo !== undefined) continue; // Already solved.
      for (const other of scanners) {
        if (scanner === other) continue;
        if (other.relativeTo === undefined) continue; // Not solved.
        // other is already adjusted to be relative to scanner 0.
        let {
          points: adjustedPoints,
          offset,
        } = adjustPoints(scanner.points, other.points);
        if (adjustedPoints.length === 0) {
          // No way to match these two scanners.
          continue;
        }
        scanner.relativeTo = other.index;
        scanner.points = adjustedPoints;
        scanner.position = {
          x: scanner.position.x + offset.x,
          y: scanner.position.y + offset.y,
          z: scanner.position.z + offset.z
        };
        numSolved++;
        break;
      }
    }
  }
  const realPoints = new Set<string>();
  for (const scanner of scanners) {
    scanner.points.forEach(p => realPoints.add(`${p.x},${p.y},${p.z}`));
  }
  console.log('Part 1: ' + realPoints.size);

  let part2 = -Infinity;
  scanners.forEach((scanner, i) => {
    scanners.slice(i + 1).forEach((other) => {
      part2 = Math.max(
        part2,
        Math.abs(scanner.position.x - other.position.x) +
        Math.abs(scanner.position.y - other.position.y) +
        Math.abs(scanner.position.z - other.position.z)
      );
    });
  });

  console.log('Part 2: ' + part2);

})();

