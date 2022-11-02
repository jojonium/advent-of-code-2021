import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day25.txt';

const step = (
  rightFacing: Set<string>,
  southFacing: Set<string>,
  width: number,
  height: number
): {
  newRightFacing: Set<string>,
  newSouthFacing: Set<string>,
  moved: boolean
} => {
  const newRightFacing = new Set<string>();
  const newSouthFacing = new Set<string>();
  let moved = false;

  rightFacing.forEach((cucumber) => {
    const [x, y] = cucumber.split(',').map(s => parseInt(s));
    if (x === undefined || y === undefined)
      throw new Error("Invalid cucumber: " + cucumber);
    const nextPos = `${(x + 1) % width},${y}`;
    if (rightFacing.has(nextPos) || southFacing.has(nextPos)) {
      newRightFacing.add(cucumber);
    } else {
      moved = true;
      newRightFacing.add(nextPos);
    }
  });
  southFacing.forEach((cucumber) => {
    const [x, y] = cucumber.split(',').map(s => parseInt(s));
    if (x === undefined || y === undefined)
      throw new Error("Invalid cucumber: " + cucumber);
    const nextPos = `${x},${(y + 1) % height}`;
    if (southFacing.has(nextPos) || newRightFacing.has(nextPos)) {
      newSouthFacing.add(cucumber);
    } else {
      moved = true;
      newSouthFacing.add(nextPos);
    }
  });

  return {newRightFacing, newSouthFacing, moved};
};

(async () => {
  let rightFacing = new Set<string>();
  let southFacing = new Set<string>();
  const lines = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
  const width = lines[0]!!.trim().length;
  const height = lines.length;
  lines.forEach((line, i) => {
    line.trim().split('').forEach((point, j) => {
      if (point === '>') rightFacing.add(`${j},${i}`);
      else if (point === 'v') southFacing.add(`${j},${i}`);
    });
  });
  let moved = true;
  let steps = 0;
  do {
    const result = step(rightFacing, southFacing, width, height);
    rightFacing = result.newRightFacing;
    southFacing = result.newSouthFacing;
    moved = result.moved;
    steps++;
  } while (moved);
  console.log("Part 1: " + steps);
})();
