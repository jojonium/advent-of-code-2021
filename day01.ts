import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day01.txt';

(async () => {
  const nums = (await fsPromises.readFile(inputFile))
    .toString()
    .split('\n')
    .filter(s => s.length > 0)
    .map(val => parseInt(val))

  console.log('Part 1: ' +
    nums.filter((val, i, arr) => i > 0 && val > arr[i - 1]!!).length
  );

  console.log('Part 2: ' +
    nums.filter((_, i, arr) => i > 2 &&
      (arr[i]!! + arr[i - 1]!! + arr[i - 2]!!) >
      (arr[i - 1]!! + arr[i - 2]!! + arr[i - 3]!!)
    ).length
  );

})();
