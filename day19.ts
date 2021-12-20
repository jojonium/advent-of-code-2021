import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day19.txt';

type Point = {
  x: number,
  y: number,
  z: number
};

const rotate = (d: number): ((p: Point) => Point) =>
  ({
    0: (p: Point) => ({x: p.x, y: p.y, z: p.z}),
    1: (p: Point) => ({x: -p.x, y: -p.y, z: p.z}),
    2: (p: Point) => ({x: p.x, y: -p.y, z: -p.z}),
    3: (p: Point) => ({x: -p.x, y: p.y, z: -p.z}),
    4: (p: Point) => ({x: -p.x, y: -p.y, z: -p.z}),
    5: (p: Point) => ({x: -p.x, y: p.y, z: p.z})
  })[d]!!;

const orient = (o: number): ((p: Point) => Point) =>
  ({
    0: (p: Point) => ({x: p.x, y: p.y, z: p.z}),
    1: (p: Point) => ({x: p.z, y: p.y, z: p.x}),
    2: (p: Point) => ({x: p.x, y: p.z, z: p.y}),
    3: (p: Point) => ({x: p.y, y: p.x, z: p.z})
  })[o]!!;

const permutationFuncs: ((p: Point) => Point)[] =
  [0, 1, 2, 3, 4, 5].flatMap(d => [0, 1, 2, 3].map(o =>
    p => rotate(d)(orient(o)(p))
  ));

const adjustPoints = (
  scanner: Point[],
  base: Point[]
): {points: Point[], offset: Point} => {
  for (const pFunc of permutationFuncs) {
    const commonX = {} as {[key: string]: number};
    const commonY = {} as {[key: string]: number};
    const commonZ = {} as {[key: string]: number};
    const permutation = scanner.map(p => pFunc(p));
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
        offset
      };
    }
  }
  return {points: [], offset: {x: 0, y: 0, z: 0}};
}

(async () => {
  const scanners = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n\n')
    .map(para => para.split('\n').filter((_, i) => (i !== 0)).map(line => {
      const [x, y, z] = line.split(',').map(s => +s);
      return {x, y, z} as Point;
    }));

  const realPoints = new Set<string>();
  scanners[0]!!.forEach(p => realPoints.add(`${p.x},${p.y},${p.z}`));
  let goldenOffset = {x: 0, y: 0, z: 0} as Point;
  for (const scanner of scanners.slice(1)) {
    const {points, offset} = adjustPoints(scanner, scanners[0]!!);
    if (points.length > 0) {
      goldenOffset = offset;
      break;
    }
  }
  for (let i = 1; i < scanners.length; ++i) {
    for (let j = 0; j < scanners.length; ++j) {
      if (i === j) continue;
      const {points} = adjustPoints(scanners[i]!!, scanners[j]!!);
      if (points.length === 0) continue;
      console.log(`${i} overlaps with ${j}`);
      scanners[i]!!.map(p => ({
        x: p.x + goldenOffset.x,
        y: p.y + goldenOffset.y,
        z: p.z + goldenOffset.z,
      })).forEach(p => realPoints.add(`${p.x},${p.y},${p.z}`));
    }
  }
  console.log(realPoints.size);
})();

