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

  const universes = {} as {[key: string]: number};
  universes[`${p1Pos},${p2Pos},0,0`] = 1;

  const waysToGet = {
    3: 1,
    4: 3,
    5: 4,
    6: 5,
    7: 4,
    8: 3,
    9: 1
  };

  let iterations = 0;
  while (++iterations < 10) {
    for (const key in universes) {
      const count = universes[key]!!;
      for (const roll in waysToGet) {
        let [p1Pos, p2Pos, p1Score, p2Score] = key.split(',').map(s => +s);
        if (p1Score!! >= 21) continue;
        p1Pos = ((p1Pos!! + +roll - 1) % 10) + 1;
        p1Score = p1Score!! + p1Pos;
        universes[`${p1Pos},${p2Pos},${p1Score},${p2Score}`] =
          (universes[`${p1Pos},${p2Pos},${p1Score},${p2Score}`] ?? 1) *
          count * (waysToGet[+roll as 3 | 4 | 5 | 6 | 7 | 8 | 9]!!)
      }
      delete universes[key];
    }
    console.log(Object.keys(universes).length);
  }
  console.log(universes);
})();

