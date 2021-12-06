import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day06.txt';

(async () => {
  const initialState = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split(',')
    .map(s => +s);

  const solve = (days: number, initialState: number[]): number => {
    const birthdays: {adult: number, young: number}[]
      = [...new Array(7)].map(_ => ({adult: 0, young: 0}));
    initialState.forEach(fish => birthdays[fish]!!.adult++);
    for (let i = 0; i < days; ++i) {
      birthdays[(i + 9) % 7]!!.young += birthdays[i % 7]!!.adult;
      birthdays[i % 7]!!.adult += birthdays[i % 7]!!.young;
      birthdays[i % 7]!!.young = 0;
    }
    return birthdays.reduce((sum, x) => sum + x.adult + x.young, 0);
  }

  console.log('Part 1: ' + solve(80, initialState));
  console.log('Part 2: ' + solve(256, initialState));
})();
