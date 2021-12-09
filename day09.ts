import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day09.txt';

(async () => {
  const hgts = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .map(l => l.trim().split('').map(x => +x))

  const lowPoints =
    hgts.flatMap((row, y) =>
      row.map((point, x) => ({
        x, y,
        lowerThan:
          +(point < (row[x + 1] ?? Infinity)) +
          +(point < (row[x - 1] ?? Infinity)) +
          +(y === 0 || point < (hgts[y - 1]!![x] ?? Infinity)) +
          +(y === hgts.length - 1 || point < (hgts[y + 1]!![x] ?? Infinity)),
        height: point
      })
      ).filter(a => a.lowerThan === 4)
    );

  console.log('Part 1: ' +
    lowPoints.reduce((sum, elt) => sum + elt.height + 1, 0)
  );

  const floodFill = (
    heights: number[][],
    x: number,
    y: number,
    visited: Set<string> = new Set()
  ): {x: number, y: number, h: number}[] =>
    [
      {i: x + 1, j: y},
      {i: x - 1, j: y},
      {i: x, j: y + 1},
      {i: x, j: y - 1},
    ].map(({i, j}) => ({h: ((heights[j] ?? [])[i] ?? 9), x: i, y: j}))
      .filter(val => val.h !== 9 && !visited.has(`${val.x}${val.y}`))
      .flatMap((pnt) =>
        (visited.has(`${pnt.x}${pnt.y}`) ? [] : [pnt]).concat(
          floodFill(
            heights,
            pnt.x,
            pnt.y,
            visited.add(`${pnt.x}${pnt.y}`)
          )
        )
      );

  console.log('Part 2: ' + lowPoints
    .map(val => floodFill(hgts, val.x, val.y).length)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((product, x) => product * x)
  );
})();
