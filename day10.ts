import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day10.txt';

(async () => {
  const lines = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n');

  const {corrupted, incomplete} = lines.reduce((answers, line) => {
    const {score, stack} = line.split('').reduce((state, char) => ({
      '[': () => ({...state, stack: state.stack.concat([char])}),
      '(': () => ({...state, stack: state.stack.concat([char])}),
      '{': () => ({...state, stack: state.stack.concat([char])}),
      '<': () => ({...state, stack: state.stack.concat([char])}),
      ']': () => ({
        ...state,
        score: state.score || (state.stack.pop() !== '[') ? 57 : 0
      }),
      ')': () => ({
        ...state,
        score: state.score || (state.stack.pop() !== '(') ? 3 : 0
      }),
      '}': () => ({
        ...state,
        score: state.score || (state.stack.pop() !== '{') ? 1197 : 0
      }),
      '>': () => ({
        ...state,
        score: state.score || (state.stack.pop() !== '<') ? 25137 : 0
      }),
    })[char]!!(),
      {stack: new Array<string>(), score: 0}
    );
    return {
      corrupted: answers.corrupted + score,
      incomplete: answers.incomplete.concat((score === 0)
        ? [stack.reduceRight((sum, char) => sum * 5 + ' ([{<'.indexOf(char), 0)]
        : []
      )
    };
  }, {corrupted: 0, incomplete: new Array<number>()});

  console.log('Part 1: ' + corrupted);
  console.log('Part 2: ' +
    incomplete.sort((a, b) => a - b)[Math.floor(incomplete.length / 2)]
  );

})();
