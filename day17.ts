import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day17.txt';

type Point = {
  x: number,
  y: number
};

type Rectangle = {
  tl: Point,
  br: Point
};

const sim = (
  dx: number,
  dy: number,
  target: Rectangle
): {hitTarget: boolean, maxHeight: number} => {
  const pos = {x: 0, y: 0} as Point;
  let maxHeight = pos.y;
  while (true) {
    pos.x += dx;
    pos.y += dy;
    dx -= 1 * Math.sign(dx);
    dy -= 1;
    maxHeight = Math.max(maxHeight, pos.y);
    //console.log(pos);

    // Check if we are in the target area.
    if (
      pos.x >= target.tl.x &&
      pos.x <= target.br.x &&
      pos.y <= target.tl.y &&
      pos.y >= target.br.y
    ) {
      return {hitTarget: true, maxHeight}
    }

    // Check if we passed the target area.
    if (pos.x > target.br.x || pos.y < target.br.y) {
      return {hitTarget: false, maxHeight}
    }
  }
};

(async () => {
  const input = (await fsPromises.readFile(inputFile)).toString();
  const m = input.match(/x=(-?\d+)\.\.(-?\d+), y=(-?\d+)\.\.(-?\d+)/)!!;
  const target = {
    tl: {x: Math.min(+m[1]!!, +m[2]!!), y: Math.max(+m[3]!!, +m[4]!!)},
    br: {x: Math.max(+m[1]!!, +m[2]!!), y: Math.min(+m[3]!!, +m[4]!!)},
  } as Rectangle;
  let ysSinceLastHit = 0;
  let part1 = 0;
  let part2Set = new Set<string>();
  for (let dy = target.br.y; dy <= Infinity; ++dy) {
    ysSinceLastHit++;
    for (let dx = 1; dx <= target.br.x; ++dx) {
      const {hitTarget, maxHeight} = sim(dx, dy, target);
      if (hitTarget) {
        ysSinceLastHit = 0;
        part2Set.add(`${dx},${dy}`);
        part1 = Math.max(part1, maxHeight);
      }
    }
    if (part1 > 0 && ysSinceLastHit > 100) break;
  }
  console.log('Part 1: ' + part1);
  console.log('Part 2: ' + part2Set.size);
})();

