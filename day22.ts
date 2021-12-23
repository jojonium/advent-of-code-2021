import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day22.txt';

const lineRegex =
  /(on|off) x=(-?\d+)\.\.(-?\d+),y=(-?\d+)\.\.(-?\d+),z=(-?\d+)\.\.(-?\d+)/;

type Prism =
  {x1: number, x2: number, y1: number, y2: number, z1: number, z2: number};

const intersection = (a: Prism, b: Prism): Prism | null => {
  const x1 = Math.max(a.x1, b.x1);
  const x2 = Math.min(a.x2, b.x2);
  const y1 = Math.max(a.y1, b.y1);
  const y2 = Math.min(a.y2, b.y2);
  const z1 = Math.max(a.z1, b.z1);
  const z2 = Math.min(a.z2, b.z2);
  if (x1 <= x2 && y1 <= y2 && z1 <= z2) {
    return {x1, x2, y1, y2, z1, z2}
  } else {
    return null;
  }
};

const volume = (a: Prism | null) => (a === null) ? 0 :
  (a.x2 - a.x1 + 1) * (a.y2 - a.y1 + 1) * (a.z2 - a.z1 + 1);

(async () => {
  const instructions = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .map(line => {
      const m = line.match(lineRegex);
      if (m === null || m.length < 8) throw new Error('Bad input');
      return {
        on: m[1] === 'on',
        bounds: {
          x1: +m[2]!!,
          x2: +m[3]!!,
          y1: +m[4]!!,
          y2: +m[5]!!,
          z1: +m[6]!!,
          z2: +m[7]!!
        } as Prism
      };
    });

  const cubes = new Set<string>();
  for (const ins of instructions) {
    const x1 = Math.max(ins.bounds.x1, -50);
    const x2 = Math.min(ins.bounds.x2, 50);
    const y1 = Math.max(ins.bounds.y1, -50);
    const y2 = Math.min(ins.bounds.y2, 50);
    const z1 = Math.max(ins.bounds.z1, -50);
    const z2 = Math.min(ins.bounds.z2, 50);
    for (let x = x1; x <= x2; ++x) {
      for (let y = y1; y <= y2; ++y) {
        for (let z = z1; z <= z2; ++z) {
          if (ins.on) cubes.add(`${x},${y},${z}`);
          else cubes.delete(`${x},${y},${z}`);
        }
      }
    }
  }
  console.log('Part 1: ' + cubes.size);

  const finalPrisms = [] as {p: Prism, sign: -1 | 1}[];
  for (const ins of instructions) {
    const toAdd = [] as {p: Prism, sign: -1 | 1}[];
    for (const fp of finalPrisms) {
      const intersect = intersection(ins.bounds, fp.p);
      if (intersect === null) continue;
      toAdd.push({p: intersect, sign: (fp.sign === 1 ? -1 : 1)});
    }
    finalPrisms.push(...toAdd);
    if (ins.on) finalPrisms.push({p: ins.bounds, sign: 1});
  }

  let part2 = BigInt(0);
  for (const fp of finalPrisms) {
    part2 += BigInt(fp.sign * volume(fp.p));
  }

  console.log('Part 2: ' + part2);
})();
