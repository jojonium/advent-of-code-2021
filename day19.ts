import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day19.txt';

type Point = {
  x: number,
  y: number,
  z: number
};

const orient = (d: number): ((p: Point) => Point) =>
  ({
    0: (p: Point) => ({x: p.x, y: p.y, z: p.z}),   // Facing North.
    1: (p: Point) => ({x: -p.z, y: p.y, z: p.x}),  // Facing East.
    2: (p: Point) => ({x: -p.x, y: p.y, z: -p.z}), // Facing South.
    3: (p: Point) => ({x: p.z, y: p.y, z: -p.x}),  // Facing West
    4: (p: Point) => ({x: p.x, y: -p.z, z: p.y}),  // Facing Up.
    5: (p: Point) => ({x: -p.x, y: p.z, z: -p.y}), // Facing Down.
  })[d]!!;

const rotate = (o: number): ((p: Point) => Point) =>
  ({
    0: (p: Point) => ({x: p.x, y: p.y, z: p.z}),   // Rotate   0 degrees.
    1: (p: Point) => ({x: -p.y, y: p.x, z: p.z}),  // Rotate  90 degrees.
    2: (p: Point) => ({x: -p.x, y: -p.y, z: p.z}), // Rotate 180 degrees.
    3: (p: Point) => ({x: p.y, y: -p.x, z: p.z}),  // Rotate 270 degrees.
  })[o]!!;

const rotations: ((p: Point) => Point)[] =
  [0, 1, 2, 3].map(d => p => rotate(d)(p));
const orientations: ((p: Point) => Point)[] =
  [0, 1, 2, 3, 4, 5].map(o => p => orient(o)(p));

/*
const permutationFuncs: ((p: Point) => Point)[] =
  [0, 1, 2, 3, 4, 5].flatMap(o => [0, 1, 2, 3].map(d =>
    p => orient(o)(rotate(d)(p))
  ));
 */

const adjustPoints = (
  scanner: Point[],
  base: Point[]
) => {
  for (const rotation of rotations) {
    for (const orientation of orientations) {
      const commonX = {} as {[key: string]: number};
      const commonY = {} as {[key: string]: number};
      const commonZ = {} as {[key: string]: number};
      const permutation = scanner.map(p => rotation(orientation((p))));
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
          x: -1 * +diffX[0]!![0],
          y: -1 * +diffY[0]!![0],
          z: -1 * +diffZ[0]!![0],
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

  const realPoints = new Set<string>();
  scanners[0]!!.position = {x: 0, y: 0, z: 0};
  scanners[0]!!.overlapsWith = 0;
  scanners[0]!!.points.forEach(p => realPoints.add(`${p.x},${p.y},${p.z}`));

  let numSolved = 1;

  while (numSolved < scanners.length) {
    for (let i = 1; i < scanners.length; ++i) {
      if (scanners[i]!!.overlapsWith !== undefined) continue; // Already solved.
      for (let j = 0; j < scanners.length; ++j) {
        if (i === j) continue;
        if (scanners[j]!!.overlapsWith === undefined) continue;
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
        a.rotation = rotation;
        a.orientation = orientation;
        offset = b.orientation(b.rotation(offset));
        a.position = {
          x: offset.x + b.position!!.x,
          y: offset.y + b.position!!.y,
          z: offset.z + b.position!!.z,
        };
        console.log(`${i} overlaps with ${j}`);
        break;
      }
    }
    let i = 0;
    for (const scanner of scanners) {
      console.log(`=== Scanner ${i} === `);
      console.log(`Overlaps with ${scanner.overlapsWith} `);
      console.log(scanner.position);
      i++;
    }
  }
  //console.log(realPoints.size);
})();

