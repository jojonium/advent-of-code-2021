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
    .map(para => ({
      points: para.split('\n').filter((_, i) => (i !== 0)).map(line => {
        const [x, y, z] = line.split(',').map(s => +s);
        return {x, y, z} as Point;
      }),
      overlapsWith: undefined as number | undefined,
      position: undefined as Point | undefined,
      orientation: (p: Point) => p,
      rotation: (p: Point) => p,
    }))

  scanners[0]!!.position = {x: 0, y: 0, z: 0};
  scanners[0]!!.overlapsWith = 0;

  let numSolved = 1;

  while (numSolved < scanners.length) {
    for (let i = 1; i < scanners.length; ++i) {
      if (scanners[i]!!.overlapsWith !== undefined) continue; // Already solved.
      for (let j = 0; j < scanners.length; ++j) {
        if (i === j) continue;
        if (scanners[j]!!.overlapsWith === undefined) continue; // Not solved.
        // B is already adjusted to be relative to Scanner 0.
        console.log(`Trying to match ${i} with ${j}`);
        const a = scanners[i]!!;
        const b = scanners[j]!!;
        let {
          points: adjustedPoints,
          offset,
          rotation,
          orientation
        } = adjustPoints(a.points, b.points);
        if (adjustedPoints.length === 0) {
          // No way to match these two scanners.
          continue;
        }
        numSolved++;
        a.overlapsWith = j;
        a.points = adjustedPoints;
        a.rotation = rotation;
        a.orientation = orientation;
        a.position = {
          x: offset.x,
          y: offset.y,
          z: offset.z
        };
        break;
      }
    }
  }
  let i = 0;
  const realPoints = new Set<string>();
  for (const scanner of scanners) {
    console.log(`=== Scanner ${i} === `);
    console.log(`Overlaps with ${scanner.overlapsWith} `);
    console.log(scanner.position);
    scanner.points.forEach(p => realPoints.add(`${p.x},${p.y},${p.z}`));
    i++;
  }
  console.log(realPoints.size);
})();

