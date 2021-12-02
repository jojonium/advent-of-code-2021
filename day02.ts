import {promises as fsPromises} from 'fs';

const inputFile = process.argv[2] ?? 'inputs/day02.txt';

(async () => {
  const lines = (await fsPromises.readFile(inputFile))
    .toString()
    .split('\n');

  const finalState1 = lines.reduce((state, line) => {
    const [ins, strAmt] = line.split(' ');
    const amount = parseInt(strAmt!!);
    if (ins === 'up') return {depth: state.depth - amount, x: state.x};
    if (ins === 'down') return {depth: state.depth + amount, x: state.x};
    if (ins === 'forward') return {depth: state.depth, x: state.x + amount};
    return state;
  }, {depth: 0, x: 0});
  console.log('Part 1: ' + finalState1.depth * finalState1.x);

  const finalState2 = lines.reduce((state, line) => {
    const [ins, strAmt] = line.split(' ');
    const amount = parseInt(strAmt!!);
    if (ins === 'up') return {...state, aim: state.aim - amount};
    if (ins === 'down') return {...state, aim: state.aim + amount};
    if (ins === 'forward') return {
      x: state.x + amount,
      depth: state.depth + (state.aim * amount),
      aim: state.aim
    };
    return state;
  }, {depth: 0, x: 0, aim: 0});
  console.log('Part 2: ' + finalState2.depth * finalState2.x);

})();
