import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day04.txt';

(async () => {
  const [calls, ...boards] = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n\n')
    .map((block, i) => i === 0
      ? block.split(',')
      : block.split('\n').map(l => l.trim().split(/ +/))
    );

  // Parse into winnable lines.
  let boardMap: {lines: Map<string, boolean>[], won: boolean}[] = boards
    .map(b => [...b, ...b.map((_, i) => b.map(x => x[i]))])
    .map(board => ({
      lines: board.map(row =>
        Array.isArray(row) // Thanks TypeScript
          ? row.reduce(
            (map, elt) => map.set(String(elt), false),
            new Map<string, boolean>()
          )
          : new Map<string, boolean>()
      ),
      won: false
    }));

  let part1Done = false;
  for (let call of calls!!.map(s => String(s))) {
    boardMap = boardMap.filter(b => !b.won);
    for (const board of boardMap) {
      for (const line of board.lines) {
        // Mark the called number.
        if (line.has(call)) line.set(call, true)
        // See if we've won
        if (Array.from(line.values()).every(v => v)) {
          board.won = true;
          if (!part1Done) {
            console.log('Part 1: ' +
              board.lines
                .filter((_, i) => i < board.lines.length / 2)
                .reduce((sum, line) =>
                  sum + Array.from(line.entries())
                    .reduce((sum, [num, marked]) =>
                      sum + (marked ? 0 : +num),
                      0
                    ),
                  0
                ) * +call
            );
            part1Done = true;
          }
          if (boardMap.length === 1) {
            console.log('Part 2: ' +
              board.lines
                .filter((_, i) => i < board.lines.length / 2)
                .reduce((sum, line) =>
                  sum + Array.from(line.entries())
                    .reduce((sum, [num, marked]) =>
                      sum + (marked ? 0 : +num),
                      0
                    ),
                  0
                ) * +call
            );
            return;
          }
        }
      }
    }
  }
})();


