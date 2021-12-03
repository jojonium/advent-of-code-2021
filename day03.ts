import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day03.txt';

(async () => {
  const matrix = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .map((s) => s.split(''));

  console.log(
    'Part 1: ' +
    Array<string>(2)
      .fill(matrix[0]!!
        .map((_, i) =>
          matrix.map((r) => r[i]).filter((n) => n === '1').length >
            matrix!!.length / 2
            ? '1' : '0'
        ).join('')
      ).map((s, i) => /* Flip bits of second element */ i === 1
        ? s.split('').map((x) => (x === '1' ? '0' : '1')).join('')
        : s
      ).map((s) => parseInt(s, 2)).reduce((prev, cur) => prev * cur, 1)
  );

  const geq = (a: number, b: number): boolean => a >= b;
  const lt = (a: number, b: number): boolean => a < b;
  let part2 = 1;
  for (const criteria of [geq, lt]) {
    let remaining = matrix;
    let n = 0;
    do {
      const bit = criteria(
        remaining.map(r => r[n]).filter(x => x === '1').length,
        remaining.length / 2
      ) ? '1' : '0';
      remaining = remaining.filter(r => r[n] === bit);
      n++;
    } while (remaining.length > 1);
    part2 *= parseInt(remaining[0]!!.join(''), 2);
  }
  console.log('Part 2: ' + part2);
})();
