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
    const char = entry[0].substring(0, 1);
    lc[char] = (lc[char] ?? 0) + entry[1];
    return lc;
  }, {} as {[key: string]: number});
  // Remember to count last character.
  const lastChar = line.substring(line.length - 1);
  letterCounts[lastChar] = (letterCounts[lastChar] ?? 0) + 1;
  const sorted = Object.entries(letterCounts).sort((a, b) => a[1] - b[1]);
  const answer = sorted[sorted.length - 1]!![1] - sorted[0]!![1]
  return answer;
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
