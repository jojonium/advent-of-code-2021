import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day10.txt';

(async () => {
  const lines = (await fsPromises.readFile(inputFile))
    .toString()
    .trim()
    .split('\n');

  const {corrupted, incomplete} = lines.map((line) =>
    line.split('').reduce((state, char) =>
      ({
        '[': () => ({...state, stack: state.stack.concat(['['])}),
        '(': () => ({...state, stack: state.stack.concat(['('])}),
        '{': () => ({...state, stack: state.stack.concat(['{'])}),
        '<': () => ({...state, stack: state.stack.concat(['<'])}),
        ']': () => ({
          ...state,
          score: (state.score === 0 && state.stack.pop() !== '[')
            ? 57
            : state.score
        }),
        ')': () => ({
          ...state,
          score: (state.score === 0 && state.stack.pop() !== '(')
            ? 3
            : state.score
        }),
        '}': () => ({
          ...state,
          score: (state.score === 0 && state.stack.pop() !== '{')
            ? 1197
            : state.score
        }),
        '>': () => ({
          ...state,
          score: (state.score === 0 && state.stack.pop() !== '<')
            ? 25137
            : state.score
        }),
      })[char]!!(),
      {stack: new Array<string>(), score: 0})
  ).reduce((answers, lineInfo) => ({
    ...answers,
    corrupted: answers.corrupted + lineInfo.score,
    incomplete: answers.incomplete.concat(
      (lineInfo.score === 0)
        ? [lineInfo.stack.reduceRight((sum, char) =>
          sum * 5 + {'(': 1, '[': 2, '{': 3, '<': 4}[char]!!, 0)
        ]
        : []
    )
  }), {corrupted: 0, incomplete: new Array<number>()})

  console.log('Part 1: ' + corrupted);
  console.log('Part 2: ' +
    incomplete.sort((a, b) => a - b)[Math.floor(incomplete.length / 2)]
  );

})();
