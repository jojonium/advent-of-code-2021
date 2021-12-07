import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day07.txt';

(async () => {
  const crabs = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split(',')
    .map(s => +s)
    .sort((a, b) => a - b);

  const factorial = (x: number): number => (x <= 0)
    ? 0
    : x + factorial(x - 1);

  const median = crabs[Math.floor(crabs.length / 2)]!!;
  const mean = Math.floor(crabs.reduce((sum, x) => sum + x) / crabs.length);

  console.log('Part 1: ' +
    crabs.map(c => Math.abs(c - median)).reduce((sum, x) => sum + x)
  );

  let solve = (positions: number[], target: number) =>
    positions
      .map(c => factorial(Math.abs(c - target)))
      .reduce((sum, x) => sum + x);

  let target = mean;
  let part2 = solve(crabs, target);
  let next = part2;

  do { // Climb up.
    next = solve(crabs, ++target)
    if (next < part2) part2 = next;
  } while (next < part2);
  target = mean;
  do { // Climb down.
    next = solve(crabs, --target);
    if (next < part2) part2 = next;
  } while (next < part2);

  console.log('Part 2: ' + part2);
})();
