import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day08.txt';

(async () => {
  const entries = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n')
    .map(l =>
      l.split(' | ')
        .map(s => s
          .split(' ')
          .map(w => w.split('').sort().join(''))
        )
    );

  console.log('Part 1: ' + entries.reduce((sum, entry) =>
    sum + entry[1]!!.filter(w => [2, 3, 4, 7].includes(w.length)).length, 0)
  );

  console.log('Part 2: ' + entries.reduce((sum, entry) => {
    const map: {[key: string]: number} = {};
    const words = entry[0]!!.sort((a, b) => a.length - b.length);
    map[words[0]!!] = 1;
    map[words[1]!!] = 7;
    map[words[2]!!] = 4;
    map[words[9]!!] = 8;

    // Six segments.
    words.slice(6, 9).forEach(remaining => {
      const missing = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
        .filter(l => !remaining.includes(l))[0]!!;
      // Number of times the missing segment appears in 1, 7, and 4.
      const c = [0, 1, 2].reduce((c, n) =>
        c + Number(words[n]!!.includes(missing)), 0
      );
      if (c === 0) map[remaining] = 9;
      if (c === 1) map[remaining] = 0;
      if (c === 3) map[remaining] = 6;
    });

    // Five segments.
    words.slice(3, 6).forEach(remaining => {
      const missing = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
        .filter(l => !remaining.includes(l));
      // Total number of times the missing segments appears in 1, 7, and 4.
      const c = [0, 1, 2].reduce((c, n) =>
        c + missing.reduce((sum, m) => sum + Number(words[n]!!.includes(m)), 0),
        0
      );
      if (c === 1) map[remaining] = 3;
      if (c === 4) map[remaining] = 2;
      if (c === 3) map[remaining] = 5;
    });

    return sum + Number(entry[1]!!.reduce((acc, w) => acc + map[w]!!, ""));
  }, 0));
})();
