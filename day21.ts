import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day21.txt';

(async () => {
  const [p1Pos, p2Pos] = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .map(line => +line.substring(28))
  const p1 = {position: p1Pos!!, score: 0};
  const p2 = {position: p2Pos!!, score: 0};

  let die = 0;
  let dieCount = 0;
  while (p1.score < 1000 && p2.score < 1000) {
    let p1Move = 0;
    for (let i = 0; i < 3; ++i) {
      dieCount++;
      die = (die + 1);
      if (die === 101) die = 1;
      p1Move += die
    }
    p1.position = ((p1.position + p1Move - 1) % 10) + 1;
    p1.score += p1.position;
    if (p1.score >= 1000) break;

    let p2Move = 0;
    for (let i = 0; i < 3; ++i) {
      dieCount++;
      die = (die + 1);
      if (die === 101) die = 1;
      p2Move += die
    }
    p2.position = ((p2.position + p2Move - 1) % 10) + 1;
    p2.score += p2.position;
  }
  let loser = p1.score >= 1000 ? p2 : p1;
  console.log('Part 1: ' + loser.score * dieCount);

  const waysToGet = {} as {[key: number]: number};
  for (let r1 = 1; r1 <= 3; ++r1) {
    for (let r2 = 1; r2 <= 3; ++r2) {
      for (let r3 = 1; r3 <= 3; ++r3) {
        waysToGet[r1 + r2 + r3] = (waysToGet[r1 + r2 + r3] ?? 0) + 1;
      }
    }
  }

  let universes = {} as {[key: string]: number};
  let p1Wins = 0;
  let p2Wins = 0;
  universes[`${p1Pos},${p2Pos},0,0`] = 1;


  while (Object.keys(universes).length > 0) {
    const newStates = {} as {[key: string]: number};
    for (const key in universes) {
      const [p1Pos, p2Pos, p1Score, p2Score] = key.split(',').map(s => +s);
      for (const p1Roll in waysToGet) {
        // Simulate p1.
        const tempP1Pos = ((p1Pos!! + +p1Roll - 1) % 10) + 1;
        const tempP1Score = p1Score!! + tempP1Pos;
        let newKey = `${tempP1Pos},${p2Pos},${tempP1Score},${p2Score}`;
        if (tempP1Score >= 21) {
          p1Wins += universes[key]!! * waysToGet[p1Roll]!!;
          continue;
        }

        for (const p2Roll in waysToGet) {
          // Simulate p2.
          const tempP2Pos = ((p2Pos!! + +p2Roll - 1) % 10) + 1;
          const tempP2Score = p2Score!! + tempP2Pos;
          newKey = `${tempP1Pos},${tempP2Pos},${tempP1Score},${tempP2Score}`;
          if (tempP2Score >= 21) {
            p2Wins += universes[key]!! *
              waysToGet[p1Roll]!! * waysToGet[p2Roll]!!;
            continue;
          }
          newStates[newKey] = (newStates[newKey] ?? 0) +
            universes[key]!! * waysToGet[p1Roll]!! * waysToGet[p2Roll]!!;
        }
      }
    }
    universes = newStates
  }

  console.log('Part 2: ' + Math.max(p1Wins, p2Wins));
})();

