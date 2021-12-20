import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day18.txt';

type SFN = {l: SFN, r: SFN} | number;

const stringToSfn = (s: string): SFN => {
  const arrToSfn = (a: Array<number | number[]>): SFN => ({
    l: (Array.isArray(a[0]) ? arrToSfn(a[0]) : a[0])!!,
    r: (Array.isArray(a[1]) ? arrToSfn(a[1]) : a[1])!!,
  });
  return arrToSfn(JSON.parse(s));
};

//const stringToArray = (s: string): number[] =>
//  s.replace(/[\]\[]/g, '').split(',').map(x => +x);

const sfnToString = (sfn: SFN): string =>
  (typeof sfn === 'number')
    ? sfn.toString()
    : `[${sfnToString(sfn.l)},${sfnToString(sfn.r)}]`;

const reduce = (sfn: SFN): SFN => {
  let explodeLeft = -1;
  let explodeRight = -1;
  let reducedThisStep = false;

  // Performs one explode.
  const explodeHelper = (
    sfn: SFN,
    depth: number,
  ): SFN => {
    if (
      !reducedThisStep &&
      depth >= 4 && typeof sfn === 'object' &&
      typeof sfn.l === 'number' && typeof sfn.r === 'number'
    ) {
      reducedThisStep = true;
      explodeLeft = sfn.l;
      explodeRight = sfn.r;
      return Infinity;
    }
    if (typeof sfn === 'number') return sfn;
    return {
      l: explodeHelper(sfn.l, depth + 1),
      r: explodeHelper(sfn.r, depth + 1)
    };
  }

  // Performs one split.
  const splitHelper = (sfn: SFN): SFN => {
    if (!reducedThisStep && typeof sfn === 'number' && sfn >= 10) {
      reducedThisStep = true;
      return {
        l: Math.floor(sfn / 2),
        r: Math.ceil(sfn / 2)
      };
    }

    if (typeof sfn === 'number') return sfn;
    return {
      l: splitHelper(sfn.l),
      r: splitHelper(sfn.r)
    };
  };

  let out = sfn;
  do {
    reducedThisStep = false;
    out = explodeHelper(out, 0);
    let exploded = false;
    if (explodeLeft != -1 || explodeRight != -1) {
      exploded = true;
      const str = sfnToString(out).split('');
      for (let i = 0; i < str.length; ++i) {
        if (str[i] === 'I') {
          let j = i;
          let z = 0;
          while (--j >= 0) {
            if (/\d/.test(str[j]!!)) {
              z = 1;
              while (/\d/.test(str[j - z]!!)) z++;
              const newNum =
                (+str.slice(j - z + 1, j + 1).join('') + explodeLeft)
              str.splice(j - z + 1, z, newNum.toString());
              explodeLeft = -1;
              break;
            }
          }
          explodeLeft = -1; // Nothing to left.
          j = i - z + 8;
          while (++j < str.length) {
            if (/\d/.test(str[j]!!)) {
              let y = 1;
              while (/\d/.test(str[j + y]!!)) y++;
              const newNum =
                (+str.slice(j, j + y).join('') + explodeRight).toString();
              str.splice(j, y, newNum);
              explodeRight = -1;
              break;
            }
          }
          explodeRight = -1; // Nothing to right.
          out = stringToSfn(str.join('').replace('Infinity', '0'));
          break;
        }
      }
    }
    if (!exploded) out = splitHelper(out);
  } while (reducedThisStep);

  return out;
};

// Adds and reduces.
const add = (a: SFN, b: SFN): SFN =>
  reduce(stringToSfn(`[${sfnToString(a)},${sfnToString(b)}]`));

const magnitude = (sfn: SFN): number =>
  (typeof sfn === 'number')
    ? sfn
    : 3 * magnitude(sfn.l) + 2 * magnitude(sfn.r);

(async () => {
  const input = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .map(s => stringToSfn(s));

  console.log('Part 1: ' +
    magnitude(input.reduce((sum, cur) => add(sum, cur)))
  );

  let part2 = -Infinity;
  for (const a of input) {
    for (const b of input) {
      part2 = Math.max(part2, magnitude(add(a, b)));
    }
  }
  console.log('Part 2: ' + part2);
})();

