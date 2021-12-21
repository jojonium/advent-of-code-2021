import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day19.txt';

type Point = {
  x: number,
  y: number,
  z: number
};

const orientations: ((p: Point) => Point)[] = [
  (p: Point) => ({x: p.x, y: p.y, z: p.z}),   // Facing North.
  (p: Point) => ({x: -p.z, y: p.y, z: p.x}),  // Facing East.
  (p: Point) => ({x: -p.x, y: p.y, z: -p.z}), // Facing South.
  (p: Point) => ({x: p.z, y: p.y, z: -p.x}),  // Facing West
  (p: Point) => ({x: p.x, y: -p.z, z: p.y}),  // Facing Up.
  (p: Point) => ({x: -p.x, y: p.z, z: -p.y}), // Facing Down.
];

const rotations: ((p: Point) => Point)[] = [
  (p: Point) => ({x: p.x, y: p.y, z: p.z}),   // Rotate   0 degrees.
  (p: Point) => ({x: -p.y, y: p.x, z: p.z}),  // Rotate  90 degrees.
  (p: Point) => ({x: -p.x, y: -p.y, z: p.z}), // Rotate 180 degrees.
  (p: Point) => ({x: p.y, y: -p.x, z: p.z}),  // Rotate 270 degrees.
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
        console.log('Woohoo!');
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
          offset,
          orientation,
          rotation
        };
      }
    }
  }
  return {
    points: [],
    offset: {x: 0, y: 0, z: 0},
    orientation: (p: Point) => p,
    rotation: (p: Point) => p,
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
      orientation: (p: Point) => p,
      rotation: (p: Point) => p,
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
        // B is already adjusted to be relative to Scanner J.
        console.log(`${numSolved}: Trying to match ${scanner.index} with ${other.index}`);
        let {
          points: adjustedPoints,
          offset,
          rotation,
          orientation
        } = adjustPoints(scanner.points, other.points);
        if (adjustedPoints.length === 0) {
          // No way to match these two scanners.
          continue;
        }
        scanner.relativeTo = other.index;
        scanner.points = adjustedPoints;
        scanner.rotation = rotation;
        scanner.orientation = orientation;
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
  let i = 0;
  const realPoints = new Set<string>();
  for (const scanner of scanners) {
    console.log(`=== Scanner ${i} === `);
    console.log(`Overlaps with ${scanner.relativeTo} `);
    console.log(scanner.position);
    scanner.points.forEach(p => realPoints.add(`${p.x},${p.y},${p.z}`));
    i++;
  }
  console.log(realPoints.size);
})();

