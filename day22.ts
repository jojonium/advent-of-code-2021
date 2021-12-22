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
  if (x1 < x2 && y1 < y2 && z1 < z2) {
    return {x1, x2, y1, y2, z1, z2}
  } else {
    return null;
  }
};

const cutOut = (a: Prism, b: Prism): Prism[] => {
  const i = intersection(a, b);
  if (i === null) return [a];
  const out = [] as Prism[];
  const xs = [[a.x1, i.x1], [i.x1, i.x2], [i.x2, a.x2]] as [number, number][];
  const ys = [[a.y1, i.y1], [i.y1, i.y2], [i.y2, a.y2]] as [number, number][];
  const zs = [[a.z1, i.z1], [i.z1, i.z2], [i.z2, a.z2]] as [number, number][];
  for (const [x1, x2] of xs) {
    for (const [y1, y2] of ys) {
      for (const [z1, z2] of zs) {
        out.push({x1, x2, y1, y2, z1, z2});
      }
    }
  }

  // Remove degenerate rectangles and the intersection itself.
  return out.filter(p =>
    volume(p) > 0 && !(
      p.x1 === i.x1 && p.x2 === i.x2 &&
      p.y1 === i.y1 && p.y2 === i.y2 &&
      p.z1 === i.z1 && p.z2 === i.z2
    )
  );
};

const volume = (a: Prism | null) => (a === null) ? 0 :
  Math.abs(a.x2 - a.x1) * Math.abs(a.y2 - a.y1) * Math.abs(a.z2 - a.z1);

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

  const a = {
    x1: 0,
    x2: 10,
    y1: 0,
    y2: 10,
    z1: 0,
    z2: 10,
  };
  const b = {
    x1: -2,
    x2: 6,
    y1: -2,
    y2: 6,
    z1: -2,
    z2: 6,
  };
  console.log(cutOut(b, a));

  let part2 = BigInt(0);
  let onPrisms = [] as Prism[];
  instructions.forEach((ins) => {
    if (ins.on) {
      part2 += BigInt(volume(ins.bounds));
      onPrisms.push(ins.bounds);
    } else {
      let newOnPrisms = [] as Prism[];
      for (const prism of onPrisms) {
        const slices = cutOut(prism, ins.bounds);
        if (slices.length === 0) {
          newOnPrisms.push(prism);
          continue;
        };
        newOnPrisms.push(...slices);
        part2 -= BigInt(volume(intersection(prism, ins.bounds)));
      }
      console.log(`onPrisms grew by ${newOnPrisms.length - onPrisms.length}`);
      if (newOnPrisms.length - onPrisms.length < 0) {
        console.log(ins);
      }
      onPrisms = newOnPrisms;
    }
    //console.log(part2);
  });

  // Remove any remaining duplicates.
  onPrisms.forEach((a, i) => {
    onPrisms.slice(0, i).forEach((b) => {
      part2 -= BigInt(volume(intersection(a, b)));
    });
  });

  console.log(part2);
})();
