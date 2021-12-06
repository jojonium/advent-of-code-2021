import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day05.txt';

(async () => {
  const lines: {x: number, y: number}[][] =
    (await fsPromises.readFile(inputFile))
      .toString()
      .trim()
      .split('\n')
      .map(l => l
        .split(' -> ')
        .map(s => {
          const [x, y] = s.split(',')
          return {x: parseInt(x!!), y: parseInt(y!!)}
        })
      );

  for (const part of [1, 2]) {
    const partLines = (part === 1)
      ? lines.filter(l => l[0]!!.x === l[1]!!.x || l[0]!!.y == l[1]!!.y)
      : lines
    console.log(`Part ${part}: ` + Array.from(partLines.reduce((map, c) => {
      let [x1, y1, x2, y2] = [c[0]!!.x, c[0]!!.y, c[1]!!.x, c[1]!!.y];
      for (
        let [x, y, dx, dy] = [x1, y1, Math.sign(x2 - x1), Math.sign(y2 - y1)];
        x * dx <= x2 * dx && y * dy <= y2 * dy;
        (x += dx), (y += dy)
      ) {
        if (!map.has(x)) map.set(x, new Map());
        const prev = map.get(x)!!.get(y) ?? 0;
        map.get(x)!!.set(y, prev + 1);
      }
      return map;
    }, new Map<number, Map<number, number>>()).values()).reduce((sum, yMap) =>
      sum + Array.from(yMap.values()).reduce((sum, overlaps) =>
        sum + (overlaps >= 2 ? 1 : 0)
        , 0
      ), 0
    ));
  }
})();
