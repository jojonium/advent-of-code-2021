import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day11.txt';

const GREEN = '\x1b[92m';
const ENDC = '\x1b[0m';

(async () => {
  const sleep = async (ms: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  const initialState = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .map(line => line.trim().split('').map(s => +s));

  const prettyPrint = (state: number[][], reset = false) =>
    console.log(
      ((reset)
        ? `\x1b[${state.length + 1}A`
        : ''
      ) +
      state.reduce((str, row) => str +
        row.reduce((str, o) => str +
          ((o === 0) ? GREEN : '') + o + ENDC
          , '') +
        '\n', '')
    );

  const step = (state: number[][]): {newState: number[][], flashes: number} => {
    let flashed = new Set<string>();
    let newState = state.map((row, y) => row.map((o, x) => {
      const octo = o + 1;
      if (octo > 9) flashed.add(`${x},${y}`);
      return octo;
    }));
    do {
      const newNewState = newState.map((row, y) => row.map((o, x) => {
        const flashingNeighbors = [-1, 0, 1].reduce((cnt, dy) =>
          cnt + [-1, 0, 1].reduce((cnt2, dx) =>
            cnt2 + Number(flashed.has(`${x + dx},${y + dy}`)), 0
          ), 0
        );
        return o + flashingNeighbors;
      }));
      flashed.clear();
      newNewState.forEach((row, y) => row.forEach((o, x) => {
        if (o > 9 && newState[y]!![x]!! <= 9) flashed.add(`${x},${y}`);
      }));
      newState = newNewState;
    } while (flashed.size > 0);

    let flashes = 0;
    newState = newState.map(row => row.map(o => {
      if (o > 9) {
        flashes++
        return 0;
      }
      return o;
    }));

    return {newState, flashes};
  };

  const run = async (state: number[][], n: number, print = false
  ): Promise<{
    flashes: number,
    step: number
  }> => {
    let totalFlashes = 0;
    let reset = false;
    const numOctopi = initialState.length * initialState[0]!!.length;
    let i = 1;
    for (i = 1; i <= n; ++i) {
      const {newState, flashes} = step(state);
      if (print) {
        prettyPrint(newState, reset);
        await sleep(10);
        reset = true;
      }
      totalFlashes += flashes;
      state = newState;
      if (flashes === numOctopi) {
        break;
      }
    }
    return {flashes: totalFlashes, step: i};
  };

  const {flashes} = await run(initialState, 100, true);
  console.log('Part 1: ' + flashes);

  const {step: part2} = await run(initialState, Infinity, true);
  console.log('Part 2: ' + part2);


})();
