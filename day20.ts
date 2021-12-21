import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day20.txt';

const iterate = (
  image: Set<string>,
  algorithm: string[],
  defaultLit = false
): Set<string> => {
  const output = new Set<string>();

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  Array.from(image.values()).forEach(str => {
    const [x, y] = str.split(',').map(s => +s);
    minX = Math.min(minX, x!!);
    minY = Math.min(minY, y!!);
    maxX = Math.max(maxX, x!!);
    maxY = Math.max(maxY, y!!);
  });

  for (let x = minX - 1; x <= maxX + 1; ++x) {
    for (let y = minY - 1; y <= maxY + 1; ++y) {
      let binaryString = '';
      for (let j = -1; j <= 1; ++j) {
        for (let i = -1; i <= 1; ++i) {
          if (defaultLit &&
            (x + i < minX || x + i > maxX || y + j < minY || y + j > maxY)
          ) {
            binaryString += '1';
          } else {
            binaryString += (image.has(`${x + i},${y + j}`)) ? '1' : '0';
          }
        }
      }
      const index = parseInt(binaryString, 2);
      if (algorithm[index] === '#') output.add(`${x},${y}`);
    }
  }

  return output;
};

const run = (
  image: Set<string>,
  algorithm: string[],
  iterations: number
): Set<string> => {
  let defaultLit = (algorithm[0] === '#');
  for (let i = 0; i < iterations; ++i) {
    image = iterate(
      image,
      algorithm,
      defaultLit && (i % 2 === 1)
    );
  }
  return image;
};

(async () => {
  const [algorithmString, imgStrings] = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n\n');

  const algorithm = algorithmString!!.split('');
  let image = new Set<string>();
  imgStrings!!.split('\n').forEach((line, j) => {
    line.split('').forEach((char, i) => {
      if (char === '#') image.add(`${i},${j}`);
    });
  });

  image = run(image, algorithm, 2);
  console.log('Part 1: ' + image.size);

  image = run(image, algorithm, 48);
  console.log('Part 2: ' + image.size);
})();
