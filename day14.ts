import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day14.txt';

const run = (line: string, map: Map<string, string>, steps: number): number => {
  let pairCounts = line.split('').reduce((pc, char, i, arr) => {
    if (i === arr.length - 1) return pc;
    pc[char + arr[i + 1]!!] = (pc[char + arr[i + 1]!!] ?? 0) + 1;
    return pc;
  }, {} as {[key: string]: number});

  for (let i = 0; i < steps; ++i) {
    const npc = {} as {[key: string]: number};
    for (const pair in pairCounts) {
      const newPair1 = pair.substring(0, 1) + map.get(pair);
      const newPair2 = map.get(pair) + pair.substring(1);
      npc[newPair1] = (npc[newPair1] ?? 0) + pairCounts[pair]!!;
      npc[newPair2] = (npc[newPair2] ?? 0) + pairCounts[pair]!!;
    }
    pairCounts = npc;
  }
  const letterCounts = Object.entries(pairCounts).reduce((lc, entry) => {
    for (const char of entry[0].split('')) {
      lc[char] = (lc[char] ?? 0) + entry[1];
    }
    return lc;
  }, {} as {[key: string]: number});
  const sorted = Object.entries(letterCounts).sort((a, b) => a[1] - b[1]);
  // Each letter belongs to two different pairs and therefore gets counted
  // twice, EXCEPT for the first and last letter.
  const max = sorted[sorted.length - 1]!!;
  const min = sorted[0]!!;
  const firstChar = line.substring(0, 1);
  const lastChar = line.substring(line.length - 1);
  let answer = max[1] - min[1];
  if (max[0] === firstChar || min[0] === firstChar) answer++;
  if (max[0] === lastChar || min[0] === lastChar) answer++;
  return answer / 2;
};

(async () => {
  const [tStr, iStr] = (await fsPromises.readFile(inputFile))
    .toString().split('\n\n').map(s => s.trim());
  const template = tStr!!;
  const instructions = iStr!!.split('\n').reduce((map, line) => {
    const [left, right] = line.trim().split(' -> ');
    map.set(left!!, right!!);
    return map;
  }, new Map<string, string>());

  console.log('Part 1: ' + run(template, instructions, 10));
  console.log('Part 2: ' + run(template, instructions, 40));
})();
